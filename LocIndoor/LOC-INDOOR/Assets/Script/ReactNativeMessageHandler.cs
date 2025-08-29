using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

public class ReactNativeMessageHandler : MonoBehaviour
{
    [Header("References")]
    public DestinationManager destinationManager;
    public ArrowPathRenderer pathRenderer;
    
    private void Awake()
    {
        // Make this object persistent across scenes
        DontDestroyOnLoad(gameObject);
        
        // Set this as the singleton message handler
        if (FindObjectsOfType<ReactNativeMessageHandler>().Length > 1)
        {
            Destroy(gameObject);
            return;
        }
    }
    
    private void Start()
    {
        Debug.Log("ReactNativeMessageHandler: Ready to receive messages from React Native");
        
        // Try to find the DestinationManager and ArrowPathRenderer in the current scene
        FindSceneReferences();
    }
    
    private void OnEnable()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;
    }
    
    private void OnDisable()
    {
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }
    
    private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        Debug.Log($"ReactNativeMessageHandler: Scene '{scene.name}' loaded, finding references...");
        
        // Find references in the newly loaded scene
        StartCoroutine(FindReferencesAfterDelay());
    }
    
    private IEnumerator FindReferencesAfterDelay()
    {
        // Wait a frame for all objects to be initialized
        yield return null;
        FindSceneReferences();
    }
    
    private void FindSceneReferences()
    {
        if (destinationManager == null)
        {
            destinationManager = FindObjectOfType<DestinationManager>();
            if (destinationManager != null)
                Debug.Log("ReactNativeMessageHandler: Found DestinationManager");
            else
                Debug.LogWarning("ReactNativeMessageHandler: DestinationManager not found in scene");
        }
        
        if (pathRenderer == null)
        {
            pathRenderer = FindObjectOfType<ArrowPathRenderer>();
            if (pathRenderer != null)
                Debug.Log("ReactNativeMessageHandler: Found ArrowPathRenderer");
            else
                Debug.LogWarning("ReactNativeMessageHandler: ArrowPathRenderer not found in scene");
        }
    }
    
    // Called from React Native to load a specific scene
    public void LoadScene(string sceneName)
    {
        Debug.Log($"ReactNativeMessageHandler: Loading scene '{sceneName}'");
        SceneManager.LoadScene(sceneName);
    }
    
    // Called from React Native to set destination
    // Expected JSON format: {"category": "Rooms", "index": 0}
    public void SetDestination(string jsonData)
    {
        Debug.Log($"ReactNativeMessageHandler: SetDestination called with data: {jsonData}");
        
        try
        {
            var data = JsonUtility.FromJson<DestinationData>(jsonData);
            
            if (destinationManager == null)
            {
                FindSceneReferences();
                if (destinationManager == null)
                {
                    Debug.LogError("ReactNativeMessageHandler: DestinationManager not found! Cannot set destination.");
                    return;
                }
            }
            
            Debug.Log($"ReactNativeMessageHandler: Setting destination - Category: {data.category}, Index: {data.index}");
            destinationManager.SetDestination(data.category, data.index);
            
            // Send success message back to React Native
            SendMessageToReactNative("navigation_started", $"Navigation to {data.category}[{data.index}] started");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ReactNativeMessageHandler: Error parsing destination data: {e.Message}");
            SendMessageToReactNative("navigation_error", e.Message);
        }
    }
    
    // Alternative method to set destination by name (if you want to map names to categories/indices)
    public void SetDestinationByName(string destinationName)
    {
        Debug.Log($"ReactNativeMessageHandler: SetDestinationByName called with: {destinationName}");
        
        // Map destination names to categories and indices
        // You can customize this mapping based on your needs
        string category;
        int index;
        
        switch (destinationName.ToLower())
        {
            case "library":
            case "gym":
                category = "Facilities";
                index = destinationName.ToLower() == "gym" ? 0 : 1;
                break;
            case "reception":
            case "help desk":
                category = "Services";
                index = destinationName.ToLower() == "reception" ? 0 : 1;
                break;
            case "lab":
            case "classroom":
                category = "Studies";
                index = destinationName.ToLower() == "lab" ? 0 : 1;
                break;
            case "pizza":
            case "cafeteria":
                category = "Food";
                index = destinationName.ToLower() == "pizza" ? 0 : 1;
                break;
            default:
                category = "Rooms";
                index = 0; // Default to first room
                break;
        }
        
        // Create JSON data and call SetDestination
        var data = new DestinationData { category = category, index = index };
        string jsonData = JsonUtility.ToJson(data);
        SetDestination(jsonData);
    }
    
    // Send messages back to React Native
    public void SendMessageToReactNative(string messageType, string data)
    {
        var message = new UnityMessage { type = messageType, data = data };
        string jsonMessage = JsonUtility.ToJson(message);
        
        Debug.Log($"ReactNativeMessageHandler: Sending message to React Native: {jsonMessage}");
        
        // This will be received by handleUnityMessage in React Native
        #if UNITY_ANDROID && !UNITY_EDITOR
        AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
        AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
        currentActivity.Call("runOnUiThread", new AndroidJavaRunnable(() => {
            // Send message to React Native bridge
            // The exact implementation depends on your React Native Unity bridge
        }));
        #endif
    }
    
    // Data structures for JSON serialization
    [System.Serializable]
    public class DestinationData
    {
        public string category;
        public int index;
    }
    
    [System.Serializable]
    public class UnityMessage
    {
        public string type;
        public string data;
    }
}
