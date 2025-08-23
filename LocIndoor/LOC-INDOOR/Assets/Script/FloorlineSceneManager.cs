using UnityEngine;
using UnityEngine.SceneManagement;

public class FloorlineSceneManager : MonoBehaviour
{
    [Header("Scene Components")]
    public DestinationManager destinationManager;
    public ArrowPathRenderer pathRenderer;
    
    [Header("AR Camera")]
    public Camera arCamera;
    
    private void Awake()
    {
        // Make this persistent across scene loads
        DontDestroyOnLoad(gameObject);
        
        Debug.Log("FloorlineSceneManager: Initializing floorline scene components");
        
        // Auto-find components if not assigned
        FindSceneComponents();
    }
    
    private void Start()
    {
        Debug.Log("FloorlineSceneManager: Floorline scene ready for AR navigation");
        
        // Notify React Native that the scene is loaded
        SendMessageToReactNative("scene_loaded", "floorline");
        
        // Initialize default navigation if components are found
        if (destinationManager != null && pathRenderer != null)
        {
            Debug.Log("FloorlineSceneManager: DestinationManager and ArrowPathRenderer found and ready");
        }
        else
        {
            Debug.LogWarning("FloorlineSceneManager: Missing required components!");
            if (destinationManager == null) Debug.LogWarning("- DestinationManager not found");
            if (pathRenderer == null) Debug.LogWarning("- ArrowPathRenderer not found");
        }
    }
    
    private void FindSceneComponents()
    {
        // Find DestinationManager in the scene
        if (destinationManager == null)
        {
            destinationManager = FindObjectOfType<DestinationManager>();
            if (destinationManager != null)
                Debug.Log("FloorlineSceneManager: Found DestinationManager");
        }
        
        // Find ArrowPathRenderer (should be on NavigationPath GameObject)
        if (pathRenderer == null)
        {
            pathRenderer = FindObjectOfType<ArrowPathRenderer>();
            if (pathRenderer != null)
                Debug.Log("FloorlineSceneManager: Found ArrowPathRenderer on " + pathRenderer.gameObject.name);
        }
        
        // Find AR Camera
        if (arCamera == null)
        {
            arCamera = Camera.main;
            if (arCamera != null)
                Debug.Log("FloorlineSceneManager: Found AR Camera: " + arCamera.gameObject.name);
        }
    }
    
    // Called from React Native to set navigation destination
    public void SetNavigationDestination(string jsonData)
    {
        Debug.Log($"FloorlineSceneManager: SetNavigationDestination called with: {jsonData}");
        
        try
        {
            var data = JsonUtility.FromJson<NavigationData>(jsonData);
            
            if (destinationManager == null)
            {
                FindSceneComponents();
                if (destinationManager == null)
                {
                    Debug.LogError("FloorlineSceneManager: DestinationManager not found!");
                    SendMessageToReactNative("navigation_error", "DestinationManager not found in floorline scene");
                    return;
                }
            }
            
            Debug.Log($"FloorlineSceneManager: Setting destination - Category: {data.category}, Index: {data.index}");
            
            // Call your DestinationManager's SetDestination method
            destinationManager.SetDestination(data.category, data.index);
            
            // Notify React Native that navigation started
            SendMessageToReactNative("navigation_started", $"Floor line navigation to {data.category}[{data.index}] started");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"FloorlineSceneManager: Error setting navigation destination: {e.Message}");
            SendMessageToReactNative("navigation_error", e.Message);
        }
    }
    
    // Called from React Native to set destination by name
    public void SetDestinationByName(string destinationName)
    {
        Debug.Log($"FloorlineSceneManager: SetDestinationByName called with: {destinationName}");
        
        // Map destination names to your scene's categories
        string category;
        int index;
        
        // Based on your floorline.unity scene structure
        switch (destinationName.ToLower())
        {
            case "pizza":
            case "cafeteria":
            case "food":
                category = "Foods";
                index = destinationName.ToLower() == "pizza" ? 0 : 1;
                break;
            case "gym":
            case "library":
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
            default:
                // Default to the first destination in the scene
                category = "Foods"; // Or whatever your first category is
                index = 0;
                Debug.LogWarning($"FloorlineSceneManager: Unknown destination '{destinationName}', using default");
                break;
        }
        
        // Create navigation data and call SetNavigationDestination
        var data = new NavigationData { category = category, index = index };
        string jsonData = JsonUtility.ToJson(data);
        SetNavigationDestination(jsonData);
    }
    
    // Send messages back to React Native
    private void SendMessageToReactNative(string messageType, string data)
    {
        var message = new UnityToReactMessage { type = messageType, data = data };
        string jsonMessage = JsonUtility.ToJson(message);
        
        Debug.Log($"FloorlineSceneManager: Sending message to React Native: {jsonMessage}");
        
        // This would be handled by your React Native Unity bridge
        // The exact implementation depends on your bridge setup
    }
    
    // Data structures for JSON communication
    [System.Serializable]
    public class NavigationData
    {
        public string category;
        public int index;
    }
    
    [System.Serializable]
    public class UnityToReactMessage
    {
        public string type;
        public string data;
    }
}

#if UNITY_EDITOR
using UnityEditor;

[CustomEditor(typeof(FloorlineSceneManager))]
public class FloorlineSceneManagerEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        
        FloorlineSceneManager manager = (FloorlineSceneManager)target;
        
        GUILayout.Space(10);
        
        if (GUILayout.Button("Find Scene Components"))
        {
            manager.GetType().GetMethod("FindSceneComponents", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.Invoke(manager, null);
        }
        
        if (GUILayout.Button("Add Floorline Scene to Build Settings"))
        {
            AddFloorlineSceneToBuildSettings();
        }
    }
    
    private void AddFloorlineSceneToBuildSettings()
    {
        string scenePath = "Assets/Scenes/floorline.unity";
        
        var scenes = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
        
        // Check if scene is already in build settings
        bool sceneExists = scenes.Any(scene => scene.path == scenePath);
        
        if (!sceneExists)
        {
            scenes.Add(new EditorBuildSettingsScene(scenePath, true));
            EditorBuildSettings.scenes = scenes.ToArray();
            Debug.Log("FloorlineSceneManager: Added floorline.unity to build settings");
        }
        else
        {
            Debug.Log("FloorlineSceneManager: floorline.unity already in build settings");
        }
    }
}
#endif
