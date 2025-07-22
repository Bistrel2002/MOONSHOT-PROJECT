using System;
using System.Collections.Generic;
using UnityEngine;
using System.Collections;

[System.Serializable]
public class MinewBeaconData
{
    public string mac;
    public string name;
    public int rssi;
    public int battery;
    public string uuid;
    public int major;
    public int minor;
    public float estimatedDistance;
    
    public MinewBeaconData(string mac, string name, int rssi, int battery, string uuid = "", int major = 0, int minor = 0)
    {
        this.mac = mac;
        this.name = name;
        this.rssi = rssi;
        this.battery = battery;
        this.uuid = uuid;
        this.major = major;
        this.minor = minor;
        this.estimatedDistance = CalculateDistance(rssi);
    }
    
    private float CalculateDistance(int rssi)
    {
        if (rssi == 0) return -1.0f;
        
        // Simple distance estimation based on RSSI
        // This is an approximation and should be calibrated for your specific beacons
        float ratio = rssi * 1.0f / -59; // -59 dBm is typical RSSI at 1 meter
        if (ratio < 1.0)
        {
            return Mathf.Pow(ratio, 10);
        }
        else
        {
            return (0.89976f) * Mathf.Pow(ratio, 7.7095f) + 0.111f;
        }
    }
}

public class MinewBeaconManager : MonoBehaviour
{
    [Header("Beacon Configuration")]
    public bool autoStartScanning = true;
    public float scanUpdateInterval = 2.0f;
    public int rssiFilterThreshold = -80;
    
    [Header("Navigation Integration")]
    public newIndoorNav indoorNavigation;
    public bool enableBeaconNavigation = true;
    
    [Header("Debug")]
    public bool showDebugUI = true;
    public bool verboseLogging = true;
    
    // Events
    public System.Action<MinewBeaconData> OnBeaconDetected;
    public System.Action<MinewBeaconData> OnBeaconUpdated;
    public System.Action<string> OnError;
    
    // Private variables
    private AndroidJavaObject mtCentralManager;
    private AndroidJavaObject currentActivity;
    private AndroidJavaClass unityPlayer;
    private List<MinewBeaconData> detectedBeacons = new List<MinewBeaconData>();
    private bool isInitialized = false;
    private bool isScanning = false;
    private bool bluetoothEnabled = false;
    private Coroutine scanningCoroutine;
    
    void Start()
    {
        if (Application.platform == RuntimePlatform.Android)
        {
            InitializeMinewSDK();
            if (autoStartScanning)
            {
                StartCoroutine(DelayedStartScanning(1.0f));
            }
        }
        else
        {
            LogMessage("Minew Beacon scanning only works on Android platform");
        }
    }
    
    private IEnumerator DelayedStartScanning(float delay)
    {
        yield return new WaitForSeconds(delay);
        StartBeaconScanning();
    }
    
    private void InitializeMinewSDK()
    {
        LogMessage("=== Starting Minew SDK Initialization ===");
        
        try
        {
            LogMessage("Step 1: Getting Unity Player class...");
            unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            LogMessage("✅ Unity Player class obtained");
        }
        catch (System.Exception e)
        {
            LogError($"❌ Failed to get Unity Player class: {e.Message}");
            return;
        }
        
        try
        {
            LogMessage("Step 2: Getting current activity...");
            currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            
            if (currentActivity == null)
            {
                LogError("❌ Failed to get Unity current activity - currentActivity is null");
                return;
            }
            LogMessage("✅ Unity activity obtained successfully");
        }
        catch (System.Exception e)
        {
            LogError($"❌ Exception getting current activity: {e.Message}");
            return;
        }
        
        try
        {
            LogMessage("Step 3: Loading MTCentralManager class...");
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            
            if (mtCentralManagerClass == null)
            {
                LogError("❌ Failed to load MTCentralManager class - class is null");
                return;
            }
            LogMessage("✅ MTCentralManager class loaded successfully");
            
            LogMessage("Step 4: Calling MTCentralManager.getInstance()...");
            mtCentralManager = mtCentralManagerClass.CallStatic<AndroidJavaObject>("getInstance", currentActivity);
            
            if (mtCentralManager == null)
            {
                LogError("❌ MTCentralManager.getInstance() returned null");
                LogError("   Possible causes:");
                LogError("   - Missing permissions");
                LogError("   - Bluetooth service unavailable");
                LogError("   - SDK requires additional setup");
                return;
            }
            LogMessage("✅ MTCentralManager instance obtained successfully");
            
        }
        catch (System.Exception e)
        {
            LogError($"❌ Exception in MTCentralManager setup: {e.Message}");
            LogError($"   Stack trace: {e.StackTrace}");
            LogError("   This usually means:");
            LogError("   - MTBeaconPlus.aar not properly integrated");
            LogError("   - Missing dependencies"); 
            LogError("   - Wrong SDK version");
            OnError?.Invoke(e.Message);
            return;
        }
        
        try
        {
            LogMessage("Step 5: Setting up listener...");
            SetupMTCentralManagerListener();
            LogMessage("✅ Listener setup completed");
        }
        catch (System.Exception e)
        {
            LogError($"❌ Failed to setup listener: {e.Message}");
            // Continue anyway, maybe scanning can work without listener
        }
        
        try
        {
            LogMessage("Step 6: Starting MTCentralManager service...");
            mtCentralManager.Call("startService");
            LogMessage("✅ MTCentralManager service started");
        }
        catch (System.Exception e)
        {
            LogError($"❌ Failed to start service: {e.Message}");
            // Continue anyway, maybe service is already running
        }
        
        try
        {
            LogMessage("Step 7: Checking Bluetooth status...");
            CheckBluetoothStatus();
            LogMessage("✅ Bluetooth status check completed");
        }
        catch (System.Exception e)
        {
            LogError($"❌ Failed to check Bluetooth: {e.Message}");
            // Continue anyway
        }
        
        isInitialized = true;
        LogMessage("🎉 SDK initialization completed successfully!");
        LogMessage("=== End SDK Initialization ===");
    }
    
