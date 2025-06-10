using UnityEngine;
using System.Collections;

public class AndroidPermissionHelper : MonoBehaviour
{
    [Header("Debug")]
    public bool verboseLogging = true;
    
    private bool permissionsRequested = false;
    
    void Start()
    {
        if (Application.platform == RuntimePlatform.Android)
        {
            StartCoroutine(RequestPermissionsCoroutine());
        }
    }
    
    private IEnumerator RequestPermissionsCoroutine()
    {
        // Wait a moment for Unity to fully initialize
        yield return new WaitForSeconds(0.5f);
        
        RequestBeaconPermissions();
    }
    
    public void RequestBeaconPermissions()
    {
        if (permissionsRequested) return;
        
        LogMessage("Requesting beacon permissions...");
        
        try
        {
            // Use Unity's built-in permission system for newer versions
            #if UNITY_2018_3_OR_NEWER
            
            // Location permissions (required for Bluetooth scanning)
            if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.FineLocation))
            {
                LogMessage("Requesting Fine Location permission");
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.FineLocation);
            }
            
            if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.CoarseLocation))
            {
                LogMessage("Requesting Coarse Location permission");
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.CoarseLocation);
            }
            
            // Camera permission for AR
            if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera))
            {
                LogMessage("Requesting Camera permission");
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.Camera);
            }
            
            #endif
            
            // For Bluetooth permissions on Android 12+, we need to use the Android Java approach
            RequestBluetoothPermissions();
            
            permissionsRequested = true;
            LogMessage("Permission requests completed");
        }
        catch (System.Exception e)
        {
            LogError($"Error requesting permissions: {e.Message}");
        }
    }
    
    private void RequestBluetoothPermissions()
    {
        try
        {
            AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            
            AndroidJavaClass activityCompat = new AndroidJavaClass("androidx.core.app.ActivityCompat");
            
            // Android 12+ Bluetooth permissions
            string[] bluetoothPermissions = {
                "android.permission.BLUETOOTH_SCAN",
                "android.permission.BLUETOOTH_CONNECT"
            };
            
            activityCompat.CallStatic("requestPermissions", currentActivity, bluetoothPermissions, 1002);
            LogMessage("Requested Bluetooth permissions for Android 12+");
        }
        catch (System.Exception e)
        {
            LogMessage($"Could not request Bluetooth permissions (this is normal on older Android versions): {e.Message}");
        }
    }
    
    public bool CheckAllPermissions()
    {
        if (Application.platform != RuntimePlatform.Android)
        {
            LogMessage("Not on Android platform - permissions not applicable");
            return true;
        }
        
        try
        {
            #if UNITY_2018_3_OR_NEWER
            bool hasLocation = UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.FineLocation) ||
                              UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.CoarseLocation);
            
            bool hasCamera = UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera);
            
            LogMessage($"Permissions status - Location: {hasLocation}, Camera: {hasCamera}");
            
            return hasLocation && hasCamera;
            #else
            LogMessage("Using older Unity version - cannot check permissions automatically");
            return true;
            #endif
        }
        catch (System.Exception e)
        {
            LogError($"Error checking permissions: {e.Message}");
            return false;
        }
    }
    
    [ContextMenu("Request Permissions")]
    public void RequestPermissionsManually()
    {
        permissionsRequested = false;
        RequestBeaconPermissions();
    }
    
    [ContextMenu("Check Permissions")]
    public void CheckPermissionsManually()
    {
        bool hasPermissions = CheckAllPermissions();
        LogMessage($"All required permissions granted: {hasPermissions}");
    }
    
    private void LogMessage(string message)
    {
        if (verboseLogging)
        {
            Debug.Log($"[AndroidPermissionHelper] {message}");
        }
    }
    
    private void LogError(string message)
    {
        Debug.LogError($"[AndroidPermissionHelper] {message}");
    }
    
    // Debug UI
    private void OnGUI()
    {
        if (!verboseLogging) return;
        
        GUILayout.BeginArea(new Rect(10, 10, 300, 150));
        GUILayout.Box("Permission Helper", GUILayout.Width(280));
        
        if (Application.platform == RuntimePlatform.Android)
        {
            bool allPermissions = CheckAllPermissions();
            GUILayout.Label($"All Permissions: {(allPermissions ? "✓" : "✗")}");
            
            if (GUILayout.Button("Request Permissions"))
            {
                RequestPermissionsManually();
            }
            
            if (GUILayout.Button("Check Permissions"))
            {
                CheckPermissionsManually();
            }
        }
        else
        {
            GUILayout.Label("Platform: Not Android");
        }
        
        GUILayout.EndArea();
    }
} 