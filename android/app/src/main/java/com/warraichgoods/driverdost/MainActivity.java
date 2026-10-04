package com.warraichgoods.driverdost;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.warraichgoods.driverdost.dashcam.DashcamPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DashcamPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
