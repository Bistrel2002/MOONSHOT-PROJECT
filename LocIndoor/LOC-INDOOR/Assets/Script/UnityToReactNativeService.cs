using UnityEngine;
using System;

/// <summary>
/// Service for sending messages from Unity back to React Native
/// This uses Unity's SendMessage system to communicate with the UnityView component
/// </summary>
public class UnityToReactNativeService : MonoBehaviour
{
    private static UnityToReactNativeService _instance;
    public static UnityToReactNativeService Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<UnityToReactNativeService>();
                if (_instance == null)
                {
                    GameObject go = new GameObject("UnityToReactNativeService");
                    _instance = go.AddComponent<UnityToReactNativeService>();
                    DontDestroyOnLoad(go);
                }
            }
            return _instance;
        }
    }
    
    [Header("React Native Communication")]
    [Tooltip("Name of the GameObject that handles React Native communication")]
    public string reactNativeHandlerName = "UnityView";
    
    [Tooltip("Method name to call on the React Native handler")]
    public string methodName = "SendMessageToReactNative";
    
    private void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }
    
    /// <summary>
    /// Send a message to React Native
    /// </summary>
    /// <param name="message">The message to send</param>
    public void SendMessageToReactNative(string message)
    {
        try
        {
            // Try to find the React Native handler GameObject
            GameObject handler = GameObject.Find(reactNativeHandlerName);
            
            if (handler != null)
            {
                // Send message to the handler
                handler.SendMessage(methodName, message, SendMessageOptions.DontRequireReceiver);
                Debug.Log($"UnityToReactNativeService: Sent message to React Native via {reactNativeHandlerName}.{methodName}: {message}");
            }
            else
            {
                // Fallback: try to find any GameObject with the method
                var handlers = FindObjectsOfType<MonoBehaviour>();
                bool messageSent = false;
                
                foreach (var monoHandler in handlers)
                {
                    var method = monoHandler.GetType().GetMethod(methodName, new Type[] { typeof(string) });
                    if (method != null)
                    {
                        method.Invoke(monoHandler, new object[] { message });
                        messageSent = true;
                        Debug.Log($"UnityToReactNativeService: Sent message via {monoHandler.name}.{methodName}: {message}");
                        break;
                    }
                }
                
                if (!messageSent)
                {
                    Debug.LogWarning($"UnityToReactNativeService: No React Native handler found. Message: {message}");
                }
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"UnityToReactNativeService: Error sending message to React Native: {e.Message}");
        }
    }
    
    /// <summary>
    /// Send a structured message to React Native
    /// </summary>
    /// <param name="type">Message type</param>
    /// <param name="data">Message data</param>
    public void SendStructuredMessage(string type, string data)
    {
        var message = new { type = type, data = data };
        string jsonMessage = JsonUtility.ToJson(message);
        SendMessageToReactNative(jsonMessage);
    }
    
    /// <summary>
    /// Send navigation confirmation to React Native
    /// </summary>
    /// <param name="category">Destination category</param>
    /// <param name="index">Destination index</param>
    /// <param name="status">Navigation status</param>
    public void SendNavigationStatus(string category, int index, string status)
    {
        var message = new { 
            type = "navigation_status", 
            category = category, 
            index = index, 
            status = status 
        };
        string jsonMessage = JsonUtility.ToJson(message);
        SendMessageToReactNative(jsonMessage);
    }
    
    /// <summary>
    /// Send destinations list to React Native
    /// </summary>
    /// <param name="destinationsJson">JSON string of destinations</param>
    public void SendDestinationsList(string destinationsJson)
    {
        SendStructuredMessage("destinations_list", destinationsJson);
    }
    
    /// <summary>
    /// Test method to verify communication is working
    /// </summary>
    [ContextMenu("Test Send Message to React Native")]
    public void TestSendMessage()
    {
        SendMessageToReactNative("Hello from Unity! This is a test message.");
    }
}
