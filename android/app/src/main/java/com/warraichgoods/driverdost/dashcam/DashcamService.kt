/*
 * CameraX background recording pattern adapted from xxxifan/DashCam (Apache License, Version 2.0).
 * Reference project: https://github.com/xxxifan/DashCam
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Modifications:
 * - Disabled loop-recording / cyclic auto-deletion; clips are saved as fixed, permanent timestamped files.
 * - Integrated as a native Capacitor foreground service for Driver Dost logistics app.
 * - Video + Audio recording continues when screen is locked or user switches apps.
 */

package com.warraichgoods.driverdost.dashcam

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.IBinder
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
    }

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null
    private var videoCapture: VideoCapture<Recorder>? = null
    private var currentRecording: Recording? = null
    private var isRecording = false
    private var startTimeMillis: Long = 0L
    private var currentFile: File? = null
    private var statusListener: ((isRecording: Boolean, elapsedSeconds: Long, currentFile: String?) -> Unit)? = null

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
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        when (intent?.action) {
            ACTION_START -> {
                startForegroundServiceNotification()
                startCameraXRecording()
            }
            ACTION_STOP -> {
                stopCameraXRecording()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    fun setStatusListener(listener: ((Boolean, Long, String?) -> Unit)?) {
        this.statusListener = listener
    }

    fun isCurrentlyRecording(): Boolean = isRecording

    fun getElapsedSeconds(): Long {
        if (!isRecording || startTimeMillis == 0L) return 0L
        return (System.currentTimeMillis() - startTimeMillis) / 1000L
    }

    fun getCurrentFilePath(): String? = currentFile?.absolutePath

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DriverDost:DashcamRecordingWakeLock").apply {
                setReferenceCounted(false)
                acquire(4 * 60 * 60 * 1000L) // 4 hours maximum safety timeout
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
                description = "Shows persistent status while road dashcam is actively recording."
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

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Driver Dost - ڈیش کیم آن ہے")
            .setContentText("روڈ ویڈیو اور آڈیو ریکارڈنگ جاری ہے • $elapsedText")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setOngoing(true)
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
            startForeground(NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun startCameraXRecording() {
        if (isRecording) return

        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()

                val qualitySelector = QualitySelector.from(
                    Quality.HD,
                    FallbackStrategy.lowerQualityOrHigherThan(Quality.SD)
                )

                val recorder = Recorder.Builder()
                    .setQualitySelector(qualitySelector)
                    .build()

                videoCapture = VideoCapture.withOutput(recorder)

                // Select rear camera (CameraSelector.DEFAULT_BACK_CAMERA)
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this, // LifecycleService acts as LifecycleOwner
                    cameraSelector,
                    videoCapture
                )

                // Fixed timestamped output file (NO AUTO-DELETE / NO LOOP PURGE)
                val videosDir = File(getExternalFilesDir(null), "dashcam").apply {
                    if (!exists()) mkdirs()
                }

                val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date())
                val outputFile = File(videosDir, "dashcam_$timestamp.mp4")
                currentFile = outputFile

                val outputOptions = FileOutputOptions.Builder(outputFile).build()

                val pendingRecording = videoCapture?.output?.prepareRecording(this, outputOptions)
                    ?.withAudioEnabled()

                startTimeMillis = System.currentTimeMillis()
                isRecording = true

                currentRecording = pendingRecording?.start(ContextCompat.getMainExecutor(this)) { event ->
                    when (event) {
                        is VideoRecordEvent.Start -> {
                            Log.i(TAG, "Dashcam recording started: ${outputFile.name}")
                            statusListener?.invoke(true, 0L, outputFile.absolutePath)
                        }
                        is VideoRecordEvent.Status -> {
                            val elapsed = getElapsedSeconds()
                            statusListener?.invoke(true, elapsed, outputFile.absolutePath)
                        }
                        is VideoRecordEvent.Finalize -> {
                            isRecording = false
                            if (event.hasError()) {
                                Log.e(TAG, "Dashcam recording finalize error: ${event.error}")
                            } else {
                                Log.i(TAG, "Dashcam clip saved: ${outputFile.absolutePath} (size: ${outputFile.length()} bytes)")
                            }
                            statusListener?.invoke(false, getElapsedSeconds(), outputFile.absolutePath)
                        }
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "CameraX initialization failed", e)
                isRecording = false
                statusListener?.invoke(false, 0L, null)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun stopCameraXRecording() {
        try {
            currentRecording?.stop()
            currentRecording = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recording", e)
        } finally {
            isRecording = false
            statusListener?.invoke(false, getElapsedSeconds(), currentFile?.absolutePath)
        }
    }

    override fun onDestroy() {
        stopCameraXRecording()
        releaseWakeLock()
        super.onDestroy()
    }
}
