/*
 * CameraX background recording pattern adapted from xxxifan/DashCam (Apache License, Version 2.0).
 * Reference project: https://github.com/xxxifan/DashCam
 * Secondary reference for dual/concurrent structure: cairn-labworks/Sentry dashcam foreground service.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Modifications for Driver Dost:
 * - PHASE 1: Disabled loop-recording / cyclic auto-deletion; clips are saved as fixed, permanent timestamped files.
 * - PHASE 2: Added runtime concurrent dual-camera detection using CameraManager.getConcurrentCameraIds() (Android 11+/API 30+).
 *   When supported, records both front (cabin) and rear (road) cameras simultaneously into two synchronized clip files.
 *   When not supported, gracefully falls back to rear-camera-only with clear explanatory diagnostics without crashing.
 * - Foreground service with camera + microphone service types ensures continuous recording when screen is locked.
 */

package com.warraichgoods.driverdost.dashcam

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ConcurrentCamera
import androidx.camera.core.UseCaseGroup
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FallbackStrategy
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import com.warraichgoods.driverdost.MainActivity
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DashcamService : LifecycleService() {

    companion object {
        private const val TAG = "DashcamService"
        const val CHANNEL_ID = "driver_dost_dashcam_channel"
        const val NOTIFICATION_ID = 4321
        const val ACTION_START = "ACTION_START_RECORDING"
        const val ACTION_STOP = "ACTION_STOP_RECORDING"
        const val EXTRA_RECORDING_MODE = "EXTRA_RECORDING_MODE" // "auto", "dual", "rear"
    }

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null
    
    // Rear camera recording
    private var rearVideoCapture: VideoCapture<Recorder>? = null
    private var rearRecording: Recording? = null
    private var currentRearFile: File? = null

    // Front (Cabin) camera recording for Phase 2
    private var frontVideoCapture: VideoCapture<Recorder>? = null
    private var frontRecording: Recording? = null
    private var currentFrontFile: File? = null

    // Dual-camera status
    private var isDualActive = false
    private var isDualHardwareSupported = false
    private var dualFallbackReason: String? = null
    
    private var isRecording = false
    private var startTimeMillis: Long = 0L

    // Status listener callback
    private var statusListener: ((
        isRecording: Boolean, 
        elapsedSeconds: Long, 
        rearFile: String?, 
        frontFile: String?, 
        isDual: Boolean, 
        fallbackReason: String?
    ) -> Unit)? = null

    inner class LocalBinder : Binder() {
        fun getService(): DashcamService = this@DashcamService
    }

    override fun onBind(intent: Intent): IBinder {
        super.onBind(intent)
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        // Pre-evaluate concurrent camera support on service create
        val (supported, reason) = checkConcurrentCameraSupport(this)
        isDualHardwareSupported = supported
        dualFallbackReason = reason
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        when (intent?.action) {
            ACTION_START -> {
                val mode = intent.getStringExtra(EXTRA_RECORDING_MODE) ?: "auto"
                startForegroundServiceNotification(isDual = false)
                startDashcamRecording(mode)
            }
            ACTION_STOP -> {
                stopDashcamRecording()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    fun setStatusListener(listener: ((Boolean, Long, String?, String?, Boolean, String?) -> Unit)?) {
        this.statusListener = listener
    }

    fun isCurrentlyRecording(): Boolean = isRecording

    fun isDualModeActive(): Boolean = isDualActive

    fun isDualSupported(): Boolean = isDualHardwareSupported

    fun getFallbackReason(): String? = dualFallbackReason

    fun getElapsedSeconds(): Long {
        if (!isRecording || startTimeMillis == 0L) return 0L
        return (System.currentTimeMillis() - startTimeMillis) / 1000L
    }

    fun getCurrentRearFilePath(): String? = currentRearFile?.absolutePath

    fun getCurrentFrontFilePath(): String? = currentFrontFile?.absolutePath

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DriverDost:DashcamRecordingWakeLock").apply {
                setReferenceCounted(false)
                acquire(4 * 60 * 60 * 1000L) // 4 hours safety timeout
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire wake lock", e)
        }
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to release wake lock", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Driver Dost Dashcam Recording",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows persistent status while road and cabin dashcam is actively recording."
                enableVibration(false)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(elapsedText: String = "Recording active", isDual: Boolean = false): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val title = if (isDual) {
            "Driver Dost - ڈوئل ڈیش کیم آن ہے (Dual Dashcam)"
        } else {
            "Driver Dost - ڈیش کیم آن ہے (Road Dashcam)"
        }

        val content = if (isDual) {
            "روڈ اور کیبن ریکارڈنگ جاری ہے • $elapsedText"
        } else {
            "روڈ ویڈیو اور آڈیو ریکارڈنگ جاری ہے • $elapsedText"
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun startForegroundServiceNotification(isDual: Boolean) {
        val notification = buildNotification(isDual = isDual)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            } else {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA
            }
            startForeground(NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun updateNotification(elapsedSeconds: Long) {
        val minutes = elapsedSeconds / 60
        val seconds = elapsedSeconds % 60
        val timeStr = String.format(Locale.US, "%02d:%02d", minutes, seconds)
        val notification = buildNotification(elapsedText = timeStr, isDual = isDualActive)
        val manager = getSystemService(NotificationManager::class.java)
        manager?.notify(NOTIFICATION_ID, notification)
    }

    /**
     * Checks if the device hardware supports concurrent dual-camera streaming.
     * Evaluates CameraManager.getConcurrentCameraIds() on Android 11+ (API 30+).
     */
    fun checkConcurrentCameraSupport(ctx: Context): Pair<Boolean, String?> {
        val cameraManager = ctx.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            ?: return Pair(false, "CameraManager service not available on device")

        var hasFront = false
        var hasBack = false
        try {
            for (id in cameraManager.cameraIdList) {
                val chars = cameraManager.getCameraCharacteristics(id)
                val facing = chars.get(CameraCharacteristics.LENS_FACING)
                if (facing == CameraCharacteristics.LENS_FACING_FRONT) hasFront = true
                if (facing == CameraCharacteristics.LENS_FACING_BACK) hasBack = true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking camera lens facing", e)
            return Pair(false, "Failed to inspect camera characteristics: ${e.message}")
        }

        if (!hasFront || !hasBack) {
            return Pair(false, "Device hardware lacks required dual sensors (Front cabin + Rear road cameras are not both present).")
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return Pair(false, "Concurrent dual-camera streams require Android 11 (API 30) or above. Current device is Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT}).")
        }

        try {
            val concurrentSets = cameraManager.concurrentCameraIds
            if (concurrentSets.isEmpty()) {
                return Pair(false, "Device camera driver does not support concurrent camera sessions (CameraManager.getConcurrentCameraIds() returned empty).")
            }

            var supportsFrontAndBack = false
            for (combo in concurrentSets) {
                var comboHasFront = false
                var comboHasBack = false
                for (id in combo) {
                    val chars = cameraManager.getCameraCharacteristics(id)
                    val facing = chars.get(CameraCharacteristics.LENS_FACING)
                    if (facing == CameraCharacteristics.LENS_FACING_FRONT) comboHasFront = true
                    if (facing == CameraCharacteristics.LENS_FACING_BACK) comboHasBack = true
                }
                if (comboHasFront && comboHasBack) {
                    supportsFrontAndBack = true
                    break
                }
            }

            if (!supportsFrontAndBack) {
                return Pair(false, "Device hardware supports concurrent cameras for secondary lenses, but not simultaneous Front + Rear road capture.")
            }

            return Pair(true, null)
        } catch (e: Exception) {
            Log.e(TAG, "Error querying CameraManager concurrent camera IDs", e)
            return Pair(false, "Hardware query error: ${e.message}")
        }
    }

    private fun startDashcamRecording(mode: String) {
        if (isRecording) return

        val shouldAttemptDual = (mode == "dual" || mode == "auto")
        val (supported, reason) = checkConcurrentCameraSupport(this)
        isDualHardwareSupported = supported
        dualFallbackReason = reason

        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()

                // Check CameraX concurrent camera capability
                var canUseDual = false
                if (shouldAttemptDual && supported) {
                    try {
                        val availableConcurrent = cameraProvider.availableConcurrentCameraInfos
                        if (availableConcurrent.isNotEmpty()) {
                            canUseDual = true
                        } else {
                            dualFallbackReason = "CameraX concurrent camera bindings not supported by current camera HAL."
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "CameraX concurrent check exception", e)
                        dualFallbackReason = "CameraX concurrent camera query failed: ${e.message}"
                    }
                } else if (shouldAttemptDual && !supported) {
                    Log.i(TAG, "Dual camera requested but hardware not supported: $reason. Falling back to single rear camera.")
                }

                if (canUseDual) {
                    // Attempt Dual Camera Recording (Rear Road + Front Cabin as two separate synced clip files)
                    val dualSuccess = startDualRecording(cameraProvider)
                    if (!dualSuccess) {
                        Log.w(TAG, "Dual recording setup failed; falling back gracefully to single rear camera.")
                        dualFallbackReason = "Dual camera binding failed; defaulted to single road camera."
                        startSingleRearRecording(cameraProvider)
                    }
                } else {
                    // Standard Single Rear Camera Recording (Phase 1 behavior)
                    startSingleRearRecording(cameraProvider)
                }

            } catch (e: Exception) {
                Log.e(TAG, "CameraX initialization failed", e)
                isRecording = false
                isDualActive = false
                statusListener?.invoke(false, 0L, null, null, false, e.message)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    /**
     * Starts Dual Concurrent Recording:
     * We save two separate synced clip files:
     * - dashcam_rear_YYYY-MM-DD_HH-mm-ss.mp4
     * - dashcam_front_YYYY-MM-DD_HH-mm-ss.mp4
     * 
     * WHY TWO SEPARATE SYNCED FILES INSTEAD OF COMPOSITE PIP:
     * 1. Substantially more reliable: In-memory GPU Surface/OpenGL composition for dual 1080p/720p
     *    streams causes frequent encoder crashes (MediaCodec.CodecException) and severe thermal
     *    throttling on transport driver devices under direct windshield sunlight.
     * 2. Full uncompromised resolution: Road footage retains 100% field-of-view for license plates
     *    and signs, and Cabin footage retains clear facial/interior fidelity without overlapping or downscaling.
     * 3. Fault-isolation: If one sensor hiccups or drops frames, the other stream continues safely.
     */
    private fun startDualRecording(cameraProvider: ProcessCameraProvider): Boolean {
        try {
            val qualitySelector = QualitySelector.from(
                Quality.HD,
                FallbackStrategy.lowerQualityOrHigherThan(Quality.SD)
            )

            // 1. Rear Video Capture
            val rearRecorder = Recorder.Builder().setQualitySelector(qualitySelector).build()
            rearVideoCapture = VideoCapture.withOutput(rearRecorder)

            // 2. Front Video Capture
            val frontRecorder = Recorder.Builder().setQualitySelector(qualitySelector).build()
            frontVideoCapture = VideoCapture.withOutput(frontRecorder)

            val rearConfig = ConcurrentCamera.SingleCameraConfig(
                CameraSelector.DEFAULT_BACK_CAMERA,
                UseCaseGroup.Builder().addUseCase(rearVideoCapture!!).build(),
                this
            )

            val frontConfig = ConcurrentCamera.SingleCameraConfig(
                CameraSelector.DEFAULT_FRONT_CAMERA,
                UseCaseGroup.Builder().addUseCase(frontVideoCapture!!).build(),
                this
            )

            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(listOf(rearConfig, frontConfig))

            // Output files
            val videosDir = File(getExternalFilesDir(null), "dashcam").apply {
                if (!exists()) mkdirs()
            }
            val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date())
            val rearFile = File(videosDir, "dashcam_rear_$timestamp.mp4")
            val frontFile = File(videosDir, "dashcam_front_$timestamp.mp4")

            currentRearFile = rearFile
            currentFrontFile = frontFile

            val rearOutputOptions = FileOutputOptions.Builder(rearFile).build()
            val frontOutputOptions = FileOutputOptions.Builder(frontFile).build()

            // Rear records road video + microphone audio
            val pendingRear = rearVideoCapture?.output?.prepareRecording(this, rearOutputOptions)
                ?.withAudioEnabled()

            // Front records cabin video (audio already captured by rear to prevent hardware mic contention)
            val pendingFront = frontVideoCapture?.output?.prepareRecording(this, frontOutputOptions)

            startTimeMillis = System.currentTimeMillis()
            isRecording = true
            isDualActive = true

            // Start rear recording
            rearRecording = pendingRear?.start(ContextCompat.getMainExecutor(this)) { event ->
                handleRecordEvent(event, rearFile, isRear = true)
            }

            // Start front recording
            frontRecording = pendingFront?.start(ContextCompat.getMainExecutor(this)) { event ->
                handleRecordEvent(event, frontFile, isRear = false)
            }

            startForegroundServiceNotification(isDual = true)
            Log.i(TAG, "Dual dashcam recording started successfully: Rear=${rearFile.name}, Front=${frontFile.name}")
            return true

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start dual concurrent recording", e)
            return false
        }
    }

    /**
     * Fallback or default Single Rear Camera Recording.
     */
    private fun startSingleRearRecording(cameraProvider: ProcessCameraProvider) {
        val qualitySelector = QualitySelector.from(
            Quality.HD,
            FallbackStrategy.lowerQualityOrHigherThan(Quality.SD)
        )

        val recorder = Recorder.Builder()
            .setQualitySelector(qualitySelector)
            .build()

        rearVideoCapture = VideoCapture.withOutput(recorder)
        frontVideoCapture = null
        currentFrontFile = null
        isDualActive = false

        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(
            this,
            cameraSelector,
            rearVideoCapture
        )

        val videosDir = File(getExternalFilesDir(null), "dashcam").apply {
            if (!exists()) mkdirs()
        }

        val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date())
        val outputFile = File(videosDir, "dashcam_rear_$timestamp.mp4")
        currentRearFile = outputFile

        val outputOptions = FileOutputOptions.Builder(outputFile).build()
        val pendingRecording = rearVideoCapture?.output?.prepareRecording(this, outputOptions)
            ?.withAudioEnabled()

        startTimeMillis = System.currentTimeMillis()
        isRecording = true

        rearRecording = pendingRecording?.start(ContextCompat.getMainExecutor(this)) { event ->
            handleRecordEvent(event, outputFile, isRear = true)
        }

        startForegroundServiceNotification(isDual = false)
        Log.i(TAG, "Single road dashcam recording started: ${outputFile.name} (Dual fallback reason: $dualFallbackReason)")
    }

    private fun handleRecordEvent(event: VideoRecordEvent, file: File, isRear: Boolean) {
        when (event) {
            is VideoRecordEvent.Start -> {
                Log.i(TAG, "Clip recording start: ${file.name} (isRear: $isRear)")
                if (isRear) {
                    statusListener?.invoke(
                        true, 
                        0L, 
                        currentRearFile?.absolutePath, 
                        currentFrontFile?.absolutePath, 
                        isDualActive, 
                        dualFallbackReason
                    )
                }
            }
            is VideoRecordEvent.Status -> {
                val elapsed = getElapsedSeconds()
                if (isRear) {
                    updateNotification(elapsed)
                    statusListener?.invoke(
                        true, 
                        elapsed, 
                        currentRearFile?.absolutePath, 
                        currentFrontFile?.absolutePath, 
                        isDualActive, 
                        dualFallbackReason
                    )
                }
            }
            is VideoRecordEvent.Finalize -> {
                if (event.hasError()) {
                    Log.e(TAG, "Recording finalize error on ${file.name}: ${event.error}")
                } else {
                    Log.i(TAG, "Clip finalized: ${file.name} (size: ${file.length()} bytes)")
                }
                if (isRear) {
                    isRecording = false
                    statusListener?.invoke(
                        false, 
                        getElapsedSeconds(), 
                        currentRearFile?.absolutePath, 
                        currentFrontFile?.absolutePath, 
                        isDualActive, 
                        dualFallbackReason
                    )
                }
            }
        }
    }

    private fun stopDashcamRecording() {
        try {
            rearRecording?.stop()
            rearRecording = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping rear recording", e)
        }

        try {
            frontRecording?.stop()
            frontRecording = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping front recording", e)
        }

        isRecording = false
        val elapsed = getElapsedSeconds()
        statusListener?.invoke(
            false, 
            elapsed, 
            currentRearFile?.absolutePath, 
            currentFrontFile?.absolutePath, 
            isDualActive, 
            dualFallbackReason
        )
    }

    override fun onDestroy() {
        stopDashcamRecording()
        releaseWakeLock()
        super.onDestroy()
    }
}
