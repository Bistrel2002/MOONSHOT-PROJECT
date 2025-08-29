using UnityEngine;
using System.Collections.Generic;
using System;

public class UnityBridge : MonoBehaviour
{
    [Header("Unity Bridge Settings")]
    public DestinationManager destinationManager;
    
    [Tooltip("GameObject name that React Native will send messages to")]
    public string gameObjectName = "UnityBridge";
    
    [Tooltip("Method name that React Native will call")]
    public string methodName = "ReceiveMessageFromReactNative";
    
    private void Start()
    {
        // Ensure this GameObject has the correct name for React Native communication
        if (gameObject.name != gameObjectName)
        {
            gameObject.name = gameObjectName;
        }
        
        // Find DestinationManager if not assigned
        if (destinationManager == null)
        {
            destinationManager = FindObjectOfType<DestinationManager>();
            if (destinationManager == null)
            {
                Debug.LogError("UnityBridge: DestinationManager not found! Please assign it in the Inspector.");
            }
        }
        
        Debug.Log($"UnityBridge initialized. GameObject: {gameObject.name}, Method: {methodName}");
    }
    
    /// <summary>
    /// This method is called by React Native via react-native-unity
    /// The message parameter contains JSON data from React Native
    /// </summary>
    public void ReceiveMessageFromReactNative(string message)
    {
        try
        {
            Debug.Log($"UnityBridge: ===== MESSAGE RECEIVED FROM REACT NATIVE =====");
            Debug.Log($"UnityBridge: Raw message: {message}");
            Debug.Log($"UnityBridge: GameObject name: {gameObject.name}");
            Debug.Log($"UnityBridge: Method: {methodName}");

            // Parse the JSON message - handle both old and new formats
            var navMessage = JsonUtility.FromJson<NavigationMessage>(message);
            
            if (navMessage == null)
            {
                Debug.LogError("UnityBridge: Failed to parse JSON message");
                return;
            }
            
            // Handle different actions
            switch (navMessage.action)
            {
                case "navigate":
                    HandleNavigation(navMessage);
                    break;
                case "getdestinations":
                    SendDestinationsToReactNative();
                    break;
                case "loadscene":
                    HandleSceneLoading(navMessage);
                    break;
                default:
                    Debug.LogWarning($"UnityBridge: Unknown action: {navMessage.action}");
                    break;
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"UnityBridge: Error processing message: {e.Message}");
        }
    }
    