    private void SetupMTCentralManagerListener()
    {
        try
        {
            LogMessage("Setting up MTCentralManager listener...");
            
            // Create a listener using AndroidJavaProxy
            // This allows us to implement the Java interface from Unity
            MTCentralManagerListenerProxy listenerProxy = new MTCentralManagerListenerProxy(this);
            
            // Set the listener on MTCentralManager
            mtCentralManager.Call("setMTCentralManagerListener", listenerProxy);
            
            LogMessage("MTCentralManager listener set successfully");
        }
        catch (System.Exception e)
        {
            LogError($"Failed to set up MTCentralManager listener: {e.Message}");
        }
    }
    
    // This method will be called by our listener proxy when peripherals are detected
    public void OnPeripheralsDetected(AndroidJavaObject[] peripherals)
    {
        try
        {
            LogMessage($"OnPeripheralsDetected called with {peripherals.Length} peripherals");
            
            List<MinewBeaconData> newBeacons = new List<MinewBeaconData>();
            
            foreach (AndroidJavaObject peripheral in peripherals)
            {
                MinewBeaconData beaconData = ProcessMTPeripheral(peripheral);
                if (beaconData != null)
                {
                    newBeacons.Add(beaconData);
                }
            }
            
            // Update our detected beacons list
            UpdateBeaconsList(newBeacons);
            
        }
        catch (System.Exception e)
        {
            LogError($"Error processing detected peripherals: {e.Message}");
        }
    }
    
    private MinewBeaconData ProcessMTPeripheral(AndroidJavaObject mtPeripheral)
    {
        try
        {
            // Get the MTFrameHandler from the MTPeripheral
            AndroidJavaObject frameHandler = mtPeripheral.Get<AndroidJavaObject>("mMTFrameHandler");
            
            if (frameHandler == null)
            {
                LogMessage("MTFrameHandler is null for peripheral");
                return null;
            }
            
            // Extract basic beacon information
            string mac = frameHandler.Call<string>("getMac");
            string name = frameHandler.Call<string>("getName");
            int rssi = frameHandler.Call<int>("getRssi");
            int battery = frameHandler.Call<int>("getBattery");
            long lastUpdate = frameHandler.Call<long>("getLastUpdate");
            
            if (string.IsNullOrEmpty(mac))
            {
                LogMessage("Peripheral has no MAC address, skipping");
                return null;
            }
            
            LogMessage($"Processing peripheral: MAC={mac}, Name={name}, RSSI={rssi}");
            
            // Get advertisement frames
            AndroidJavaObject advFrames = frameHandler.Call<AndroidJavaObject>("getAdvFrames");
            
            FrameData frameData = ProcessAdvFrames(advFrames);
            
            // Create beacon data object
            MinewBeaconData beaconData = new MinewBeaconData(mac, name, rssi, battery, frameData.uuid, frameData.major, frameData.minor);
            
            return beaconData;
            
        }
        catch (System.Exception e)
        {
            LogError($"Error processing MTPeripheral: {e.Message}");
            return null;
        }
    }
    
