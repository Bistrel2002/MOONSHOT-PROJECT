using System;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class BeaconData
{
    public string mac;
    public string name;
    public int rssi;
    public int battery;
    public long lastUpdate;
    public string uuid;
    public int major;
    public int minor;
    public float distance;
    public string frameType;
    
    public BeaconData(string mac, string name, int rssi, int battery, long lastUpdate, 
                     string uuid = "", int major = 0, int minor = 0, string frameType = "")
    {
        this.mac = mac;
        this.name = name;
        this.rssi = rssi;
        this.battery = battery;
        this.lastUpdate = lastUpdate;
        this.uuid = uuid;
        this.major = major;
        this.minor = minor;
        this.frameType = frameType;
        this.distance = CalculateDistance(rssi);
    }
    
    private float CalculateDistance(int rssi)
    {
        if (rssi == 0) return -1.0f;
        
        // Simple distance calculation based on RSSI
        // This is a rough approximation and may need calibration
        float ratio = rssi * 1.0f / -59; // -59 is the RSSI at 1 meter (typical)
        if (ratio < 1.0)
        {
            return Mathf.Pow(ratio, 10);
        }
        else
        {
            float accuracy = (0.89976f) * Mathf.Pow(ratio, 7.7095f) + 0.111f;
            return accuracy;
        }
    }
}

public class BeaconManager : MonoBehaviour
{
    [Header("Beacon Settings")]
    public bool autoStartScanning = true;
    public float scanInterval = 2.0f;
    public int rssiThreshold = -80;
    
    [Header("Debug Settings")]
    public bool enableDebugLogs = true;
    public bool showBeaconGUI = true;
    
    [Header("Events")]
    public UnityEngine.Events.UnityEvent OnBluetoothEnabled;
    public UnityEngine.Events.UnityEvent OnBluetoothDisabled;
    public UnityEngine.Events.UnityEvent OnScanningStarted;
    public UnityEngine.Events.UnityEvent OnScanningStopped;
    
    // Private variables
    private AndroidJavaObject beaconPlugin;
    private AndroidJavaObject currentActivity;
    private AndroidJavaClass unityClass;
    private Dictionary<string, BeaconData> detectedBeacons = new Dictionary<string, BeaconData>();
    private bool isScanning = false;
    private bool isBluetoothEnabled = false;
    private string lastError = "";
    
    // Events for beacon detection
    public System.Action<BeaconData> OnBeaconDetected;
    public System.Action<BeaconData> OnBeaconUpdated;
    public System.Action<BeaconData> OnBeaconLost;
    public System.Action<string> OnError;
    
    private void Start()
    {
        InitializeBeaconPlugin();
        
        if (autoStartScanning)
        {
            Invoke(nameof(StartScanning), 1.0f); // Delay to ensure proper initialization
        }
    }
    
    private void InitializeBeaconPlugin()
    {
        if (Application.platform != RuntimePlatform.Android)
        {
            LogDebug("Beacon scanning is only supported on Android platform");
            return;
        }
        
        try
        {
            unityClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            currentActivity = unityClass.GetStatic<AndroidJavaObject>("currentActivity");
            
            // Initialize our beacon plugin
            beaconPlugin = new AndroidJavaObject("com.locindoor.BeaconPlugin");
            beaconPlugin.Call("initialize", currentActivity);
            
            LogDebug("Beacon plugin initialized successfully");
        }
        catch (System.Exception e)
        {
            LogError($"Failed to initialize beacon plugin: {e.Message}");
            lastError = e.Message;
            OnError?.Invoke(e.Message);
        }
    }
    
    public void StartScanning()
    {
        if (Application.platform != RuntimePlatform.Android)
        {
            LogDebug("Beacon scanning is only supported on Android platform");
            return;
        }
        
        if (beaconPlugin == null)
        {
            LogError("Beacon plugin not initialized");
            return;
        }
        
        try
        {
            // Check and request permissions first
            RequestPermissions();
            
            // Start scanning
            beaconPlugin.Call("startScan");
            isScanning = true;
            
            LogDebug("Beacon scanning started");
            OnScanningStarted?.Invoke();
            
            // Start periodic updates
            InvokeRepeating(nameof(UpdateBeacons), scanInterval, scanInterval);
        }
        catch (System.Exception e)
        {
            LogError($"Failed to start beacon scanning: {e.Message}");
            lastError = e.Message;
            OnError?.Invoke(e.Message);
        }
    }
    