    /// <summary>
    /// Handle navigation requests from React Native
    /// </summary>
    private void HandleNavigation(NavigationMessage navMessage)
    {
        try
        {
            Debug.Log("UnityBridge: ===== NAVIGATION REQUEST RECEIVED =====");
            Debug.Log($"UnityBridge: Category: {navMessage.category}, Index: {navMessage.index}");

            if (destinationManager == null)
            {
                Debug.LogError("UnityBridge: DestinationManager not available for navigation");
                SendResponseToReactNative("navigation_error", "DestinationManager not found");
                return;
            }
            
            if (navMessage == null)
            {
                Debug.LogError("UnityBridge: Navigation message is null");
                return;
            }
            
            if (string.IsNullOrEmpty(navMessage.category))
            {
                Debug.LogError("UnityBridge: Category is required for navigation");
                return;
            }
            
            // Validate the category exists
            if (!destinationManager.HasCategory(navMessage.category))
            {
                Debug.LogError($"UnityBridge: Category '{navMessage.category}' not found in DestinationManager");
                return;
            }
            
            // Validate the index is within range
            int destinationCount = destinationManager.GetDestinationCount(navMessage.category);
            if (navMessage.index < 0 || navMessage.index >= destinationCount)
            {
                Debug.LogError($"UnityBridge: Index {navMessage.index} is out of range for category '{navMessage.category}' (valid range: 0-{destinationCount-1})");
                return;
            }
            
            Debug.Log($"UnityBridge: Navigating to {navMessage.category} at index {navMessage.index}");
            
            // Call the DestinationManager to set the destination
            destinationManager.SetDestination(navMessage.category, navMessage.index);

            Debug.Log($"UnityBridge: Navigation started successfully!");
            Debug.Log($"UnityBridge: Destination set to category '{navMessage.category}' index {navMessage.index}");

            // Send confirmation back to React Native
            SendResponseToReactNative("navigation_started", $"Started navigation to {navMessage.category} at index {navMessage.index}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"UnityBridge: HandleNavigation crashed with error: {e.Message}");
            Debug.LogError($"UnityBridge: Stack trace: {e.StackTrace}");
        }
    }
    
    /// <summary>
    /// Send the list of categories and destinations back to React Native
    /// </summary>
    private void SendDestinationsToReactNative()
    {
        if (destinationManager == null)
        {
            Debug.LogError("UnityBridge: DestinationManager not available for getting destinations");
            return;
        }
        
        try
        {
            // Get all categories and destinations
            var allCategories = destinationManager.GetAllCategories();
            
            // Convert to a format that can be serialized to JSON
            var destinationsData = new DestinationsData();
            destinationsData.categories = new List<CategoryData>();
            
            foreach (var category in allCategories)
            {
                var categoryData = new CategoryData();
                categoryData.categoryName = category.categoryName;
                categoryData.destinations = new List<DestinationData>();
                
                for (int i = 0; i < category.destinations.Count; i++)
                {
                    var dest = category.destinations[i];
                    if (dest != null)
                    {
                        var destinationData = new DestinationData();
                        destinationData.name = dest.name;
                        destinationData.index = i;
                        destinationData.position = new Vector3Data
                        {
                            x = dest.position.x,
                            y = dest.position.y,
                            z = dest.position.z
                        };
                        categoryData.destinations.Add(destinationData);
                    }
                }
                
                destinationsData.categories.Add(categoryData);
            }
            
            // Convert to JSON
            string destinationsJson = JsonUtility.ToJson(destinationsData);
            
            // Send back to React Native
            SendResponseToReactNative("destinations_list", destinationsJson);
            
            Debug.Log($"UnityBridge: Sent destinations list to React Native: {destinationsJson}");
        }
        catch (Exception e)
        {
            Debug.LogError($"UnityBridge: Error getting destinations: {e.Message}");
            SendResponseToReactNative("destinations_error", e.Message);
        }
    }
    
    /// <summary>
    /// Send a response back to React Native
    /// </summary>
    private void SendResponseToReactNative(string type, string data)
    {
        var response = new UnityResponse
        {
            type = type,
            data = data
        };
        
        string responseJson = JsonUtility.ToJson(response);
        
        // Log the response
        Debug.Log($"UnityBridge: Response to React Native: {responseJson}");
        
        // Use the service to send the message back to React Native
        UnityToReactNativeService.Instance.SendMessageToReactNative(responseJson);
    }
    
    /// <summary>
    /// Public method to manually trigger destination list sending
    /// Can be called from Unity Inspector for testing
    /// </summary>
    [ContextMenu("Send Destinations to React Native")]
    public void ManualSendDestinations()
    {
        SendDestinationsToReactNative();
    }
    
    /// <summary>
    /// Handle scene loading requests from React Native
    /// </summary>
    private void HandleSceneLoading(NavigationMessage navMessage)
    {
        try
        {
            Debug.Log("UnityBridge: HandleSceneLoading called");
            Debug.Log($"UnityBridge: Current scene: {UnityEngine.SceneManagement.SceneManager.GetActiveScene().name}");

            // For now, we'll just send a success response since the scene is already loaded
            // In a more complex setup, you could add scene loading logic here
            SendResponseToReactNative("scene_loaded", "{\"scene_name\":\"floorline\"}");

            Debug.Log("UnityBridge: Scene loading handled successfully!");

            // Also send AR scene ready signal
            SendResponseToReactNative("ar_scene_ready", "AR navigation ready");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"UnityBridge: HandleSceneLoading crashed with error: {e.Message}");
            SendResponseToReactNative("scene_load_error", e.Message);
        }
    }

