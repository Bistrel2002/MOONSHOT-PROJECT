import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import UnityService from '../services/unityService';

// Safely import Unity with error handling - only when needed
let UnityView: any = null;
let isUnityAvailable = false;

const initializeUnity = () => {
  if (UnityView !== null) return; // Already initialized

  try {
    UnityView = require('@azesmway/react-native-unity').default;
    isUnityAvailable = true;
    console.log('UnityTestView: Unity module imported successfully');
  } catch (error) {
    console.log('UnityTestView: Unity module not available:', error);
    isUnityAvailable = false;
    throw error; // Re-throw to handle gracefully
  }
};

interface UnityTestViewProps {
  onUnityReady?: () => void;
  onUnityError?: (error: string) => void;
}

export default function UnityTestView({ onUnityReady, onUnityError }: UnityTestViewProps) {
  const unityRef = useRef<any>(null);
  const [unityInitialized, setUnityInitialized] = useState(false);

  useEffect(() => {
    // Delay Unity initialization to prevent immediate crashes
    const timer = setTimeout(() => {
      try {
        initializeUnity();
        setUnityInitialized(true);
      } catch (error) {
        console.error('UnityTestView: Failed to initialize Unity:', error);
        onUnityError?.('Unity initialization failed');
      }
    }, 3000); // Wait 3 seconds before initializing

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Set the UnityView reference in UnityService when component mounts and Unity is ready
    if (unityInitialized && unityRef.current) {
      UnityService.setUnityViewRef(unityRef.current);
      console.log('UnityTestView: UnityView reference set in UnityService');
    }
  }, [unityInitialized, unityRef.current]);

  const handleUnityMessage = (message: string) => {
    try {
      console.log('UnityTestView: Unity message received:', message);

      // Forward the message to UnityService for handling
      UnityService.handleUnityResponse(message);

      // Check if Unity is ready
      const data = JSON.parse(message);
      if (data.type === 'unity_ready' || data.type === 'scene_loaded') {
        console.log('UnityTestView: Unity is ready');
        onUnityReady?.();
      }
    } catch (error) {
      console.error('UnityTestView: Error handling Unity message:', error);
    }
  };

    const handleUnityLoaded = () => {
    console.log('UnityTestView: Unity system loaded successfully');
    console.log('UnityTestView: UnityRef available:', !!unityRef.current);
    console.log('UnityTestView: UnityRef has postMessage:', !!(unityRef.current && unityRef.current.postMessage));

    // Set the UnityView reference when Unity is loaded
    if (unityRef.current) {
      console.log('UnityTestView: Setting UnityView reference...');
      UnityService.setUnityViewRef(unityRef.current);
      console.log('UnityTestView: UnityView reference set after Unity loaded');
      console.log('UnityTestView: UnityService isReady:', UnityService.isReady());
      onUnityReady?.();
    } else {
      console.error('UnityTestView: UnityRef is null after Unity loaded');
      onUnityError?.('UnityView reference is null');
    }
  };

  const handleUnityError = (error: string) => {
    console.error('UnityTestView: Unity error:', error);
    onUnityError?.(error);
  };

  // If Unity is not available or not initialized yet, return null
  if (!unityInitialized || !isUnityAvailable || !UnityView) {
    return null;
  }

  return (
    <View style={styles.container}>
      <UnityView
        ref={unityRef}
        style={styles.unityView}
        onUnityMessage={handleUnityMessage}
        onUnityReady={handleUnityLoaded}
        onPlayerUnload={() => console.log('UnityTestView: Unity unloaded')}
        onPlayerQuit={() => console.log('UnityTestView: Unity quit')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -1000, // Hide off-screen
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },
  unityView: {
    width: 1,
    height: 1,
  },
});