    public void StopScanning()
    {
        if (beaconPlugin == null) return;
        
        try
        {
            beaconPlugin.Call("stopScan");
            isScanning = false;
            
            LogDebug("Beacon scanning stopped");
            OnScanningStopped?.Invoke();
            
            CancelInvoke(nameof(UpdateBeacons));
        }
        catch (System.Exception e)
        {
            LogError($"Failed to stop beacon scanning: {e.Message}");
            lastError = e.Message;
            OnError?.Invoke(e.Message);
        }
    }
    
    private void RequestPermissions()
    {
        if (beaconPlugin != null)
        {
            beaconPlugin.Call("requestPermissions");
        }
    }
    
    private void UpdateBeacons()
    {
        if (beaconPlugin == null || !isScanning) return;
        
        try
        {
            // Get beacon data from the plugin
            string beaconJson = beaconPlugin.Call<string>("getDetectedBeacons");
            
            if (!string.IsNullOrEmpty(beaconJson))
            {
                ProcessBeaconData(beaconJson);
            }
            
            // Check bluetooth status
            bool bluetoothEnabled = beaconPlugin.Call<bool>("isBluetoothEnabled");
            if (bluetoothEnabled != isBluetoothEnabled)
            {
                isBluetoothEnabled = bluetoothEnabled;
                if (isBluetoothEnabled)
                    OnBluetoothEnabled?.Invoke();
                else
                    OnBluetoothDisabled?.Invoke();
            }
        }
        catch (System.Exception e)
        {
            LogError($"Error updating beacons: {e.Message}");
            lastError = e.Message;
            OnError?.Invoke(e.Message);
        }
    }
    
    private void ProcessBeaconData(string jsonData)
    {
        try
        {
            // Simple JSON parsing - in production, consider using a proper JSON library
            string[] beaconEntries = jsonData.Split('\n');
            
            HashSet<string> currentBeacons = new HashSet<string>();
            
            foreach (string entry in beaconEntries)
            {
                if (string.IsNullOrEmpty(entry)) continue;
                
                BeaconData beacon = ParseBeaconFromJson(entry);
                if (beacon != null && beacon.rssi >= rssiThreshold)
                {
                    currentBeacons.Add(beacon.mac);
                    
                    if (detectedBeacons.ContainsKey(beacon.mac))
                    {
                        // Update existing beacon
                        detectedBeacons[beacon.mac] = beacon;
                        OnBeaconUpdated?.Invoke(beacon);
                    }
                    else
                    {
                        // New beacon detected
                        detectedBeacons[beacon.mac] = beacon;
                        OnBeaconDetected?.Invoke(beacon);
                        LogDebug($"New beacon detected: {beacon.name} (MAC: {beacon.mac}, RSSI: {beacon.rssi})");
                    }
                }
            }
            
            // Check for lost beacons
            List<string> lostBeacons = new List<string>();
            foreach (var kvp in detectedBeacons)
            {
                if (!currentBeacons.Contains(kvp.Key))
                {
                    // Check if beacon hasn't been seen for too long
                    long timeSinceLastSeen = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - kvp.Value.lastUpdate;
                    if (timeSinceLastSeen > 30000) // 30 seconds
                    {
                        lostBeacons.Add(kvp.Key);
                        OnBeaconLost?.Invoke(kvp.Value);
                        LogDebug($"Beacon lost: {kvp.Value.name} (MAC: {kvp.Key})");
                    }
                }
            }
            
            // Remove lost beacons
            foreach (string mac in lostBeacons)
            {
                detectedBeacons.Remove(mac);
            }
        }
        catch (System.Exception e)
        {
            LogError($"Error processing beacon data: {e.Message}");
        }
    }
    
    private BeaconData ParseBeaconFromJson(string jsonEntry)
    {
        try
        {
            // Simple JSON parsing - replace with proper JSON parser in production
            string[] parts = jsonEntry.Split(',');
            if (parts.Length < 5) return null;
            
            string mac = ExtractValue(parts[0], "mac");
            string name = ExtractValue(parts[1], "name");
            int rssi = int.Parse(ExtractValue(parts[2], "rssi"));
            int battery = int.Parse(ExtractValue(parts[3], "battery"));
            long lastUpdate = long.Parse(ExtractValue(parts[4], "lastUpdate"));
            
            string uuid = parts.Length > 5 ? ExtractValue(parts[5], "uuid") : "";
            int major = parts.Length > 6 ? int.Parse(ExtractValue(parts[6], "major")) : 0;
            int minor = parts.Length > 7 ? int.Parse(ExtractValue(parts[7], "minor")) : 0;
            string frameType = parts.Length > 8 ? ExtractValue(parts[8], "frameType") : "";
            
            return new BeaconData(mac, name, rssi, battery, lastUpdate, uuid, major, minor, frameType);
        }
        catch (System.Exception e)
        {
            LogError($"Error parsing beacon JSON: {e.Message}");
            return null;
        }
    }
    
