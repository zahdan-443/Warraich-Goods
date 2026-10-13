package com.warraichgoods.driverdost;

import android.os.Bundle;
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
    }
}
