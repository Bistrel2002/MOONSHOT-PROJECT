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
        try
        {
            LogMessage("Initializing Minew Beacon SDK...");
            
            // Get Unity Player and current activity
            unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            
            // Get MTCentralManager instance
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            mtCentralManager = mtCentralManagerClass.CallStatic<AndroidJavaObject>("getInstance", currentActivity);
            
            if (mtCentralManager != null)
            {
                LogMessage("MTCentralManager initialized successfully");
                
                // Start the service
                mtCentralManager.Call("startService");
                
                // Check Bluetooth status
                CheckBluetoothStatus();
                
                isInitialized = true;
            }
            else
            {
                LogError("Failed to get MTCentralManager instance");
            }
        }
        catch (System.Exception e)
        {
            LogError($"Error initializing Minew SDK: {e.Message}");
            OnError?.Invoke(e.Message);
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
            LogMessage("Updating beacon data...");
            
            // Create a simple beacon data retrieval approach
            // Since Unity-Android Java interop is complex for listeners, we'll use a polling approach
            
            // Get scanning status
            bool currentScanStatus = mtCentralManager.Call<bool>("isScanning");
            if (currentScanStatus != isScanning)
            {
                isScanning = currentScanStatus;
                LogMessage($"Scan status updated: {isScanning}");
            }
            
            // For demonstration purposes, let's create some test beacon data
            // In a real implementation, you would need to:
            // 1. Get the peripheral list from MTCentralManager
            // 2. Process each peripheral's MTFrameHandler
            // 3. Extract beacon data from advertisement frames
            
            // This is a simplified test implementation
            ProcessTestBeaconData();
            
        }
        catch (System.Exception e)
        {
            LogError($"Error updating beacons: {e.Message}");
        }
    }
    
    private void ProcessTestBeaconData()
    {
        // This is a test method - replace with actual MTCentralManager peripheral processing
        // For now, we'll simulate finding a beacon to test the system
        
        if (Time.time > 10.0f && detectedBeacons.Count == 0) // Add test beacon after 10 seconds
        {
            MinewBeaconData testBeacon = new MinewBeaconData(
                "AA:BB:CC:DD:EE:FF", 
                "Test MBM01 Beacon", 
                -65, 
                85, 
                "550e8400-e29b-41d4-a716-446655440000", 
                1, 
                100
            );
            
            detectedBeacons.Add(testBeacon);
            OnBeaconDetected?.Invoke(testBeacon);
            LogMessage($"Test beacon added: {testBeacon.name}");
        }
        
        // Update existing beacon RSSI (simulate movement)
        foreach (var beacon in detectedBeacons)
        {
            // Simulate RSSI fluctuation
            int oldRssi = beacon.rssi;
            beacon.rssi = oldRssi + UnityEngine.Random.Range(-3, 4);
            beacon.estimatedDistance = CalculateDistance(beacon.rssi);
            
            OnBeaconUpdated?.Invoke(beacon);
        }
    }
    
    private float CalculateDistance(int rssi)
    {
        if (rssi == 0) return -1.0f;
        
        // Simple distance estimation based on RSSI
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