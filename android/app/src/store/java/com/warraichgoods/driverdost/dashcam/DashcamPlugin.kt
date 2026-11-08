package com.warraichgoods.driverdost.dashcam

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Store flavor stub for DashcamPlugin.
 * Meets Google Play Store / Palm Store guidelines by:
 * 1. Requesting ZERO camera or microphone permissions.
 * 2. Having no native CameraX dependencies or background recording services.
 * 3. Gracefully responding to any Web calls as unavailable/disabled.
 */
@CapacitorPlugin(name = "Dashcam")
class DashcamPlugin : Plugin() {

    @PluginMethod
    fun checkDualCameraSupport(call: PluginCall) {
        val result = JSObject().apply {
            put("supported", false)
            put("reason", "Dashcam module is not enabled in this store release.")
        }
        call.resolve(result)
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val result = JSObject().apply {
            put("isRecording", false)
            put("elapsedSeconds", 0L)
            put("currentFile", "")
            put("currentRearFile", "")
            put("isDualMode", false)
            put("dualSupported", false)
            put("fallbackReason", "Store release")
        }
        call.resolve(result)
    }

    @PluginMethod
    fun startRecording(call: PluginCall) {
        call.reject("FEATURE_UNAVAILABLE", "Dashcam recording is not enabled in this build.")
    }

    @PluginMethod
    fun stopRecording(call: PluginCall) {
        val result = JSObject().apply {
            put("stopped", true)
            put("message", "Dashcam is not active in this build.")
        }
        call.resolve(result)
    }

    @PluginMethod
    fun listClips(call: PluginCall) {
        val result = JSObject().apply {
            put("clips", JSArray())
            put("totalCount", 0)
        }
        call.resolve(result)
    }

    @PluginMethod
    fun deleteClip(call: PluginCall) {
        call.reject("FEATURE_UNAVAILABLE", "Dashcam recording is not enabled in this build.")
    }

    @PluginMethod
    fun playClip(call: PluginCall) {
        call.reject("FEATURE_UNAVAILABLE", "Dashcam recording is not enabled in this build.")
    }

    @PluginMethod
    fun shareClip(call: PluginCall) {
        call.reject("FEATURE_UNAVAILABLE", "Dashcam recording is not enabled in this build.")
    }
}