    private struct FrameData
    {
        public string uuid;
        public int major;
        public int minor;
        
        public FrameData(string uuid, int major, int minor)
        {
            this.uuid = uuid;
            this.major = major;
            this.minor = minor;
        }
    }
    
    private FrameData ProcessAdvFrames(AndroidJavaObject advFrames)
    {
        string uuid = "";
        int major = 0;
        int minor = 0;
        
        if (advFrames == null)
        {
            LogMessage("AdvFrames is null, returning empty frame data");
            return new FrameData(uuid, major, minor);
        }
        
        try
        {
            // The advFrames should be an ArrayList<MinewFrame>
            int frameCount = advFrames.Call<int>("size");
            LogMessage($"Processing {frameCount} advertisement frames");
            
            for (int i = 0; i < frameCount; i++)
            {
                AndroidJavaObject frame = advFrames.Call<AndroidJavaObject>("get", i);
                
                if (frame != null)
                {
                    // Check frame type
                    AndroidJavaObject frameType = frame.Call<AndroidJavaObject>("getFrameType");
                    string frameTypeName = frameType.Call<string>("name");
                    
                    LogMessage($"Frame {i}: Type = {frameTypeName}");
                    
                    if (frameTypeName == "FrameiBeacon")
                    {
                        // This is an iBeacon frame, extract UUID, Major, Minor
                        uuid = frame.Call<string>("getUuid");
                        major = frame.Call<int>("getMajor");
                        minor = frame.Call<int>("getMinor");
                        
                        LogMessage($"iBeacon found: UUID={uuid}, Major={major}, Minor={minor}");
                        break; // We found an iBeacon frame, that's what we need
                    }
                }
            }
        }
        catch (System.Exception e)
        {
            LogMessage($"Error processing advertisement frames: {e.Message}");
        }
        
        return new FrameData(uuid, major, minor);
    }
    
    private void UpdateBeaconsList(List<MinewBeaconData> newBeacons)
    {
        try
        {
            // Clear the old list
            var previousBeacons = new Dictionary<string, MinewBeaconData>();
            foreach (var beacon in detectedBeacons)
            {
                previousBeacons[beacon.mac] = beacon;
            }
            
            detectedBeacons.Clear();
            
            // Add new beacons and trigger events
            foreach (var beacon in newBeacons)
            {
                if (beacon.rssi >= rssiFilterThreshold) // Apply RSSI filter
                {
                    detectedBeacons.Add(beacon);
                    
                    if (previousBeacons.ContainsKey(beacon.mac))
                    {
                        // Existing beacon updated
                        OnBeaconUpdated?.Invoke(beacon);
                    }
                    else
                    {
                        // New beacon detected
                        OnBeaconDetected?.Invoke(beacon);
                        LogMessage($"New beacon detected: {beacon.name} (MAC: {beacon.mac}, RSSI: {beacon.rssi})");
                    }
                }
            }
            
            LogMessage($"Updated beacon list: {detectedBeacons.Count} beacons");
            
        }
        catch (System.Exception e)
        {
            LogError($"Error updating beacons list: {e.Message}");
        }
    }
    
    private void CheckBluetoothStatus()
    {
        try
        {
            AndroidJavaClass bluetoothManagerClass = new AndroidJavaClass("android.bluetooth.BluetoothManager");
            AndroidJavaObject bluetoothManager = currentActivity.Call<AndroidJavaObject>("getSystemService", "bluetooth");
            
            if (bluetoothManager != null)
            {
                AndroidJavaObject bluetoothAdapter = bluetoothManager.Call<AndroidJavaObject>("getAdapter");
                if (bluetoothAdapter != null)
                {
                    bluetoothEnabled = bluetoothAdapter.Call<bool>("isEnabled");
                    LogMessage($"Bluetooth enabled: {bluetoothEnabled}");
                }
            }
        }
        catch (System.Exception e)
        {
            LogError($"Error checking Bluetooth status: {e.Message}");
        }
    }
    
