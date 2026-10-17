# Project specific ProGuard & R8 configuration rules

# 1. Line numbers & debugging attributes
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# 2. Capacitor Core & Plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public <methods>;
}

# Capacitor v3+ Annotations and Plugin Methods
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Official & Community Capacitor Plugins
-keep class com.capacitorjs.plugins.** { *; }
-dontwarn com.capacitorjs.plugins.**
-keep class io.capawesome.capacitorjs.plugins.** { *; }
-dontwarn io.capawesome.capacitorjs.plugins.**
-keep class io.capawesome.capacitorjs.plugins.firebase.authentication.** { *; }
-keep interface io.capawesome.capacitorjs.plugins.firebase.authentication.** { *; }
-keepclassmembers class io.capawesome.capacitorjs.plugins.firebase.authentication.** {
    public *;
    protected *;
}

# Native library used by @capacitor/filesystem
-keep class io.ionic.libs.** { *; }
-dontwarn io.ionic.libs.**
-dontwarn kotlinx.coroutines.**

# 3. WebView JavaScript Interfaces & Reflection
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
    public *;
}
-keep class android.webkit.** { *; }
-dontwarn android.webkit.**

# 4. AndroidX & Support Libraries
-keep class androidx.appcompat.** { *; }
-keep class androidx.coordinatorlayout.** { *; }
-keep class androidx.core.content.FileProvider { *; }
-dontwarn androidx.**

# 5. Firebase & Google Services (safe reflection for cloud auth & firestore)
-keepattributes *Annotation*
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.facebook.**
-dontwarn com.microsoft.**
-dontwarn com.twitter.**
-dontwarn com.yahoo.**
-dontwarn com.google.android.gms.games.**

# 6. Keep native activity entry point
-keep class com.warraichgoods.driverdost.MainActivity { *; }
