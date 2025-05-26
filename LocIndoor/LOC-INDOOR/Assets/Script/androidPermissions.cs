using UnityEngine;

public class AndroidPermissions : MonoBehaviour
{
    void Start()
    {
#if UNITY_ANDROID
        string[] permissions = {
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.BLUETOOTH_SCAN",
            "android.permission.BLUETOOTH_CONNECT"
        };
        foreach (var permission in permissions)
        {
            if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(permission))
            {
                UnityEngine.Android.Permission.RequestUserPermission(permission);
            }
        }
#endif
    }
}