    public void StartBeaconScanning()
    {
        if (!isInitialized)
        {
            LogError("SDK not initialized. Cannot start scanning.");
            return;
        }
        
        if (!bluetoothEnabled)
        {
            LogError("Bluetooth is not enabled. Please enable Bluetooth to scan for beacons.");
            return;
        }
        
        try
        {
            LogMessage("Starting beacon scanning...");
            
            // Request permissions
            RequestPermissions();
            
            // Start scanning with MTCentralManager
            mtCentralManager.Call("startScan");
            isScanning = true;
            
            // Start the scanning coroutine for periodic updates
            if (scanningCoroutine != null)
            {
                StopCoroutine(scanningCoroutine);
            }
            scanningCoroutine = StartCoroutine(ScanningLoop());
            
            LogMessage("Beacon scanning started successfully");
        }
        catch (System.Exception e)
        {
            LogError($"Error starting beacon scan: {e.Message}");
            OnError?.Invoke(e.Message);
        }
    }
    
    public void StopBeaconScanning()
    {
        if (!isInitialized) return;
        
        try
        {
            LogMessage("Stopping beacon scanning...");
            
            mtCentralManager.Call("stopScan");
            isScanning = false;
            
            if (scanningCoroutine != null)
            {
                StopCoroutine(scanningCoroutine);
                scanningCoroutine = null;
            }
            
            LogMessage("Beacon scanning stopped");
        }
        catch (System.Exception e)
        {
            LogError($"Error stopping beacon scan: {e.Message}");
        }
    }
    
    private IEnumerator ScanningLoop()
    {
        while (isScanning)
        {
            UpdateDetectedBeacons();
            yield return new WaitForSeconds(scanUpdateInterval);
        }
    }
    
    private void UpdateDetectedBeacons()
    {
        if (!isInitialized || !isScanning) return;
        
        try
        {
            // With the proper listener in place, we mainly need to verify scanning status
            // The real beacon detection happens in the OnPeripheralsDetected callback
            
            bool currentScanStatus = mtCentralManager.Call<bool>("isScanning");
            if (currentScanStatus != isScanning)
            {
                isScanning = currentScanStatus;
                LogMessage($"Scan status updated: {isScanning}");
            }
            
            // Log current status for debugging
            LogMessage($"Scanning active: {isScanning}, Detected beacons: {detectedBeacons.Count}");
            
            if (isScanning && detectedBeacons.Count == 0)
            {
                LogMessage("Scanner is active but no beacons detected yet. Check: beacon power, distance (<10m), permissions");
            }
            
        }
        catch (System.Exception e)
        {
            LogError($"Error in UpdateDetectedBeacons: {e.Message}");
        }
    }
    
    private void RequestPermissions()
    {
        try
        {
            AndroidJavaClass permissionClass = new AndroidJavaClass("androidx.core.content.ContextCompat");
            AndroidJavaClass activityCompatClass = new AndroidJavaClass("androidx.core.app.ActivityCompat");
            
            string[] permissions = {
                "android.permission.ACCESS_FINE_LOCATION",
                "android.permission.ACCESS_COARSE_LOCATION",
                "android.permission.BLUETOOTH_SCAN",
                "android.permission.BLUETOOTH_CONNECT"
            };
            
            List<string> permissionsToRequest = new List<string>();
            
            foreach (string permission in permissions)
            {
                int result = permissionClass.CallStatic<int>("checkSelfPermission", currentActivity, permission);
                if (result != 0) // PackageManager.PERMISSION_GRANTED = 0
                {
                    permissionsToRequest.Add(permission);
                }
            }
            
            if (permissionsToRequest.Count > 0)
            {
                LogMessage($"Requesting {permissionsToRequest.Count} permissions");
                activityCompatClass.CallStatic("requestPermissions", currentActivity, permissionsToRequest.ToArray(), 1001);
            }
            else
            {
                LogMessage("All required permissions already granted");
            }
        }
        catch (System.Exception e)
        {
            LogError($"Error requesting permissions: {e.Message}");
        }
    }
    
    // Public API methods
    public List<MinewBeaconData> GetDetectedBeacons()
    {
        return new List<MinewBeaconData>(detectedBeacons);
    }
    
    public MinewBeaconData GetClosestBeacon()
    {
        MinewBeaconData closest = null;
        float closestDistance = float.MaxValue;
        
        foreach (var beacon in detectedBeacons)
        {
            if (beacon.estimatedDistance < closestDistance && beacon.estimatedDistance > 0)
            {
                closest = beacon;
                closestDistance = beacon.estimatedDistance;
            }
        }
        
        return closest;
    }
    