    /// <summary>
    /// Test the communication logic that React Native would use
    /// </summary>
    [ContextMenu("Test React Native Communication")]
    public void TestReactNativeCommunication()
    {
        try
        {
            Debug.Log("UnityBridge: Testing React Native communication logic...");
            
            // Simulate the message React Native would send
            string testMessage = "{\"action\":\"getdestinations\"}";
            Debug.Log($"UnityBridge: Simulating message from React Native: {testMessage}");
            
            // Process it like React Native would
            ReceiveMessageFromReactNative(testMessage);
            
            Debug.Log("UnityBridge: React Native communication test completed!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"UnityBridge: Communication test failed: {e.Message}");
        }
    }
    
    /// <summary>
    /// Test sending a simple message back to React Native
    /// </summary>
    [ContextMenu("Test Send Message to React Native")]
    public void TestSendMessageToReactNative()
    {
        try
        {
            Debug.Log("UnityBridge: Testing send message to React Native...");
            
            // Send a test message
            SendResponseToReactNative("test_message", "Hello from Unity! This is a test message.");
            
            Debug.Log("UnityBridge: Test message sent to React Native!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"UnityBridge: Test send message failed: {e.Message}");
        }
    }
    
    /// <summary>
    /// Test navigation to a specific destination
    /// </summary>
    [ContextMenu("Test Navigation to Facilities[0]")]
    public void TestNavigation()
    {
        try
        {
            Debug.Log("UnityBridge: TestNavigation called - checking setup...");
            
            // Check if DestinationManager exists
            if (destinationManager == null)
            {
                Debug.LogError("UnityBridge: DestinationManager is null! Cannot test navigation.");
                return;
            }
            
            // Check if categories exist
            if (destinationManager.categories == null)
            {
                Debug.LogError("UnityBridge: DestinationManager.categories is null!");
                return;
            }
            
            if (destinationManager.categories.Count == 0)
            {
                Debug.LogWarning("UnityBridge: No categories found in DestinationManager");
                return;
            }
            
            // Debug: Show what's actually in the DestinationManager
            Debug.Log($"UnityBridge: DestinationManager has {destinationManager.categories.Count} categories");
            for (int i = 0; i < destinationManager.categories.Count; i++)
            {
                var cat = destinationManager.categories[i];
                Debug.Log($"UnityBridge: Category {i}: '{cat.categoryName}' with {cat.destinations.Count} destinations");
            }
            
            // Find a valid category
            string categoryName = "Facilities";
            if (!destinationManager.HasCategory(categoryName))
            {
                // Use first available category
                if (destinationManager.categories.Count > 0)
                {
                    categoryName = destinationManager.categories[0].categoryName;
                    Debug.Log($"UnityBridge: Facilities not found, using first category: '{categoryName}'");
                }
                else
                {
                    Debug.LogError("UnityBridge: No categories available in DestinationManager!");
                    return;
                }
            }
            
            // Check if category has destinations
            int destinationCount = destinationManager.GetDestinationCount(categoryName);
            if (destinationCount == 0)
            {
                Debug.LogWarning($"UnityBridge: Category '{categoryName}' has no destinations");
                return;
            }
            
            Debug.Log($"UnityBridge: Testing navigation to '{categoryName}'[0] (out of {destinationCount} destinations)");
            
            // Call SetDestination safely
            destinationManager.SetDestination(categoryName, 0);
            
            Debug.Log($"UnityBridge: Test navigation completed successfully!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"UnityBridge: TestNavigation crashed with error: {e.Message}");
            Debug.LogError($"UnityBridge: Stack trace: {e.StackTrace}");
        }
    }
}

// Data structures for JSON serialization
[System.Serializable]
public class NavigationMessage
{
    public string action;
    public string category;
    public int index;
}

[System.Serializable]
public class UnityResponse
{
    public string type;
    public string data;
}

[System.Serializable]
public class DestinationsData
{
    public List<CategoryData> categories;
}

[System.Serializable]
public class CategoryData
{
    public string categoryName;
    public List<DestinationData> destinations;
}

[System.Serializable]
public class DestinationData
{
    public string name;
    public int index;
    public Vector3Data position;
}

[System.Serializable]
public class Vector3Data
{
    public float x;
    public float y;
    public float z;
}
