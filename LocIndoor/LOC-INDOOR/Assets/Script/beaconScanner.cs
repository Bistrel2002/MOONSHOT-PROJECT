using UnityEngine;
using System;

public class BeaconScanner : MonoBehaviour
{
    AndroidJavaObject mtCentralManager;

    void Start()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
        {
            AndroidJavaObject activity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            AndroidJavaClass mtCentralManagerClass = new AndroidJavaClass("com.minew.beaconplus.sdk.MTCentralManager");
            mtCentralManager = mtCentralManagerClass.CallStatic<AndroidJavaObject>("getInstance", activity);

            // Start the service (SDK method)
            mtCentralManager.Call("startService");

            // Set up the scan listener (this is the C# equivalent of the Java anonymous class)
            mtCentralManager.Call("setMTCentralManagerListener", new MTCentralManagerListenerProxy());

            // Start scanning
            mtCentralManager.Call("startScan");
        }
#endif
    }

    // This class acts as the Java interface implementation in C#
    class MTCentralManagerListenerProxy : AndroidJavaProxy
    {
        public MTCentralManagerListenerProxy() : base("com.minew.beaconplus.sdk.interfaces.MTCentralManagerListener") { }

        // This method is called from Java when beacons are found
        void onScanedPeripheral(AndroidJavaObject peripherals)
        {
            int size = peripherals.Call<int>("size");
            for (int i = 0; i < size; i++)
            {
                AndroidJavaObject mtPeripheral = peripherals.Call<AndroidJavaObject>("get", i);
                AndroidJavaObject mtFrameHandler = mtPeripheral.Get<AndroidJavaObject>("mMTFrameHandler");
                string mac = mtFrameHandler.Call<string>("getMac");
                string name = mtFrameHandler.Call<string>("getName");
                int battery = mtFrameHandler.Call<int>("getBattery");
                int rssi = mtFrameHandler.Call<int>("getRssi");
                long lastUpdate = mtFrameHandler.Call<long>("getLastUpdate");

                Debug.Log($"Beacon found: Name={name}, MAC={mac}, Battery={battery}, RSSI={rssi}, LastUpdate={lastUpdate}");
                // You can now use this data in Unity!
            }
        }
    }
}
