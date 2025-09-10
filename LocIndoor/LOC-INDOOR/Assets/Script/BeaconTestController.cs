using UnityEngine;
using System.Collections.Generic;

public class BeaconTestController : MonoBehaviour
{
    [Header("Beacon Manager")]
    public MinewBeaconManager beaconManager;
    
    [Header("Test Settings")]
    public bool autoTest = true;
    public float testUpdateInterval = 2.0f;
    
    private List<string> logMessages = new List<string>();
    
    void Start()
    {
        // Find beacon manager if not assigned
        if (beaconManager == null)
        {
            beaconManager = FindFirstObjectByType<MinewBeaconManager>();
        }
        
        if (beaconManager != null)
        {
            // Subscribe to beacon events
            beaconManager.OnBeaconDetected += OnBeaconDetected;
            beaconManager.OnBeaconUpdated += OnBeaconUpdated;
            beaconManager.OnError += OnError;
            
            AddLog("Beacon Test Controller initialized");
            
            if (autoTest)
            {
                InvokeRepeating(nameof(TestUpdate), 2.0f, testUpdateInterval);
            }
        }
        else
        {
            AddLog("ERROR: No MinewBeaconManager found!");
        }
    }
    
    private void TestUpdate()
    {
        if (beaconManager == null) return;
        
        var beacons = beaconManager.GetDetectedBeacons();
        AddLog($"Status: Scanning={beaconManager.IsScanning}, Beacons={beacons.Count}");
        
        var closest = beaconManager.GetClosestBeacon();
        if (closest != null)
        {
            AddLog($"Closest: {closest.name} at {closest.estimatedDistance:F1}m");
        }
    }
    
    private void OnBeaconDetected(MinewBeaconData beacon)
    {
        AddLog($"NEW: {beacon.name} ({beacon.mac}) {beacon.rssi}dBm");
    }
    
    private void OnBeaconUpdated(MinewBeaconData beacon)
    {
        // Log updates less frequently to avoid spam
        if (Time.frameCount % 120 == 0) // Every ~2 seconds
        {
            AddLog($"UPDATE: {beacon.name} {beacon.rssi}dBm");
        }
    }
    
    private void OnError(string error)
    {
        AddLog($"ERROR: {error}");
    }
    
    private void AddLog(string message)
    {
        string logEntry = $"[{Time.time:F1}s] {message}";
        logMessages.Add(logEntry);
        
        if (logMessages.Count > 8)
        {
            logMessages.RemoveAt(0);
        }
        
        Debug.Log($"[BeaconTest] {message}");
    }
    
    // Debug GUI - DISABLED (UI removed to keep only MinewBeaconManager and BeaconDisplayUI)
    private void OnGUI()
    {
        // UI has been disabled - test functionality continues in background
        // Event logging and beacon monitoring still active via console output
        // Component continues to monitor beacon events and log to Unity Console
    }
    
    void OnDestroy()
    {
        if (beaconManager != null)
        {
            beaconManager.OnBeaconDetected -= OnBeaconDetected;
            beaconManager.OnBeaconUpdated -= OnBeaconUpdated;
            beaconManager.OnError -= OnError;
        }
    }
}