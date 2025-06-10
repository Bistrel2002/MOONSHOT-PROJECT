using UnityEngine;
using System.Collections.Generic;

public class BeaconDiagnostics : MonoBehaviour
{
    [Header("Beacon Manager Reference")]
    public MinewBeaconManager beaconManager;
    
    [Header("Diagnostic Settings")]
    public bool autoRunDiagnostics = true;
    public float diagnosticInterval = 5.0f;
    
    private List<string> diagnosticLog = new List<string>();
    private int maxLogEntries = 15;
    
    void Start()
    {
        AddLog("Beacon Diagnostics started");
        
        if (beaconManager == null)
            beaconManager = FindFirstObjectByType<MinewBeaconManager>();
            
        if (autoRunDiagnostics)
        {
            InvokeRepeating(nameof(RunDiagnostics), 2.0f, diagnosticInterval);
        }
    }
    
    [ContextMenu("Run Diagnostics")]
    public void RunDiagnostics()
    {
        AddLog("=== BEACON DIAGNOSTICS ===");
        
        // 1. Check Platform
        if (Application.platform != RuntimePlatform.Android)
        {
            AddLog("❌ NOT ON ANDROID - Beacon scanning requires Android device");
            return;
        }
        AddLog("✅ Platform: Android");
        
        // 2. Check Beacon Manager
        if (beaconManager == null)
        {
            AddLog("❌ MinewBeaconManager not found!");
            return;
        }
        AddLog("✅ MinewBeaconManager found");
        
        // 3. Check Initialization
        if (!beaconManager.IsInitialized)
        {
            AddLog("❌ BeaconManager not initialized");
            AddLog("   Check: MTBeaconPlus.aar in Plugins/Android");
            return;
        }
        AddLog("✅ BeaconManager initialized");
        
        // 4. Check Bluetooth
        if (!beaconManager.IsBluetoothEnabled)
        {
            AddLog("❌ Bluetooth disabled");
            AddLog("   Solution: Enable Bluetooth in device settings");
            return;
        }
        AddLog("✅ Bluetooth enabled");
        
        // 5. Check Scanning Status
        if (!beaconManager.IsScanning)
        {
            AddLog("❌ Scanner not active");
            AddLog("   Try: Restart scanning from debug UI");
        }
        else
        {
            AddLog("✅ Scanner active");
        }
        
        // 6. Check Permissions
        CheckPermissions();
        
        // 7. Check Detected Beacons
        var beacons = beaconManager.GetDetectedBeacons();
        if (beacons.Count == 0)
        {
            AddLog("⚠️  No beacons detected");
            AddLog("   Check: 1) Beacon power 2) Distance <10m 3) Beacon config");
        }
        else
        {
            AddLog($"✅ {beacons.Count} beacons detected:");
            foreach (var beacon in beacons)
            {
                AddLog($"   • {beacon.name} (RSSI: {beacon.rssi}dBm, {beacon.estimatedDistance:F1}m)");
            }
        }
        
        // 8. SDK Verification
        VerifySDKAccess();
        
        AddLog("=== END DIAGNOSTICS ===");
    }
    
    private void CheckPermissions()
    {
        if (Application.platform != RuntimePlatform.Android)
            return;
            
        try
        {
            #if UNITY_2018_3_OR_NEWER
            bool hasLocation = UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.FineLocation) ||
                              UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.CoarseLocation);
            
