/*
 * CameraX background recording pattern adapted from xxxifan/DashCam (Apache License, Version 2.0).
 * Reference project: https://github.com/xxxifan/DashCam
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * 
 * Modifications for Driver Dost (Phase 1 Fix):
 * - Fixed screen-lock video pausing bug: CameraX is bound to a custom CameraLifecycleOwner
 *   managed directly by this Foreground Service and maintained in Lifecycle.State.RESUMED
 *   throughout the entire recording duration, completely decoupled from Activity/UI lifecycle
 *   and screen lock/display events.
 * - Single Recording session: Audio and Video are both driven by the same CameraX VideoCapture
 *   recording session (withAudioEnabled), writing continuous synchronized video + audio into
 *   a single timestamped MP4 file.
 * - Foreground Service with FOREGROUND_SERVICE_TYPE_CAMERA and FOREGROUND_SERVICE_TYPE_MICROPHONE.
 * - PARTIAL_WAKE_LOCK to prevent CPU sleep during screen lock.
 */

package com.warraichgoods.driverdost.dashcam

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.camera.core.CameraSelector
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
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import com.warraichgoods.driverdost.MainActivity
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Custom LifecycleOwner dedicated exclusively to CameraX background recording.
 * Controlled and kept in Lifecycle.State.RESUMED by DashcamService for the entire
 * duration recording is active — independent of whatever state the Activity/UI is in.
 *
 * When screen locks, Activity enters onPause/onStop, but this CameraLifecycleOwner
 * stays firmly in RESUMED, keeping CameraX camera pipelines and video encoders active.
 */
class CameraLifecycleOwner : LifecycleOwner {
    private val lifecycleRegistry: LifecycleRegistry = LifecycleRegistry(this)

    override val lifecycle: Lifecycle
        get() = lifecycleRegistry

    init {
        // Initialize at CREATED state
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
    }

    /**
     * Advances lifecycle to STARTED and RESUMED.
     * Must be called so CameraX activates and keeps the capture session open.
     */
    fun startAndResume() {
        if (!lifecycleRegistry.currentState.isAtLeast(Lifecycle.State.STARTED)) {
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        }
        if (!lifecycleRegistry.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
        }
        Log.i("CameraLifecycleOwner", "Custom camera lifecycle transitioned to RESUMED (state=${lifecycleRegistry.currentState})")
    }

    /**
     * Transitions lifecycle through ON_PAUSE, ON_STOP, ON_DESTROY
     * to safely release camera hardware when recording actually stops.
     */
    fun stopAndDestroy() {
        if (lifecycleRegistry.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        }
        if (lifecycleRegistry.currentState.isAtLeast(Lifecycle.State.STARTED)) {
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        }
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        Log.i("CameraLifecycleOwner", "Custom camera lifecycle transitioned to DESTROYED")
    }
}

/**
 * Foreground Service for background dashcam recording.
 * Holds its own CameraLifecycleOwner, Wakelock, and single VideoCapture session.
 */
class DashcamService : Service() {

    companion object {
        private const val TAG = "DashcamService"
        const val CHANNEL_ID = "driver_dost_dashcam_channel"
        const val NOTIFICATION_ID = 4321
        const val ACTION_START = "ACTION_START_RECORDING"
        const val ACTION_STOP = "ACTION_STOP_RECORDING"
        const val EXTRA_RECORDING_MODE = "EXTRA_RECORDING_MODE"
    }

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null
    
    // Custom LifecycleOwner held in RESUMED state independent of Activity
    private var cameraLifecycleOwner: CameraLifecycleOwner? = null

    // Rear camera recording session
    private var rearVideoCapture: VideoCapture<Recorder>? = null
    private var rearRecording: Recording? = null
    private var currentRearFile: File? = null

    private var isRecording = false
    private var startTimeMillis: Long = 0L

