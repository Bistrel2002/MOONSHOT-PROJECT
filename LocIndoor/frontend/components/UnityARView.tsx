import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import UnityView from '@azesmway/react-native-unity';
import UnityService from '../services/unityService';

const { width, height } = Dimensions.get('window');

interface Destination {
  name: string;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  floor?: string;
  building?: string;
  category?: string;
  index?: number;
}

interface UnityARViewProps {
  destination: Destination | null;
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
}

export default function UnityARView({ destination, onNavigationStart, onNavigationComplete }: UnityARViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [unityStatus, setUnityStatus] = useState<string>('Initializing...');
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [unityCrashed, setUnityCrashed] = useState(false);
  const [showUnity, setShowUnity] = useState(true); // Show Unity immediately
  const [useFallback, setUseFallback] = useState(false);
  const [isLoadingScene, setIsLoadingScene] = useState(false);
  const [unityDestinations, setUnityDestinations] = useState<any[]>([]);
  const [hasLoadedDestinations, setHasLoadedDestinations] = useState(false);
  const unityViewRef = useRef<any>(null);
  const crashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Request camera permissions first
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Requesting camera permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera for AR navigation',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setCameraPermissionGranted(permissionGranted);
        console.log('Camera permission result:', granted, permissionGranted);
        
        if (permissionGranted) {
          setUnityStatus('Camera permission granted - Ready for AR Navigation');
        }
        
        return permissionGranted;
      } catch (err) {
        console.warn('Camera permission request error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the system
    return true;
  };

  useEffect(() => {
    // Request camera permission when component mounts
    requestCameraPermission();

    // No auto-loading - wait for manual trigger
    // Scene will be loaded when user presses AR Navigate button

    // Cleanup function
    return () => {
      if (crashTimeoutRef.current) {
        clearTimeout(crashTimeoutRef.current);
      }
      setShowUnity(false);
      setIsNavigating(false);
      setIsLoadingScene(false);
    };
  }, [destination, unityLoaded, unityCrashed]); // Re-run when destination or unity state changes

  // Handle Unity loaded
  const handleUnityLoaded = () => {
    console.log('Unity loaded successfully');
    console.log('UnityView ref available:', !!unityViewRef.current);
    console.log('UnityView has postMessage:', !!(unityViewRef.current && unityViewRef.current.postMessage));

    setUnityLoaded(true);
    setIsLoadingScene(false); // Stop showing loading indicator
    setUnityStatus('Unity AR Ready - Floorline Scene Available');

    // Set Unity view reference in service
    if (unityViewRef.current) {
      console.log('Setting UnityView ref in service...');
      UnityService.setUnityViewRef(unityViewRef.current);
      UnityService.initialize();
      console.log('Unity service initialized, isReady:', UnityService.isReady());

      // Load destinations from Unity
      loadDestinationsFromUnity();

      // If we have a destination passed from main screen, start navigation
      if (destination && destination.category && destination.index !== undefined) {
        console.log('Destination passed from main screen, starting navigation...');
        setTimeout(() => {
          handleStartNavigation();
        }, 1000); // Wait a moment for destinations to load
      }
    } else {
      console.error('UnityView ref is null when Unity loaded');
    }
  };

  // Load destinations from Unity
  const loadDestinationsFromUnity = async () => {
    try {
      console.log('Loading destinations from Unity...');
      const destinations = await UnityService.getDestinations();
      console.log('Destinations loaded from Unity:', destinations);

      if (destinations.categories && destinations.categories.length > 0) {
        setUnityDestinations(destinations.categories);
        setHasLoadedDestinations(true);
        setUnityStatus('Destinations loaded from Unity');
      }
    } catch (error) {
      console.error('Failed to load destinations from Unity:', error);
      setUnityStatus('Using fallback destinations');
    }
  };

  // Handle Unity messages
  const handleUnityMessage = (message: string) => {
    console.log('Received message from Unity:', message);

    // Clear crash detection timeout
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }

    try {
      // Handle both direct Unity messages and wrapped messages
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch {
        // If it's not JSON, treat it as a plain message
        parsedMessage = { type: 'unity_message', data: message };
      }

      // Handle destinations list response
      if (parsedMessage.type === 'destinations_list') {
        try {
          const destinationsData = JSON.parse(parsedMessage.data);
          console.log('Parsed destinations from Unity:', destinationsData);
          setUnityDestinations(destinationsData.categories || []);
          setHasLoadedDestinations(true);
          setUnityStatus('Destinations loaded from Unity');
        } catch (parseError) {
          console.error('Error parsing destinations data:', parseError);
        }
      }

      // Pass message to Unity service for handling
      UnityService.handleUnityResponse(message);

      // Handle UI-specific responses
      switch (parsedMessage.type) {
        case 'scene_loaded':
          if (parsedMessage.data && parsedMessage.data.scene_name === 'floorline') {
            setUnityStatus('Floorline Scene Loaded - AR Navigation Active');
            setIsNavigating(true);
            setUnityCrashed(false); // Reset crash state
            onNavigationStart?.();
          }
          break;
        case 'ar_scene_ready':
          setUnityStatus('AR Navigation Ready - Point device at floor');
          setUnityCrashed(false);
          break;
        case 'navigation_complete':
          setUnityStatus('Navigation Complete - Destination Reached');
          setIsNavigating(false);
          onNavigationComplete?.();
          break;
        case 'scene_load_error':
          setError(`Failed to load scene: ${parsedMessage.data?.error || 'Unknown error'}`);
          setUnityStatus('Scene Load Error');
          setUnityCrashed(true);
          break;
        case 'navigation_started':
          setUnityStatus('Navigation Active - Follow AR path');
          setIsNavigating(true);
          console.log('🎯 Navigation started successfully');
          break;
        case 'navigation_error':
          setError(`Navigation failed: ${parsedMessage.data || 'Unknown error'}`);
          setUnityStatus('Navigation Error');
          setIsNavigating(false);
          break;
        default:
          console.log('UnityARView: Unhandled Unity message type:', parsedMessage.type);
      }
    } catch (e) {
      console.error('Error parsing Unity message:', e);
      // Still pass raw message to Unity service
      UnityService.handleUnityResponse(message);
    }

    // Set up crash detection - if no message for 10 seconds, assume crash
    crashTimeoutRef.current = setTimeout(() => {
      console.error('Unity appears to have crashed - no messages received for 10 seconds');
      setUnityCrashed(true);
      setUnityStatus('Unity Crashed - Using Fallback Mode');
      setIsNavigating(false);
      setError('Unity engine crashed. Please restart navigation.');
    }, 10000);
  };

  const testUnityConnection = async () => {
    console.log('🧪 Testing Unity connection...');

    try {
      // Test 1: Check if Unity module is available
      console.log('Test 1: Unity module available?', typeof UnityView !== 'undefined');

      // Test 2: Check if Unity view ref exists
      console.log('Test 2: Unity view ref exists?', !!unityViewRef.current);

      // Test 3: Check if postMessage method exists
      const hasPostMessage = !!(unityViewRef.current && unityViewRef.current.postMessage);
      console.log('Test 3: postMessage method exists?', hasPostMessage);

      // Test 4: Try to send a simple test message
      if (hasPostMessage) {
        console.log('Test 4: Sending test message to Unity...');
        unityViewRef.current.postMessage('UnityBridge', 'ReceiveMessageFromReactNative', JSON.stringify({
          action: 'test',
          message: 'Hello from React Native!'
        }));
        console.log('✅ Test message sent successfully');
      } else {
        console.log('❌ Cannot send test message - postMessage not available');
      }

      return true;
    } catch (error) {
      console.error('❌ Unity connection test failed:', error);
      return false;
    }
  };

  const loadFloorlineScene = async () => {
    if (!destination) return;

    // Reset crash state
    setUnityCrashed(false);
    setError(null);

    try {
      console.log('🎯 Loading floorline scene...');
      setIsLoadingScene(true);
      console.log('📊 Current state:', {
        unityLoaded,
        unityServiceReady: UnityService.isReady(),
        unityCrashed,
        unityViewRef: !!unityViewRef.current
      });

      // First, test the Unity connection
      const connectionTest = await testUnityConnection();
      if (!connectionTest) {
        throw new Error('Unity connection test failed');
      }

      if (unityCrashed) {
        throw new Error('Unity previously crashed');
      }

      // Wait for Unity to be properly loaded and ready
      if (!unityLoaded) {
        console.log('⏳ Waiting for Unity to load...');
        let attempts = 0;
        while (!unityLoaded && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!unityLoaded) {
          throw new Error('Unity failed to load within timeout');
        }
      }

      if (!UnityService.isReady()) {
        console.log('⚙️ Unity service not ready, checking UnityView ref...');
        if (unityViewRef.current) {
          console.log('🔗 Setting UnityView ref manually...');
          UnityService.setUnityViewRef(unityViewRef.current);
          // Wait a moment for the service to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('✅ Unity service ready after manual setup:', UnityService.isReady());
        } else {
          throw new Error('UnityView reference not available');
        }
      }

      // Unity view is already shown, no need to set it again

      // Use Unity service to load the floorline scene
      console.log('🚀 Calling UnityService.loadScene("floorline")...');
      await UnityService.loadScene('floorline');

      console.log('🎉 Floorline scene loaded successfully');
      setIsLoadingScene(false);
    } catch (error) {
      console.error('❌ Error loading floorline scene:', error);
      const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : { message: 'Unknown error' };
      console.error('📋 Error details:', errorDetails);
      setUnityCrashed(true);
      setShowUnity(false);
      setIsLoadingScene(false);
    }
  };

  const handleStartNavigation = async () => {
    if (!destination) {
      console.log('No destination selected');
      return;
    }

    console.log('🚀 Starting navigation to:', destination.name);

    try {
      // Check if Unity is ready
      if (!UnityService.isReady()) {
        console.log('Unity service not ready, initializing...');
        if (unityViewRef.current) {
          UnityService.setUnityViewRef(unityViewRef.current);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Send navigation start command to Unity using destination data
      const navigationMessage = {
        action: 'navigate',
        category: destination.category || 'default',
        index: destination.index || 0
      };

      console.log('📤 Sending navigation message to Unity:', navigationMessage);

      if (unityViewRef.current && unityViewRef.current.postMessage) {
        unityViewRef.current.postMessage(
          'UnityBridge',
          'ReceiveMessageFromReactNative',
          JSON.stringify(navigationMessage)
        );

        setIsNavigating(true);
        setUnityStatus('Navigation Started - Follow the AR path');
        console.log('✅ Navigation command sent to Unity');
      } else {
        throw new Error('UnityView not ready for navigation');
      }
    } catch (error) {
      console.error('❌ Failed to start navigation:', error);
      setError('Failed to start navigation');
      setUnityStatus('Navigation Failed');
    }
  };

  const handleStopNavigation = () => {
    console.log('Stopping navigation');

    // Clear crash detection timeout
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }

    setIsNavigating(false);
    setShowUnity(false);
    setUnityStatus('AR Navigation Stopped - Ready to restart');
    onNavigationComplete?.();
  };

  const handleUseFallback = () => {
    setUseFallback(true);
    setUnityStatus('Using Fallback AR Navigation');
    setIsNavigating(true);
    onNavigationStart?.();
  };

  const handleStopFallback = () => {
    setUseFallback(false);
    setIsNavigating(false);
    setUnityStatus('Fallback AR Navigation Stopped');
    onNavigationComplete?.();
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unity AR Error</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Unity View - Clean, minimal interface */}
      {showUnity && !unityCrashed && (
        <UnityView
          ref={unityViewRef}
          style={styles.unityView}
          onUnityMessage={handleUnityMessage}
          onUnityLoaded={handleUnityLoaded}
          onUnityUnloaded={() => {
            console.log('Unity unloaded');
            setUnityLoaded(false);
            setIsNavigating(false);
            setShowUnity(false);
          }}
        />
      )}

      {/* Loading indicator when scene is loading */}
      {isLoadingScene && !unityCrashed && (
        <View style={styles.simpleLoading}>
          <Text style={styles.loadingText}>Loading AR Scene...</Text>
        </View>
      )}

      {/* Simple error state */}
      {unityCrashed && (
        <View style={styles.simpleError}>
          <Text style={styles.errorText}>Failed to load scene</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setUnityCrashed(false);
              loadFloorlineScene();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  unityView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  simpleLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  simpleError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 10,
  },
});
