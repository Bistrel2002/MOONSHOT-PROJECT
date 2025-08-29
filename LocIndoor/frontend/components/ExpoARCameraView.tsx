import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

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
}

interface ExpoARCameraViewProps {
  destination: Destination | null;
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
}

export default function ExpoARCameraView({ destination, onNavigationStart, onNavigationComplete }: ExpoARCameraViewProps) {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  
  // Animation refs (simplified - only keeping what's needed)
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // No animations needed for clean camera view
    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    // Simulate navigation progress
    if (isNavigating) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < totalSteps) {
            return prev + 1;
          } else {
            setIsNavigating(false);
            onNavigationComplete?.();
            return prev;
          }
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isNavigating, onNavigationComplete, totalSteps]);

  useEffect(() => {
    // Navigation start disabled - will only start when manually triggered
    console.log('Expo AR camera ready, waiting for manual navigation start');
  }, [destination, isCameraReady]);

  const handleCameraReady = () => {
    console.log('Expo Camera AR ready');
    setIsCameraReady(true);
  };

  // No animation interpolations needed for clean camera view

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onCameraReady={handleCameraReady}
      >
        {/* Clean Camera View - No AR Overlays */}
        <View style={styles.cameraOverlay}>
          {/* Only show loading state if camera isn't ready */}
          {!isCameraReady && (
            <View style={styles.loadingContainer}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)']}
                style={styles.loadingCard}
              >
                <Text style={styles.loadingText}>Initializing Camera...</Text>
                <Text style={styles.loadingSubtext}>Setting up camera view</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    position: 'relative',
  },
  // Removed unused styles for clean camera view
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D4FF',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});