    // Status listener callback to communicate with DashcamPlugin
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
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
    }

    private var stopSelfPending = false
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                stopSelfPending = false
                startForegroundServiceNotification()
                startSingleRearRecording()
            }
            ACTION_STOP -> {
                stopDashcamRecording(stopSelfAfter = true)
            }
        }
        return START_STICKY
    }

    fun setStatusListener(listener: ((Boolean, Long, String?, String?, Boolean, String?) -> Unit)?) {
        this.statusListener = listener
    }

    fun isCurrentlyRecording(): Boolean = isRecording

    fun getElapsedSeconds(): Long {
        if (!isRecording || startTimeMillis == 0L) return 0L
        return (System.currentTimeMillis() - startTimeMillis) / 1000L
    }

    fun getCurrentRearFilePath(): String? = currentRearFile?.absolutePath

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (wakeLock == null) {
                wakeLock = powerManager?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DriverDost:DashcamRecordingWakeLock")?.apply {
                    setReferenceCounted(false)
                }
            }
            if (wakeLock?.isHeld != true) {
                wakeLock?.acquire(4 * 60 * 60 * 1000L) // 4 hours safety timeout
                Log.i(TAG, "Acquired PARTIAL_WAKE_LOCK for continuous recording during screen lock")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire wake lock", e)
        }
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
                Log.i(TAG, "Released WakeLock")
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
                description = "Shows persistent status while road dashcam is actively recording in background."
                enableVibration(false)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(elapsedText: String = "Recording active"): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val title = "Driver Dost - ڈیش کیم آن ہے (Road Dashcam)"
        val content = "روڈ ویڈیو اور آڈیو ریکارڈنگ جاری ہے • $elapsedText"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.presence_video_online)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun startForegroundServiceNotification() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            } else {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA
            }
            androidx.core.app.ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun updateNotification(elapsedSeconds: Long) {
        val minutes = elapsedSeconds / 60
        val seconds = elapsedSeconds % 60
        val timeStr = String.format(Locale.US, "%02d:%02d", minutes, seconds)
        val notification = buildNotification(elapsedText = timeStr)
        val manager = getSystemService(NotificationManager::class.java)
        manager?.notify(NOTIFICATION_ID, notification)
    }

    /**
     * Phase 1 Fix: Single Road Camera Recording bound strictly to the custom
     * CameraLifecycleOwner. Both audio and video are driven by the SAME Recording
     * session from rearVideoCapture, ensuring uninterrupted recording across screen locks.
     */
    private fun startSingleRearRecording() {
        if (isRecording) return

        acquireWakeLock()
        startForegroundServiceNotification()

        // Clean up any previous lifecycle
        cameraLifecycleOwner?.stopAndDestroy()
        val lifecycleOwner = CameraLifecycleOwner().apply {
            startAndResume()
        }
        cameraLifecycleOwner = lifecycleOwner

        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                cameraProvider.unbindAll()

                val qualitySelector = QualitySelector.from(
                    Quality.HD,
                    FallbackStrategy.lowerQualityOrHigherThan(Quality.SD)
                )

                val recorder = Recorder.Builder()
                    .setQualitySelector(qualitySelector)
                    .build()

                rearVideoCapture = VideoCapture.withOutput(recorder)

                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                // 1. Bind to our custom CameraLifecycleOwner (maintained in RESUMED state)
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    rearVideoCapture
                )

                // 2. Prepare permanent output file in external app storage
                val videosDir = File(getExternalFilesDir(null), "dashcam").apply {
                    if (!exists()) mkdirs()
                }

                val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date())
                val outputFile = File(videosDir, "dashcam_rear_$timestamp.mp4")
                currentRearFile = outputFile

                val outputOptions = FileOutputOptions.Builder(outputFile).build()

                // 3. Single Recording session handles BOTH video and audio synchronously
                val prepared = rearVideoCapture?.output?.prepareRecording(this, outputOptions)
                val hasAudioPerm = ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.RECORD_AUDIO
                ) == PackageManager.PERMISSION_GRANTED

                val pendingRecording = if (hasAudioPerm) {
                    prepared?.withAudioEnabled()
                } else {
                    Log.w(TAG, "Audio permission missing; proceeding with video-only recording")
                    prepared
                }

                startTimeMillis = System.currentTimeMillis()
                isRecording = true

                // 4. Start unified recording session
                rearRecording = pendingRecording?.start(ContextCompat.getMainExecutor(this)) { event ->
                    handleRecordEvent(event, outputFile)
                }

                Log.i(TAG, "Single road dashcam recording started with custom CameraLifecycleOwner: ${outputFile.name}")

            } catch (e: Exception) {
                Log.e(TAG, "CameraX initialization failed", e)
                isRecording = false
                cameraLifecycleOwner?.stopAndDestroy()
                cameraLifecycleOwner = null
                statusListener?.invoke(false, 0L, null, null, false, e.message)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun handleRecordEvent(event: VideoRecordEvent, file: File) {
        when (event) {
            is VideoRecordEvent.Start -> {
                Log.i(TAG, "Clip recording start: ${file.name}")
                statusListener?.invoke(
                    true, 
                    0L, 
                    currentRearFile?.absolutePath, 
                    null, 
                    false, 
                    null
                )
            }
            is VideoRecordEvent.Status -> {
                val elapsed = getElapsedSeconds()
                updateNotification(elapsed)
                statusListener?.invoke(
                    true, 
                    elapsed, 
                    currentRearFile?.absolutePath, 
                    null, 
                    false, 
                    null
                )
            }
            is VideoRecordEvent.Finalize -> {
                if (event.hasError()) {
                    Log.e(TAG, "Recording finalize error on ${file.name}: ${event.error}")
                } else {
                    Log.i(TAG, "Clip finalized: ${file.name} (size: ${file.length()} bytes)")
                }
                isRecording = false
                cleanUpRecordingResources()

                statusListener?.invoke(
                    false, 
                    getElapsedSeconds(), 
                    currentRearFile?.absolutePath, 
                    null, 
                    false, 
                    null
                )

                if (stopSelfPending) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                    stopSelf()
                }
            }
        }
    }

    private fun cleanUpRecordingResources() {
        cameraLifecycleOwner?.stopAndDestroy()
        cameraLifecycleOwner = null
        releaseWakeLock()
    }

    fun stopDashcamRecording(stopSelfAfter: Boolean = false) {
        stopSelfPending = stopSelfAfter

        if (rearRecording != null) {
            try {
                // Signal recording stop. CameraX will flush data and emit VideoRecordEvent.Finalize
                rearRecording?.stop()
                rearRecording = null
            } catch (e: Exception) {
                Log.e(TAG, "Error stopping rear recording", e)
                cleanUpRecordingResources()
            }

            // Fallback safety timeout (3.5s) in case VideoRecordEvent.Finalize does not arrive
            mainHandler.postDelayed({
                if (isRecording || cameraLifecycleOwner != null) {
                    Log.w(TAG, "Finalize safety timeout triggered; cleaning up resources")
                    isRecording = false
                    cleanUpRecordingResources()
                    if (stopSelfPending) {
                        stopForeground(STOP_FOREGROUND_REMOVE)
                        stopSelf()
                    }
                }
            }, 3500L)
        } else {
            cleanUpRecordingResources()
            isRecording = false
            if (stopSelfPending) {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }

        val elapsed = getElapsedSeconds()
        statusListener?.invoke(
            false, 
            elapsed, 
            currentRearFile?.absolutePath, 
            null, 
            false, 
            null
        )
    }

    override fun onDestroy() {
        stopDashcamRecording(stopSelfAfter = false)
        super.onDestroy()
    }
}