    public List<MinewBeaconData> GetBeaconsInRange(float maxDistance)
    {
        List<MinewBeaconData> nearbyBeacons = new List<MinewBeaconData>();
        
        foreach (var beacon in detectedBeacons)
        {
            if (beacon.estimatedDistance <= maxDistance && beacon.estimatedDistance > 0)
            {
                nearbyBeacons.Add(beacon);
            }
        }
        
        nearbyBeacons.Sort((a, b) => a.estimatedDistance.CompareTo(b.estimatedDistance));
        return nearbyBeacons;
    }
    
    // Navigation integration
    public void NavigateToBeacon(string beaconMac)
    {
        if (!enableBeaconNavigation || indoorNavigation == null)
        {
            LogMessage("Beacon navigation is disabled or indoor navigation not assigned");
            return;
        }
        
        var beacon = detectedBeacons.Find(b => b.mac == beaconMac);
        if (beacon != null)
        {
            LogMessage($"Navigating to beacon: {beacon.name} ({beacon.mac})");
            // Here you would integrate with your existing navigation system
            // This could involve setting a navigation target based on beacon position
        }
    }
    
    // Public properties for external access
    public bool IsInitialized => isInitialized;
    public bool IsScanning => isScanning;
    public bool IsBluetoothEnabled => bluetoothEnabled;
    
    // Utility methods
    private void LogMessage(string message)
    {
        if (verboseLogging)
        {
            Debug.Log($"[MinewBeaconManager] {message}");
        }
    }
    
    private void LogError(string message)
    {
        Debug.LogError($"[MinewBeaconManager] {message}");
    }
    
    // Debug UI
    private void OnGUI()
    {
        if (!showDebugUI) return;
        
        GUILayout.BeginArea(new Rect(10, 320, 400, 200));
        GUILayout.Box("Minew Beacon Manager", GUILayout.Width(380));
        
        GUILayout.Label($"Initialized: {isInitialized}");
        GUILayout.Label($"Bluetooth: {(bluetoothEnabled ? "Enabled" : "Disabled")}");
        GUILayout.Label($"Scanning: {isScanning}");
        GUILayout.Label($"Detected Beacons: {detectedBeacons.Count}");
        
        GUILayout.BeginHorizontal();
        if (GUILayout.Button(isScanning ? "Stop Scan" : "Start Scan"))
        {
            if (isScanning)
                StopBeaconScanning();
            else
                StartBeaconScanning();
        }
        
        if (GUILayout.Button("Check Bluetooth"))
        {
            CheckBluetoothStatus();
        }
        GUILayout.EndHorizontal();
        
        // Display detected beacons
        foreach (var beacon in detectedBeacons)
        {
            GUILayout.Label($"{beacon.name}: {beacon.rssi}dBm, {beacon.estimatedDistance:F1}m");
        }
        
        GUILayout.EndArea();
    }
    
    private void OnDestroy()
    {
        StopBeaconScanning();
        
        if (mtCentralManager != null)
        {
            try
            {
                mtCentralManager.Call("stopService");
            }
            catch (System.Exception e)
            {
                LogError($"Error stopping service: {e.Message}");
            }
        }
    }
    
    private void OnApplicationPause(bool pauseStatus)
    {
        if (pauseStatus)
        {
            if (isScanning)
            {
                StopBeaconScanning();
            }
        }
        else
        {
            if (autoStartScanning && isInitialized && bluetoothEnabled)
            {
                StartCoroutine(DelayedStartScanning(1.0f));
            }
        }
    }
}

// Android Java Proxy class to implement MTCentralManagerListener
public class MTCentralManagerListenerProxy : AndroidJavaProxy
{
    private MinewBeaconManager beaconManager;
    
    public MTCentralManagerListenerProxy(MinewBeaconManager manager) : base("com.minew.beaconplus.sdk.interfaces.MTCentralManagerListener")
    {
        beaconManager = manager;
    }
    
    // This method will be called by the MTCentralManager when peripherals are scanned
    public void onScanedPeripheral(AndroidJavaObject peripherals)
    {
        try
        {
            if (peripherals != null && beaconManager != null)
            {
                // Convert the List<MTPeripheral> to an array
                int count = peripherals.Call<int>("size");
                AndroidJavaObject[] peripheralArray = new AndroidJavaObject[count];
                
                for (int i = 0; i < count; i++)
                {
                    peripheralArray[i] = peripherals.Call<AndroidJavaObject>("get", i);
                }
                
                // Call our beacon manager to process the peripherals
                beaconManager.OnPeripheralsDetected(peripheralArray);
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[MTCentralManagerListenerProxy] Error in onScanedPeripheral: {e.Message}");
        }
    }
}