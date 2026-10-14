package com.warraichgoods.driverdost;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.warraichgoods.driverdost.dashcam.DashcamPlugin;
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;
import com.capacitorjs.plugins.filesystem.FilesystemPlugin;
import com.capacitorjs.plugins.share.SharePlugin;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    private boolean isFullScreen = true;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FirebaseAuthenticationPlugin.class);
        registerPlugin(FilesystemPlugin.class);
        registerPlugin(SharePlugin.class);
        registerPlugin(AppPlugin.class);
        registerPlugin(LocalNotificationsPlugin.class);
        registerPlugin(DashcamPlugin.class);
        super.onCreate(savedInstanceState);

        // Allow app to seamlessly draw behind the camera cutout / notch on Android 9+ (API 28+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Apply Immersive Fullscreen (Hides Battery Bar & Status Bar with ZERO permissions)
        applyFullScreen(true);

        setupNativeBridge();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && isFullScreen) {
            applyFullScreen(true);
        }
    }

    private void applyFullScreen(boolean enable) {
        isFullScreen = enable;
        runOnUiThread(() -> {
            try {
                WindowInsetsControllerCompat insetsController =
                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                if (insetsController != null) {
                    if (enable) {
                        insetsController.setSystemBarsBehavior(
                            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                        );
                        insetsController.hide(WindowInsetsCompat.Type.statusBars());
                    } else {
                        insetsController.show(WindowInsetsCompat.Type.statusBars());
                    }
                }
            } catch (Exception e) {
                if (enable) {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                } else {
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                }
            }
        });
    }

    private void setupNativeBridge() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            Object bridgeInterface = new Object() {
                @JavascriptInterface
                public void print() {
                    runOnUiThread(() -> {
                        try {
                            PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                            if (printManager != null && getBridge() != null && getBridge().getWebView() != null) {
                                PrintDocumentAdapter printAdapter = getBridge().getWebView().createPrintDocumentAdapter("Warraich_Goods_Bilty");
                                printManager.print("Warraich_Goods_Bilty", printAdapter, new PrintAttributes.Builder().build());
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    });
                }

                @JavascriptInterface
                public void setFullScreen(boolean enable) {
                    applyFullScreen(enable);
                }

                @JavascriptInterface
                public boolean isFullScreen() {
                    return isFullScreen;
                }

                @JavascriptInterface
                public void toggleFullScreen() {
                    applyFullScreen(!isFullScreen);
                }
            };

            getBridge().getWebView().addJavascriptInterface(bridgeInterface, "AndroidBridge");
            getBridge().getWebView().addJavascriptInterface(bridgeInterface, "AndroidPrinter");
        }
    }
}

