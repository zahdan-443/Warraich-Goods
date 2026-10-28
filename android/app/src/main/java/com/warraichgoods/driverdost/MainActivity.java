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
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;
import com.warraichgoods.driverdost.dashcam.DashcamPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Guarantee FirebaseApp is initialized before any plugin starts
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
            }
        } catch (Exception e) {
            try {
                FirebaseOptions options = new FirebaseOptions.Builder()
                    .setApiKey("AIzaSyCxp0Q7e5hZPgLCjSa32iG5d05tyTsAASY")
                    .setApplicationId("1:805249879186:android:341518d401d90735e5ea4b")
                    .setProjectId("warraich-goods")
                    .setGcmSenderId("805249879186")
                    .setStorageBucket("warraich-goods.firebasestorage.app")
                    .build();
                FirebaseApp.initializeApp(this, options);
            } catch (Exception ignored) {
            }
        }

        registerPlugin(FirebaseAuthenticationPlugin.class);
        registerPlugin(DashcamPlugin.class);
        super.onCreate(savedInstanceState);

        // Allow app to seamlessly draw behind the camera cutout / notch on Android 9+ (API 28+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Guarantee Android system status bar and navigation bar remain visible throughout the app
        ensureSystemBarsVisible();

        setupNativeBridge();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            ensureSystemBarsVisible();
        }
    }

    private void ensureSystemBarsVisible() {
        runOnUiThread(() -> {
            try {
                WindowInsetsControllerCompat insetsController =
                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                if (insetsController != null) {
                    insetsController.show(WindowInsetsCompat.Type.statusBars());
                    insetsController.show(WindowInsetsCompat.Type.navigationBars());
                }
            } catch (Exception e) {
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
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
            };

            getBridge().getWebView().addJavascriptInterface(bridgeInterface, "AndroidBridge");
            getBridge().getWebView().addJavascriptInterface(bridgeInterface, "AndroidPrinter");
        }
    }
}

