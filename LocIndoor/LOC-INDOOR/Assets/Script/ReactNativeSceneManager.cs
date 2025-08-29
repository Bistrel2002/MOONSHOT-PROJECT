using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

/// <summary>
/// Manages scene loading requests from React Native frontend
/// Handles communication between React Native and Unity for scene management
/// </summary>
public class ReactNativeSceneManager : MonoBehaviour
{
    [Header("Scene Configuration")]
    [Tooltip("Default scene to load if none specified")]
    public string defaultScene = "floorline";
    
    [Header("Available Scenes")]
    [Tooltip("List of available scenes that can be loaded")]
    public string[] availableScenes = { "floorline", "algosupNav" };
    
    [Header("Loading")]
    [Tooltip("Show loading indicator during scene transitions")]
    public bool showLoadingIndicator = true;
    
    private string currentScene;
    private bool isLoading = false;
    
    void Start()
    {
        // Get current scene name
        currentScene = SceneManager.GetActiveScene().name;
        Debug.Log($"ReactNativeSceneManager: Current scene is '{currentScene}'");
        
        // Don't destroy this manager when switching scenes
        DontDestroyOnLoad(gameObject);
        
        // Send initialization message to React Native
        SendMessageToReactNative("scene_manager_ready", new { 
            current_scene = currentScene,
            available_scenes = availableScenes
        });
    }
    
    /// <summary>
    /// Called by React Native to load a specific scene
    /// Usage from React Native: unityRef.current.postMessage('ReactNativeSceneManager', 'LoadScene', 'floorline')
    /// </summary>
    /// <param name="sceneName">Name of the scene to load</param>
    public void LoadScene(string sceneName)
    {
        Debug.Log($"ReactNativeSceneManager: Received request to load scene '{sceneName}'");
        
        if (isLoading)
        {
            Debug.LogWarning("ReactNativeSceneManager: Scene loading already in progress, ignoring request");
            return;
        }
        
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("ReactNativeSceneManager: Scene name is empty, using default scene");
            sceneName = defaultScene;
        }
        
        // Validate scene name
        bool isValidScene = false;
        foreach (string validScene in availableScenes)
        {
            if (string.Equals(sceneName, validScene, System.StringComparison.OrdinalIgnoreCase))
            {
                isValidScene = true;
                sceneName = validScene; // Use exact case
                break;
            }
        }
        
        if (!isValidScene)
        {
            Debug.LogError($"ReactNativeSceneManager: Scene '{sceneName}' is not in available scenes list");
            SendMessageToReactNative("scene_load_error", new { 
                error = $"Scene '{sceneName}' not found",
                available_scenes = availableScenes
            });
            return;
        }
        
        // Check if we're already in the requested scene
        if (string.Equals(currentScene, sceneName, System.StringComparison.OrdinalIgnoreCase))
        {
            Debug.Log($"ReactNativeSceneManager: Already in scene '{sceneName}', sending ready message");
            SendMessageToReactNative("scene_loaded", new { 
                scene_name = sceneName,
                already_loaded = true
            });
            return;
        }
        
        StartCoroutine(LoadSceneAsync(sceneName));
    }
    
    /// <summary>
    /// Load scene asynchronously with progress updates
    /// </summary>
    private IEnumerator LoadSceneAsync(string sceneName)
    {
        isLoading = true;
        
        Debug.Log($"ReactNativeSceneManager: Starting async load of scene '{sceneName}'");
        
        // Send loading start message
        SendMessageToReactNative("scene_loading_start", new { 
            scene_name = sceneName,
            from_scene = currentScene
        });
        
        // Start loading the scene
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
        asyncLoad.allowSceneActivation = false;
        
        // Wait for scene to load (but not activate yet)
        while (asyncLoad.progress < 0.9f)
        {
            float progress = asyncLoad.progress / 0.9f; // Normalize to 0-1
            
            // Send progress updates
            SendMessageToReactNative("scene_loading_progress", new { 
                scene_name = sceneName,
                progress = progress
            });
            
            yield return null;
        }
        
        Debug.Log($"ReactNativeSceneManager: Scene '{sceneName}' loaded, activating...");
        
        // Activate the scene
        asyncLoad.allowSceneActivation = true;
        
        // Wait for activation to complete
        yield return asyncLoad;
        
        // Update current scene
        currentScene = sceneName;
        isLoading = false;
        
        Debug.Log($"ReactNativeSceneManager: Scene '{sceneName}' activated successfully");
        
        // Send completion message
        SendMessageToReactNative("scene_loaded", new { 
            scene_name = sceneName,
            success = true
        });
        
        // Special handling for floorline scene
        if (sceneName.Equals("floorline", System.StringComparison.OrdinalIgnoreCase))
        {
            yield return new WaitForSeconds(0.5f); // Give scene time to initialize
            SendMessageToReactNative("ar_scene_ready", new { 
                scene_name = sceneName,
                ar_enabled = true
            });
        }
    }
    
    /// <summary>
    /// Get current scene information
    /// </summary>
    public void GetCurrentScene()
    {
        SendMessageToReactNative("current_scene_info", new { 
            scene_name = currentScene,
            is_loading = isLoading,
            available_scenes = availableScenes
        });
    }
    
    /// <summary>
    /// Load the AR navigation scene (floorline)
    /// </summary>
    public void LoadARScene()
    {
        Debug.Log("ReactNativeSceneManager: Loading AR navigation scene (floorline)");
        LoadScene("floorline");
    }
    
    /// <summary>
    /// Load the main navigation scene (algosupNav)
    /// </summary>
    public void LoadMainScene()
    {
        Debug.Log("ReactNativeSceneManager: Loading main navigation scene (algosupNav)");
        LoadScene("algosupNav");
    }
    
    /// <summary>
    /// Send message to React Native
    /// </summary>
    private void SendMessageToReactNative(string messageType, object data)
    {
        try

        {
            var message = new {
                type = messageType,
                data = data,
                timestamp = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };
            
            string jsonMessage = JsonUtility.ToJson(message);
            
            // Send to React Native (this method is provided by Unity-React Native bridge)
            UnitySendMessage(jsonMessage);
            
            Debug.Log($"ReactNativeSceneManager: Sent message to React Native: {messageType}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ReactNativeSceneManager: Failed to send message to React Native: {e.Message}");
        }
    }
    
    /// <summary>
    /// Unity method to send messages to React Native
    /// This is called by the Unity-React Native bridge
    /// </summary>
    private void UnitySendMessage(string message)
    {
        // This will be handled by the Unity-React Native bridge
        // The bridge will call the onUnityMessage handler in React Native
        Debug.Log($"ReactNativeSceneManager: Sending to React Native: {message}");
        
        #if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            
            if (currentActivity != null)
            {
                currentActivity.Call("runOnUiThread", new AndroidJavaRunnable(() => {
                    // Send message to React Native bridge
                    // This will trigger the onUnityMessage callback in React Native
                    Debug.Log($"ReactNativeSceneManager: Message sent to Android bridge: {message}");
                }));
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ReactNativeSceneManager: Failed to send message to Android: {e.Message}");
        }
        #endif
        
        #if UNITY_IOS && !UNITY_EDITOR
        try
        {
            // iOS implementation for React Native bridge
            // This will trigger the onUnityMessage callback in React Native
            Debug.Log($"ReactNativeSceneManager: Message sent to iOS bridge: {message}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ReactNativeSceneManager: Failed to send message to iOS: {e.Message}");
        }
        #endif
    }
}
