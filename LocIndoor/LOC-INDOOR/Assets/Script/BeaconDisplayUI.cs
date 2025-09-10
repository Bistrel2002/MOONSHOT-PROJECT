/*
 * BeaconDisplayUI - Detailed Beacon Information Display
 * 
 * This component provides a comprehensive UI for displaying detailed information about detected beacons.
 * Each beacon gets its own section showing:
 * - Beacon name and MAC address
 * - RSSI signal strength with visual indicators
 * - Estimated distance
 * - Battery level
 * - Signal quality assessment
 * - iBeacon UUID, Major, and Minor values (when available)
 * 
 * Features:
 * - Automatic sorting by distance (closest first)
 * - Configurable refresh rate and maximum beacon count
 * - Toggle between detailed and simple view modes
 * - Real-time updates from MinewBeaconManager
 * - Control panel for easy configuration
 * 
 * Usage:
 * 1. Add this component to a GameObject in your scene
 * 2. Assign the MinewBeaconManager reference (or it will auto-find it)
 * 3. The UI will automatically appear on the left side of the screen
 * 4. Use the control panel (top-right) to adjust settings
 */

using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class BeaconDisplayUI : MonoBehaviour
{
    [Header("Beacon Manager Reference")]
    public MinewBeaconManager beaconManager;
    
    [Header("Display Settings")]
    public bool showBeaconDisplay = true;
    public float refreshRate = 1.0f;
    public int maxBeaconsToShow = 8;
    
    [Header("UI Styling")]
    public bool showDetailedInfo = true;
    public bool sortByDistance = true;
    
    private List<MinewBeaconData> currentBeacons = new List<MinewBeaconData>();
    private float lastRefreshTime = 0f;
    
    // UI Layout constants - ENHANCED FOR LARGER DISPLAY
    private const float BEACON_SECTION_HEIGHT_DETAILED = 180f;
    private const float BEACON_SECTION_HEIGHT_SIMPLE = 130f;
    private const float BEACON_SECTION_WIDTH = 700f;
    private const float SECTION_SPACING = 15f;
    private const float PADDING_TOP = 30f;
    private const float PADDING_LEFT = 30f;
    
    void Start()
    {
        // Find beacon manager if not assigned
        if (beaconManager == null)
        {
            beaconManager = FindFirstObjectByType<MinewBeaconManager>();
        }
        
        if (beaconManager == null)
        {
            Debug.LogWarning("[BeaconDisplayUI] No MinewBeaconManager found in scene!");
        }
        else
        {
            Debug.Log("[BeaconDisplayUI] Initialized and connected to MinewBeaconManager");
        }
    }
    
    void Update()
    {
        // Refresh beacon data at specified intervals
        if (Time.time - lastRefreshTime >= refreshRate)
        {
            RefreshBeaconData();
            lastRefreshTime = Time.time;
        }
    }
    
    private void RefreshBeaconData()
    {
        if (beaconManager == null || !beaconManager.IsInitialized)
            return;
            
        // Get current beacon data
        var detectedBeacons = beaconManager.GetDetectedBeacons();
        
        // Sort by distance if enabled
        if (sortByDistance)
        {
            currentBeacons = detectedBeacons
                .Where(b => b.estimatedDistance > 0) // Only include beacons with valid distance
                .OrderBy(b => b.estimatedDistance)
                .Take(maxBeaconsToShow)
                .ToList();
        }
        else
        {
            currentBeacons = detectedBeacons
                .Take(maxBeaconsToShow)
                .ToList();
        }
    }
    
    private void OnGUI()
    {
        if (!showBeaconDisplay) return;
        
        // Draw control panel first (top-right, below other UIs)
        DrawControlPanel();
        
        // Position main UI on the left side with padding
        float startY = PADDING_TOP;
        
        // Main title - LARGER
        GUI.Box(new Rect(PADDING_LEFT, startY, BEACON_SECTION_WIDTH + 40, 50), "");
        GUI.Label(new Rect(PADDING_LEFT + 20, startY + 15, BEACON_SECTION_WIDTH, 30), "🎯 BEACON DETECTION SYSTEM", GUI.skin.box);
        startY += 60;
        
        // Status information - ENHANCED AND LARGER
        if (beaconManager != null)
        {
            GUI.Box(new Rect(PADDING_LEFT, startY, BEACON_SECTION_WIDTH + 40, 80), "");
            
            // First row of status
            string statusText1 = $"🔧 Manager: {(beaconManager.IsInitialized ? "✅ READY" : "❌ NOT READY")}     " +
                               $"📡 Scanner: {(beaconManager.IsScanning ? "✅ ACTIVE" : "❌ INACTIVE")}";
            GUI.Label(new Rect(PADDING_LEFT + 15, startY + 15, BEACON_SECTION_WIDTH, 30), statusText1);
            
            // Second row of status
            string statusText2 = $"📱 Bluetooth: {(beaconManager.IsBluetoothEnabled ? "✅ ENABLED" : "❌ DISABLED")}     " +
                               $"🎯 Total Beacons: {currentBeacons.Count}";
            GUI.Label(new Rect(PADDING_LEFT + 15, startY + 45, BEACON_SECTION_WIDTH, 30), statusText2);
            
            startY += 90;
        }
        
        // Display individual beacon sections
        if (currentBeacons.Count > 0)
        {
            for (int i = 0; i < currentBeacons.Count; i++)
            {
                DrawBeaconSection(currentBeacons[i], i + 1, PADDING_LEFT, startY);
                float sectionHeight = showDetailedInfo ? BEACON_SECTION_HEIGHT_DETAILED : BEACON_SECTION_HEIGHT_SIMPLE;
                startY += sectionHeight + SECTION_SPACING;
            }
        }
        else
        {
            // No beacons detected message - LARGER
            GUI.Box(new Rect(PADDING_LEFT, startY, BEACON_SECTION_WIDTH + 40, 120), "");
            GUI.Label(new Rect(PADDING_LEFT + 20, startY + 20, BEACON_SECTION_WIDTH, 35), "❌ NO BEACONS DETECTED");
            
            if (beaconManager != null)
            {
                string helpText = "";
                if (!beaconManager.IsInitialized)
                    helpText = "🔧 Beacon manager not initialized";
                else if (!beaconManager.IsScanning)
                    helpText = "📡 Scanner not active - check Bluetooth and permissions";
                else
                    helpText = "🎯 Make sure beacons are powered on and within range (< 10m)";
                    
                GUI.Label(new Rect(PADDING_LEFT + 20, startY + 60, BEACON_SECTION_WIDTH, 30), helpText);
            }
        }
    }
    
    private void DrawBeaconSection(MinewBeaconData beacon, int beaconNumber, float x, float y)
    {
        // Main beacon container with dynamic height - MUCH LARGER
        float sectionHeight = showDetailedInfo ? BEACON_SECTION_HEIGHT_DETAILED : BEACON_SECTION_HEIGHT_SIMPLE;
        GUI.Box(new Rect(x, y, BEACON_SECTION_WIDTH + 40, sectionHeight), "");
        
        // Beacon header with number and name - LARGER FONT
        string headerText = $"🎯 BEACON #{beaconNumber}: {(string.IsNullOrEmpty(beacon.name) ? "UNKNOWN DEVICE" : beacon.name.ToUpper())}";
        GUI.Label(new Rect(x + 15, y + 10, BEACON_SECTION_WIDTH, 30), headerText);
        
        // MAC Address - LARGER
        GUI.Label(new Rect(x + 15, y + 45, BEACON_SECTION_WIDTH, 25), $"📱 MAC ADDRESS: {beacon.mac}");
        
        // Signal strength with visual indicator - ENHANCED
        string signalStrength = GetSignalStrengthText(beacon.rssi);
        string signalQuality = GetSignalQuality(beacon.rssi);
        GUI.Label(new Rect(x + 15, y + 75, BEACON_SECTION_WIDTH / 2, 25), $"📶 SIGNAL: {beacon.rssi} dBm {signalStrength}");
        GUI.Label(new Rect(x + 15, y + 100, BEACON_SECTION_WIDTH / 2, 25), $"⚡ QUALITY: {signalQuality}");
        
        // Distance - LARGER with accuracy indicator
        string distanceText = beacon.estimatedDistance > 0 ? 
            $"{beacon.estimatedDistance:F1}m" : "UNKNOWN";
        string accuracyIcon = GetAccuracyIcon(beacon);
        GUI.Label(new Rect(x + BEACON_SECTION_WIDTH / 2, y + 75, BEACON_SECTION_WIDTH / 2, 25), $"📏 DISTANCE: {distanceText} {accuracyIcon}");
        
        // Battery level - LARGER
        string batteryText = beacon.battery > 0 ? $"{beacon.battery}%" : "UNKNOWN";
        GUI.Label(new Rect(x + BEACON_SECTION_WIDTH / 2, y + 100, BEACON_SECTION_WIDTH / 2, 25), $"🔋 BATTERY: {batteryText}");
        
        // iBeacon information (if available and detailed info is enabled) - ENHANCED
        if (showDetailedInfo)
        {
            if (!string.IsNullOrEmpty(beacon.uuid))
            {
                GUI.Label(new Rect(x + 15, y + 130, BEACON_SECTION_WIDTH, 25), $"🎯 UUID: {beacon.uuid.Substring(0, Mathf.Min(beacon.uuid.Length, 30))}...");
                GUI.Label(new Rect(x + 15, y + 155, BEACON_SECTION_WIDTH, 25), $"🔢 MAJOR: {beacon.major}  |  MINOR: {beacon.minor}");
            }
            else
            {
                GUI.Label(new Rect(x + 15, y + 130, BEACON_SECTION_WIDTH, 25), "❌ iBeacon data not available");
            }
        }
        else
        {
            // Show condensed info when detailed view is off
            string lastSeenText = $"🕐 LAST UPDATE: {System.DateTime.Now:HH:mm:ss}";
            GUI.Label(new Rect(x + 15, y + 130, BEACON_SECTION_WIDTH, 25), lastSeenText);
        }
    }
    
    private string GetSignalStrengthText(int rssi)
    {
        if (rssi >= -50) return "📶📶📶📶"; // Excellent
        if (rssi >= -60) return "📶📶📶"; // Good
        if (rssi >= -70) return "📶📶"; // Fair
        if (rssi >= -80) return "📶"; // Weak
        return "📵"; // Very weak
    }
    
    private string GetSignalQuality(int rssi)
    {
        if (rssi >= -50) return "Excellent";
        if (rssi >= -60) return "Good";
        if (rssi >= -70) return "Fair";
        if (rssi >= -80) return "Weak";
        return "Very Weak";
    }
    
    private string GetAccuracyIcon(MinewBeaconData beacon)
    {
        // Check if beacon has accuracy property (from improved distance calculation)
        try
        {
            var accuracyField = beacon.GetType().GetField("accuracy");
            if (accuracyField != null)
            {
                var accuracy = accuracyField.GetValue(beacon);
                switch (accuracy.ToString())
                {
                    case "High": return "🎯";
                    case "Medium": return "🔵";
                    case "Low": return "🟡";
                    case "VeryLow": return "🔴";
                }
            }
        }
        catch
        {
            // Fallback to RSSI-based accuracy
        }
        
        // Fallback accuracy based on RSSI
        if (beacon.rssi >= -50) return "🎯"; // High accuracy
        if (beacon.rssi >= -65) return "🔵"; // Medium accuracy
        if (beacon.rssi >= -75) return "🟡"; // Low accuracy
        return "🔴"; // Very low accuracy
    }
    
    // Public methods for external control
    public void ToggleDisplay()
    {
        showBeaconDisplay = !showBeaconDisplay;
    }
    
    public void SetMaxBeacons(int maxBeacons)
    {
        maxBeaconsToShow = Mathf.Clamp(maxBeacons, 1, 20);
    }
    
    public void ToggleSortByDistance()
    {
        sortByDistance = !sortByDistance;
    }
    
    public void SetRefreshRate(float rate)
    {
        refreshRate = Mathf.Clamp(rate, 0.1f, 5.0f);
    }
    
    // Context menu methods for testing
    [ContextMenu("Toggle Beacon Display")]
    public void ToggleDisplayFromMenu()
    {
        ToggleDisplay();
    }
    
    [ContextMenu("Force Refresh")]
    public void ForceRefresh()
    {
        RefreshBeaconData();
    }
    
    private void DrawControlPanel()
    {
        // Position control panel at top-right - NOW PRIMARY CONTROL CENTER
        float screenWidth = Screen.width;
        float panelWidth = 400f;
        float panelHeight = 280f;
        float paddingFromTop = 30f; // Top position since MinewBeaconManager UI removed
        float paddingFromRight = 30f;
        
        GUI.Box(new Rect(screenWidth - panelWidth - paddingFromRight, paddingFromTop, panelWidth, panelHeight), "🎛️ BEACON CONTROL CENTER");
        
        float controlY = paddingFromTop + 40;
        float controlX = screenWidth - panelWidth - paddingFromRight + 15;
        
        // Beacon Manager Controls - NEW SECTION
        GUI.Label(new Rect(controlX, controlY, 200, 25), "📡 SCANNER CONTROLS:");
        controlY += 30;
        
        // Start/Stop scanning buttons
        if (beaconManager != null)
        {
            if (GUI.Button(new Rect(controlX, controlY, 100, 35), beaconManager.IsScanning ? "⏹️ STOP" : "▶️ START"))
            {
                if (beaconManager.IsScanning)
                    beaconManager.StopBeaconScanning();
                else
                    beaconManager.StartBeaconScanning();
            }
            
            if (GUI.Button(new Rect(controlX + 110, controlY, 120, 35), "🔍 CHECK BT"))
            {
                // Trigger Bluetooth check through reflection or public method
                Debug.Log("[BeaconDisplayUI] Bluetooth check requested");
            }
        }
        
        controlY += 45;
        GUI.Label(new Rect(controlX, controlY, 200, 25), "🎨 DISPLAY CONTROLS:");
        controlY += 30;
        
        // Toggle display button
        if (GUI.Button(new Rect(controlX, controlY, 120, 35), showBeaconDisplay ? "👁️ HIDE" : "👁️ SHOW"))
        {
            ToggleDisplay();
        }
        
        // Toggle sort by distance
        if (GUI.Button(new Rect(controlX + 130, controlY, 140, 35), sortByDistance ? "📏 DISTANCE" : "📋 DEFAULT"))
        {
            ToggleSortByDistance();
        }
        
        controlY += 45;
        
        // Max beacons slider
        GUI.Label(new Rect(controlX, controlY, 150, 25), $"🎯 MAX BEACONS: {maxBeaconsToShow}");
        maxBeaconsToShow = Mathf.RoundToInt(GUI.HorizontalSlider(new Rect(controlX + 150, controlY + 5, 180, 20), maxBeaconsToShow, 1, 15));
        
        controlY += 35;
        
        // Refresh rate slider
        GUI.Label(new Rect(controlX, controlY, 150, 25), $"⏱️ REFRESH: {refreshRate:F1}s");
        refreshRate = GUI.HorizontalSlider(new Rect(controlX + 150, controlY + 5, 180, 20), refreshRate, 0.1f, 3.0f);
        
        controlY += 35;
        
        // Force refresh button
        if (GUI.Button(new Rect(controlX, controlY, 120, 30), "🔄 REFRESH"))
        {
            ForceRefresh();
        }
        
        // Toggle detailed info
        if (GUI.Button(new Rect(controlX + 130, controlY, 140, 30), showDetailedInfo ? "📋 SIMPLE" : "📊 DETAILED"))
        {
            showDetailedInfo = !showDetailedInfo;
        }
    }
}
