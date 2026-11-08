/*
 * DashcamPlugin for Capacitor - Driver Dost
 * Adapted from xxxifan/DashCam (Apache License 2.0).
 * Reference project: https://github.com/xxxifan/DashCam
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * 
 * Exposes native continuous background camera recording to the Web UI via Capacitor.
 * PHASE 1 FIX:
 * - CameraX is bound exclusively to DashcamService's custom CameraLifecycleOwner (RESUMED).
 * - Decoupled completely from Activity/UI lifecycle so video recording does not pause on screen lock.
 * - Single CameraX VideoCapture session multiplexes video and audio synchronously into one MP4 file.
 */

package com.warraichgoods.driverdost.dashcam

import android.Manifest
import android.content.ClipData
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

            dashcamService?.setStatusListener { isRecording, elapsedSeconds, rearFile, _, _, _ ->
                val data = JSObject().apply {
                    put("isRecording", isRecording)
                    put("elapsedSeconds", elapsedSeconds)
                    put("currentFile", rearFile ?: "")
                    put("currentRearFile", rearFile ?: "")
                    put("isDualMode", false)
                    put("dualSupported", false)
                    put("fallbackReason", "")
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

    @PluginMethod
    fun checkDualCameraSupport(call: PluginCall) {
        val result = JSObject().apply {
            put("supported", false)
            put("reason", "Phase 1: Single road dashcam active")
            put("apiLevel", Build.VERSION.SDK_INT)
            put("androidVersion", Build.VERSION.RELEASE)
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
            put("isDualMode", false)
            put("dualSupported", false)
            put("fallbackReason", "")
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

        try {
            val intent = Intent(context, DashcamService::class.java).apply {
                action = DashcamService.ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            bindDashcamService()

            val result = JSObject().apply {
                put("started", true)
                put("mode", "rear")
                put("dualSupported", false)
                put("fallbackReason", "")
                put("message", "Road dashcam background recording started with custom CameraLifecycleOwner")
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
                    val item = JSObject().apply {
                        put("id", filename)
                        put("filename", filename)
                        put("path", file.absolutePath)
                        put("sizeBytes", file.length())
                        put("durationSeconds", durationMs / 1000L)
                        put("dateFormatted", dateFormat.format(Date(file.lastModified())))
                        put("timestamp", file.lastModified())
                        put("cameraType", "rear")
                        put("pairId", filename.replace(".mp4", ""))
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

    @PluginMethod
    fun shareClip(call: PluginCall) {
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
            // content:// URI generated securely via FileProvider
            val contentUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                targetFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "video/mp4"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                clipData = ClipData.newRawUri("Driver Dost Dashcam", contentUri)
                putExtra(Intent.EXTRA_SUBJECT, "Driver Dost Dashcam: ${targetFile.name}")
                putExtra(Intent.EXTRA_TEXT, "Driver Dost Dashcam Video (${targetFile.name})")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            val chooser = Intent.createChooser(shareIntent, "Share Dashcam Video").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            // Explicitly grant read URI permission to apps resolving the share intent
            val resInfoList = context.packageManager.queryIntentActivities(chooser, PackageManager.MATCH_DEFAULT_ONLY)
            for (resolveInfo in resInfoList) {
                val pkgName = resolveInfo.activityInfo.packageName
                context.grantUriPermission(pkgName, contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(chooser)

            val result = JSObject().apply {
                put("success", true)
                put("contentUri", contentUri.toString())
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("SHARE_FAILED", e.localizedMessage, e)
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
