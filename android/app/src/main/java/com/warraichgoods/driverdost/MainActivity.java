package com.warraichgoods.driverdost;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import com.warraichgoods.driverdost.dashcam.DashcamPlugin;
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;
import com.capacitorjs.plugins.filesystem.FilesystemPlugin;
import com.capacitorjs.plugins.share.SharePlugin;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FirebaseAuthenticationPlugin.class);
        registerPlugin(FilesystemPlugin.class);
        registerPlugin(SharePlugin.class);
        registerPlugin(AppPlugin.class);
        registerPlugin(LocalNotificationsPlugin.class);
        registerPlugin(DashcamPlugin.class);
        super.onCreate(savedInstanceState);

        setupPrinter();
    }

    private void setupPrinter() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new Object() {
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
            }, "AndroidPrinter");
        }
    }
}
