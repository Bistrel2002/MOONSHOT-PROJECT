import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import UnityView from '@azesmway/react-native-unity';

interface UnityARViewProps {
  destination?: any;
  onNavigationComplete?: () => void;
  onNavigationStart?: () => void;
}

export const UnityARView: React.FC<UnityARViewProps> = ({
  destination,
  onNavigationComplete,
  onNavigationStart
}) => {
  const unityRef = useRef<any>(null);

  useEffect(() => {
    console.log('UnityARView mounted - initializing Unity component');
    
    // Add delay to ensure Unity component is properly mounted
    const initializeUnity = () => {
      if (unityRef.current) {
        console.log('Unity reference found, loading floorline scene...');
        
        try {
          // First: Load the floorline scene (your AR navigation scene with floor line rendering)
          unityRef.current.postMessage(
            'ReactNativeMessageHandler', // Our custom message handler
            'LoadScene', // Method to load scene
            'floorline' // Your AR navigation scene name
          );
          
          // Wait for scene to load, then send destination data
          if (destination) {
            setTimeout(() => {
              console.log('Setting destination in Unity floorline scene:', destination);
              
              try {
                // Based on your DestinationManager script, we need to call SetDestination(category, index)
                const category = "Rooms"; // You can make this dynamic based on destination.category
                const index = 0; // You can map destination.name to specific index
                
                console.log(`Calling SetDestination with category: ${category}, index: ${index}`);
                
                          // Send destination to FloorlineSceneManager in your floorline scene
          unityRef.current.postMessage(
            'FloorlineSceneManager', // Our Unity script for floorline scene
            'SetNavigationDestination', // Method to call your DestinationManager and ArrowPathRenderer
            JSON.stringify({ category: category, index: index })
          );
                
                onNavigationStart?.();
                console.log('Unity floor line navigation started for:', destination.name);
              } catch (error) {
                console.error('Error sending destination to Unity:', error);
              }
            }, 3000); // Longer delay to ensure scene loads completely
          }
        } catch (error) {
          console.error('Error communicating with Unity:', error);
        }
      } else {
        console.warn('Unity reference not available, retrying...');
        // Retry after a delay
        setTimeout(initializeUnity, 1000);
      }
    };
    
    // Start initialization after component mount
    setTimeout(initializeUnity, 500);
  }, [destination]);

  const handleUnityMessage = (data: string) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'ar_initialized':
          console.log('Unity AR camera initialized successfully');
          break;
        case 'ar_error':
          console.error('Unity AR initialization error:', message.error);
          break;
        case 'camera_permission_denied':
          console.warn('Camera permission denied in Unity');
          break;
        case 'navigation_complete':
          onNavigationComplete?.();
          break;
        case 'navigation_progress':
          console.log('Navigation progress:', message.progress);
          break;
        default:
          console.log('Unity message:', message);
      }
    } catch (error) {
      console.error('Error parsing Unity message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <UnityView
        ref={unityRef}
        style={styles.unityView}
        onUnityMessage={handleUnityMessage}
        onError={(error: any) => {
          console.error('Unity component error:', error);
          // You could trigger a callback here to switch to fallback camera
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  unityView: {
    flex: 1,
  },
});