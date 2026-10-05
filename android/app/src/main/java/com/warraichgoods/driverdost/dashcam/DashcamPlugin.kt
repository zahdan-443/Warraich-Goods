/*
 * DashcamPlugin for Capacitor - Driver Dost
 * Adapted from xxxifan/DashCam (Apache License 2.0).
 * Reference project: https://github.com/xxxifan/DashCam
 * Secondary reference for dual camera foreground service: cairn-labworks/Sentry
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * 
 * Exposes native continuous background camera-recording to the Web UI via Capacitor.
 * PHASE 2: Concurrent Dual-Camera streaming (Front Cabin + Rear Road) using CameraManager.getConcurrentCameraIds().
 */

package com.warraichgoods.driverdost.dashcam

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.IBinder
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@CapacitorPlugin(
    name = "Dashcam",
    permissions = [
        Permission(
            strings = [Manifest.permission.CAMERA],
            alias = "camera"
        ),
        Permission(
            strings = [Manifest.permission.RECORD_AUDIO],
            alias = "microphone"
        )
    ]
)
class DashcamPlugin : Plugin() {

    private var dashcamService: DashcamService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            val localBinder = binder as? DashcamService.LocalBinder
            dashcamService = localBinder?.getService()
            isBound = true

            dashcamService?.setStatusListener { isRecording, elapsedSeconds, rearFile, frontFile, isDual, fallbackReason ->
                val data = JSObject().apply {
                    put("isRecording", isRecording)
                    put("elapsedSeconds", elapsedSeconds)
                    put("currentFile", rearFile ?: "")
                    put("currentRearFile", rearFile ?: "")
                    put("currentFrontFile", frontFile ?: "")
                    put("isDualMode", isDual)
                    put("dualSupported", dashcamService?.isDualSupported() ?: false)
                    put("fallbackReason", fallbackReason ?: "")
                }
                notifyListeners("recordingStatusChange", data)
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            dashcamService = null
            isBound = false
        }
    }

    override fun load() {
        super.load()
        bindDashcamService()
    }

    private fun bindDashcamService() {
        try {
            val intent = Intent(context, DashcamService::class.java)
            context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Phase 2: Runtime capability check for concurrent dual camera support.
     * Evaluates CameraManager.getConcurrentCameraIds() on Android 11+ (API 30+).
     */
    @PluginMethod
    fun checkDualCameraSupport(call: PluginCall) {
        val service = dashcamService
        val result = JSObject()
        if (service != null) {
            val (supported, reason) = service.checkConcurrentCameraSupport(context)
            result.put("supported", supported)
            result.put("reason", reason ?: "")
            result.put("apiLevel", Build.VERSION.SDK_INT)
            result.put("androidVersion", Build.VERSION.RELEASE)
        } else {
            // Standalone check without bound service
            val tempService = DashcamService()
            val (supported, reason) = tempService.checkConcurrentCameraSupport(context)
            result.put("supported", supported)
            result.put("reason", reason ?: "")
            result.put("apiLevel", Build.VERSION.SDK_INT)
            result.put("androidVersion", Build.VERSION.RELEASE)
        }
        call.resolve(result)
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val service = dashcamService
        val result = JSObject().apply {
            put("isRecording", service?.isCurrentlyRecording() ?: false)
            put("elapsedSeconds", service?.getElapsedSeconds() ?: 0L)
            put("currentFile", service?.getCurrentRearFilePath() ?: "")
            put("currentRearFile", service?.getCurrentRearFilePath() ?: "")
            put("currentFrontFile", service?.getCurrentFrontFilePath() ?: "")
            put("isDualMode", service?.isDualModeActive() ?: false)
            put("dualSupported", service?.isDualSupported() ?: false)
            put("fallbackReason", service?.getFallbackReason() ?: "")
        }
        call.resolve(result)
    }

    @PluginMethod
    fun startRecording(call: PluginCall) {
        // Verify runtime camera and audio permissions first
        val hasCamera = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        val hasAudio = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

        if (!hasCamera || !hasAudio) {
            call.reject("PERMISSION_DENIED", "Camera and microphone permissions are required to start dashcam recording.")
            return
        }

        val mode = call.getString("mode") ?: "auto"

        try {
            val intent = Intent(context, DashcamService::class.java).apply {
                action = DashcamService.ACTION_START
                putExtra(DashcamService.EXTRA_RECORDING_MODE, mode)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            bindDashcamService()

            val service = dashcamService
            val isDualSupp = service?.isDualSupported() ?: false

            val result = JSObject().apply {
                put("started", true)
                put("mode", mode)
                put("dualSupported", isDualSupp)
                put("fallbackReason", service?.getFallbackReason() ?: "")
                put("message", if (isDualSupp && mode != "rear") "Dual-camera dashcam recording initiated" else "Road dashcam recording initiated")
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("START_FAILED", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun stopRecording(call: PluginCall) {
        try {
            val intent = Intent(context, DashcamService::class.java).apply {
                action = DashcamService.ACTION_STOP
            }
            context.startService(intent)

            val result = JSObject().apply {
                put("stopped", true)
                put("message", "Dashcam recording stopped")
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("STOP_FAILED", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun listClips(call: PluginCall) {
        try {
            val clipsDir = File(context.getExternalFilesDir(null), "dashcam")
            val clipsArray = JSArray()

            if (clipsDir.exists() && clipsDir.isDirectory) {
                val files = clipsDir.listFiles { file -> file.isFile && file.name.endsWith(".mp4") }
                    ?.sortedByDescending { it.lastModified() }
                    ?: emptyList()

                val retriever = MediaMetadataRetriever()
                val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

                for (file in files) {
                    var durationMs = 0L
                    try {
                        retriever.setDataSource(file.absolutePath)
                        val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                        durationMs = durationStr?.toLongOrNull() ?: 0L
                    } catch (_: Exception) {}

                    val filename = file.name
                    val cameraType = when {
                        filename.contains("_front_") -> "front"
                        filename.contains("_rear_") -> "rear"
                        else -> "single"
                    }

                    // Extract synced timestamp ID if available e.g. dashcam_rear_2026-10-04_14-32-10.mp4 -> 2026-10-04_14-32-10
                    val pairId = filename
                        .replace("dashcam_rear_", "")
                        .replace("dashcam_front_", "")
                        .replace("dashcam_", "")
                        .replace(".mp4", "")

                    val item = JSObject().apply {
                        put("id", filename)
                        put("filename", filename)
                        put("path", file.absolutePath)
                        put("sizeBytes", file.length())
                        put("durationSeconds", durationMs / 1000L)
                        put("dateFormatted", dateFormat.format(Date(file.lastModified())))
                        put("timestamp", file.lastModified())
                        put("cameraType", cameraType)
                        put("pairId", pairId)
                    }
                    clipsArray.put(item)
                }

                try {
                    retriever.release()
                } catch (_: Exception) {}
            }

            val result = JSObject().apply {
                put("clips", clipsArray)
                put("totalCount", clipsArray.length())
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("LIST_FAILED", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun deleteClip(call: PluginCall) {
        val path = call.getString("path")
        val filename = call.getString("filename")

        if (path.isNullOrEmpty() && filename.isNullOrEmpty()) {
            call.reject("INVALID_PARAMS", "File path or filename must be provided")
            return
        }

        try {
            val file = if (!path.isNullOrEmpty()) {
                File(path)
            } else {
                File(File(context.getExternalFilesDir(null), "dashcam"), filename!!)
            }

            if (file.exists() && file.delete()) {
                call.resolve(JSObject().apply { put("success", true) })
            } else {
                call.reject("DELETE_FAILED", "Could not delete clip file.")
            }
        } catch (e: Exception) {
            call.reject("DELETE_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun playClip(call: PluginCall) {
        val path = call.getString("path")
        val filename = call.getString("filename")

        val targetFile = if (!path.isNullOrEmpty()) {
            File(path)
        } else if (!filename.isNullOrEmpty()) {
            File(File(context.getExternalFilesDir(null), "dashcam"), filename)
        } else null

        if (targetFile == null || !targetFile.exists()) {
            call.reject("FILE_NOT_FOUND", "Video file not found")
            return
        }

        try {
            val contentUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                targetFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "video/mp4")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("PLAY_FAILED", e.localizedMessage, e)
        }
    }

    override fun handleOnDestroy() {
        if (isBound) {
            try {
                context.unbindService(serviceConnection)
            } catch (_: Exception) {}
            isBound = false
        }
        super.handleOnDestroy()
    }
}