    private string ExtractValue(string keyValuePair, string key)
    {
        // Extract value from "key":"value" format
        int colonIndex = keyValuePair.IndexOf(':');
        if (colonIndex >= 0 && colonIndex < keyValuePair.Length - 1)
        {
            return keyValuePair.Substring(colonIndex + 1).Trim('"', ' ', '{', '}');
        }
        return "";
    }
    
    // Public methods for accessing beacon data
    public Dictionary<string, BeaconData> GetDetectedBeacons()
    {
        return new Dictionary<string, BeaconData>(detectedBeacons);
    }
    
    public BeaconData GetClosestBeacon()
    {
        BeaconData closest = null;
        float closestDistance = float.MaxValue;
        
        foreach (var beacon in detectedBeacons.Values)
        {
            if (beacon.distance < closestDistance && beacon.distance > 0)
            {
                closest = beacon;
                closestDistance = beacon.distance;
            }
        }
        
        return closest;
    }
    
    public List<BeaconData> GetBeaconsInRange(float maxDistance)
    {
        List<BeaconData> nearbyBeacons = new List<BeaconData>();
        
        foreach (var beacon in detectedBeacons.Values)
        {
            if (beacon.distance <= maxDistance && beacon.distance > 0)
            {
                nearbyBeacons.Add(beacon);
            }
        }
        
        nearbyBeacons.Sort((a, b) => a.distance.CompareTo(b.distance));
        return nearbyBeacons;
    }
    
    public bool IsScanning => isScanning;
    public bool IsBluetoothEnabled => isBluetoothEnabled;
    public string LastError => lastError;
    
    private void LogDebug(string message)
    {
        if (enableDebugLogs)
        {
            Debug.Log($"[BeaconManager] {message}");
        }
    }
    
    private void LogError(string message)
    {
        Debug.LogError($"[BeaconManager] {message}");
    }
    
    // GUI for debugging
    private void OnGUI()
    {
        if (!showBeaconGUI) return;
        
        GUI.Box(new Rect(10, 10, 400, 300), "Beacon Manager Debug");
        
        int yOffset = 40;
        GUI.Label(new Rect(20, yOffset, 380, 20), $"Scanning: {isScanning}");
        yOffset += 25;
        GUI.Label(new Rect(20, yOffset, 380, 20), $"Bluetooth: {(isBluetoothEnabled ? "Enabled" : "Disabled")}");
        yOffset += 25;
        GUI.Label(new Rect(20, yOffset, 380, 20), $"Detected Beacons: {detectedBeacons.Count}");
        yOffset += 25;
        
        if (!string.IsNullOrEmpty(lastError))
        {
            GUI.color = Color.red;
            GUI.Label(new Rect(20, yOffset, 380, 40), $"Last Error: {lastError}");
            GUI.color = Color.white;
            yOffset += 45;
        }
        
        if (GUI.Button(new Rect(20, yOffset, 100, 30), isScanning ? "Stop Scan" : "Start Scan"))
        {
            if (isScanning)
                StopScanning();
            else
                StartScanning();
        }
        
        yOffset += 40;
        
        // Display detected beacons
        foreach (var beacon in detectedBeacons.Values)
        {
            if (yOffset > 280) break; // Don't overflow the GUI box
            
            string beaconInfo = $"{beacon.name} | RSSI: {beacon.rssi} | Dist: {beacon.distance:F1}m";
            GUI.Label(new Rect(20, yOffset, 380, 20), beaconInfo);
            yOffset += 20;
        }
    }
    
    private void OnDestroy()
    {
        StopScanning();
    }
    
    private void OnApplicationPause(bool pauseStatus)
    {
        if (pauseStatus)
        {
            StopScanning();
        }
        else if (autoStartScanning)
        {
            Invoke(nameof(StartScanning), 1.0f);
        }
    }
}