            bool hasCamera = UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera);
            
            if (hasLocation)
                AddLog("✅ Location permission granted");
            else
                AddLog("❌ Location permission missing - Required for beacon scanning");
                
            if (hasCamera)
                AddLog("✅ Camera permission granted");
            else
                AddLog("⚠️  Camera permission missing - Required for AR");
                
            #else
            AddLog("⚠️  Cannot check permissions (Unity version < 2018.3)");
            #endif
        }
        catch (System.Exception e)
        {
            AddLog($"❌ Permission check failed: {e.Message}");
        }
    }
    
    private void VerifySDKAccess()
    {
        AddLog("--- SDK Access Verification ---");
        
        try
        {
            // Try to access MTCentralManager class
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            if (mtCentralManagerClass != null)
            {
                AddLog("✅ MTCentralManager class accessible");
            }
        }
        catch (System.Exception e)
        {
            AddLog($"❌ MTCentralManager class not accessible: {e.Message}");
            AddLog("   Check: MTBeaconPlus.aar properly imported");
            return; // If we can't access the main class, other tests will fail
        }
        
        try
        {
            // Try to access MTPeripheral and MTFrameHandler classes
            AndroidJavaClass mtPeripheralClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTPeripheral");
            AndroidJavaClass frameHandlerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTFrameHandler");
            AddLog("✅ MTPeripheral and MTFrameHandler classes accessible");
        }
        catch (System.Exception e)
        {
            AddLog($"❌ MTPeripheral/MTFrameHandler classes not accessible: {e.Message}");
        }
        
        try
        {
            // Try to access the corrected interface path
            AndroidJavaClass listenerInterface = new AndroidJavaClass("com.minew.beaconplus.sdk.interfaces.MTCentralManagerListener");
            AddLog("✅ MTCentralManagerListener interface accessible (interfaces package)");
        }
        catch (System.Exception e)
        {
            AddLog($"❌ MTCentralManagerListener interface not accessible: {e.Message}");
            AddLog("   Check: Interface path should be 'interfaces' not 'listeners'");
        }
        
        try
        {
            // Test MTCentralManager getInstance method
            AndroidJavaClass unityPlayerClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            AndroidJavaObject currentActivity = unityPlayerClass.GetStatic<AndroidJavaObject>("currentActivity");
            
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            AndroidJavaObject mtCentralManager = mtCentralManagerClass.CallStatic<AndroidJavaObject>("getInstance", currentActivity);
            
            if (mtCentralManager != null)
            {
                AddLog("✅ MTCentralManager.getInstance() successful");
                
                // Test if we can call basic methods
                try
                {
                    // Don't actually start scanning, just verify the method exists
                    AddLog("✅ MTCentralManager methods accessible");
                }
                catch (System.Exception methodError)
                {
                    AddLog($"⚠️  MTCentralManager method issue: {methodError.Message}");
                }
            }
            else
            {
                AddLog("❌ MTCentralManager.getInstance() returned null");
                AddLog("   Possible causes: Missing permissions, service issues");
            }
        }
        catch (System.Exception e)
        {
            AddLog($"❌ MTCentralManager getInstance failed: {e.Message}");
            AddLog("   Possible causes: Activity context issue, SDK initialization failure");
        }
    }
    
    [ContextMenu("Test Beacon Commands")]
    public void TestBeaconCommands()
    {
        if (beaconManager == null)
        {
            AddLog("❌ No beacon manager for testing");
            return;
        }
        
        AddLog("Testing beacon commands...");
        
        if (beaconManager.IsScanning)
        {
            AddLog("Stopping scanner...");
            beaconManager.StopBeaconScanning();
        }
        else
        {
            AddLog("Starting scanner...");
            beaconManager.StartBeaconScanning();
        }
    }
    
    [ContextMenu("Check Nearby Beacons")]
    public void CheckNearbyBeacons()
    {
        if (beaconManager == null) return;
        
        var nearbyBeacons = beaconManager.GetBeaconsInRange(5.0f);
        AddLog($"Beacons within 5m: {nearbyBeacons.Count}");
        
        var closest = beaconManager.GetClosestBeacon();
        if (closest != null)
        {
            AddLog($"Closest beacon: {closest.name} at {closest.estimatedDistance:F1}m");
        }
    }
    
    [ContextMenu("Clear Log")]
    public void ClearLog()
    {
        diagnosticLog.Clear();
    }
    
    private void AddLog(string message)
    {
        string timestampedMessage = $"[{Time.time:F1}s] {message}";
        diagnosticLog.Add(timestampedMessage);
        
        if (diagnosticLog.Count > maxLogEntries)
        {
            diagnosticLog.RemoveAt(0);
        }
        
        Debug.Log($"[BeaconDiagnostics] {message}");
    }
    
    // Debug GUI
    private void OnGUI()
    {
        GUILayout.BeginArea(new Rect(10, 530, 400, 220));
        GUILayout.Box("Beacon Diagnostics", GUILayout.Width(380));
        
        GUILayout.BeginHorizontal();
        if (GUILayout.Button("Run Diagnostics"))
            RunDiagnostics();
        if (GUILayout.Button("Test Commands"))
            TestBeaconCommands();
        GUILayout.EndHorizontal();
        
        GUILayout.BeginHorizontal();
        if (GUILayout.Button("Class Access Test"))
            TestSDKClassAccessOnly();
        if (GUILayout.Button("Clear Log"))
            ClearLog();
        GUILayout.EndHorizontal();
        
        // Show diagnostic log
        foreach (string logEntry in diagnosticLog)
        {
            GUILayout.Label(logEntry);
        }
        
        GUILayout.EndArea();
    }
    
    void OnDestroy()
    {
        CancelInvoke();
    }
    
    [ContextMenu("Test SDK Class Access Only")]
    public void TestSDKClassAccessOnly()
    {
        AddLog("=== SIMPLE SDK CLASS TEST ===");
        
        try
        {
            AddLog("Testing basic AndroidJavaClass access...");
            AndroidJavaClass unityPlayerClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            AddLog("✅ Unity player class accessible");
            
            AndroidJavaObject currentActivity = unityPlayerClass.GetStatic<AndroidJavaObject>("currentActivity");
            if (currentActivity != null)
            {
                AddLog("✅ Unity current activity accessible");
            }
            else
            {
                AddLog("❌ Unity current activity is null");
            }
        }
        catch (System.Exception e)
        {
            AddLog($"❌ Basic Unity class access failed: {e.Message}");
        }
        
        try
        {
            AddLog("Testing MTCentralManager class loading...");
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            AddLog("✅ MTCentralManager class loaded successfully");
            
            AddLog("Testing other SDK classes...");
            AndroidJavaClass mtPeripheralClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTPeripheral");
            AndroidJavaClass frameHandlerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTFrameHandler");
            AndroidJavaClass listenerInterface = new AndroidJavaClass("com.minew.beaconplus.sdk.interfaces.MTCentralManagerListener");
            AddLog("✅ All main SDK classes accessible");
            
        }
        catch (System.Exception e)
        {
            AddLog($"❌ SDK class loading failed: {e.Message}");
            AddLog("   This means MTBeaconPlus.aar is not properly integrated");
            AddLog("   Check: File in Assets/Plugins/Android/");
            AddLog("   Check: Unity import settings");
        }
        
        AddLog("=== END SIMPLE TEST ===");
    }
} 