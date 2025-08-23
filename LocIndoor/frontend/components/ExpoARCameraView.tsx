import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface ExpoARCameraViewProps {
  destination?: any;
  onNavigationComplete?: () => void;
  onNavigationStart?: () => void;
}

export const ExpoARCameraView: React.FC<ExpoARCameraViewProps> = ({
  destination,
  onNavigationComplete,
  onNavigationStart
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    checkCameraPermissions();
  }, []);

  useEffect(() => {
    if (destination && isActive) {
      console.log('ExpoARCameraView: Displaying AR navigation to:', destination.name);
      onNavigationStart?.();
    }
  }, [destination, isActive]);

  const checkCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
      
      if (status === 'granted') {
        setIsActive(true);
        console.log('ExpoARCameraView: Camera permission granted, activating camera');
      } else {
        console.log('ExpoARCameraView: Camera permission denied');
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to provide AR navigation features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('ExpoARCameraView: Error requesting camera permissions:', error);
      setCameraPermission(false);
    }
  };

  const renderAROverlay = () => (
    <View style={styles.arOverlay}>
      {/* Simulated AR Navigation Path */}
      <Svg style={styles.arPath} width={width} height={height}>
        {/* Navigation line */}
        <Path
          d={`M ${width / 2} ${height * 0.9} Q ${width / 2} ${height * 0.6} ${width * 0.8} ${height * 0.3}`}
          stroke="#00D4FF"
          strokeWidth="4"
          fill="none"
          strokeDasharray="10,5"
        />
        
        {/* Waypoint markers */}
        <Circle cx={width / 2} cy={height * 0.9} r="8" fill="#00D4FF" />
        <Circle cx={width * 0.6} cy={height * 0.7} r="6" fill="#00D4FF" />
        <Circle cx={width * 0.8} cy={height * 0.3} r="10" fill="#4CAF50" />
      </Svg>

      {/* AR Navigation Info */}
      <View style={styles.arInfo}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.9)', 'rgba(111, 177, 252, 0.9)']}
          style={styles.infoGradient}
        >
          <MaterialIcons name="navigation" size={24} color="#FFFFFF" />
          <Text style={styles.infoText}>
            Navigate to {destination?.name || 'destination'}
          </Text>
        </LinearGradient>
      </View>

      {/* Navigation indicator */}
      <View style={styles.distanceIndicator}>
        <Text style={styles.distanceText}>AR</Text>
        <Text style={styles.distanceLabel}>Navigation</Text>
      </View>
    </View>
  );

  if (cameraPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF5252']}
          style={styles.errorGradient}
        >
          <MaterialIcons name="camera-alt" size={48} color="#FFFFFF" />
          <Text style={styles.errorText}>Camera Access Required</Text>
          <Text style={styles.errorSubtext}>
            Please enable camera permissions to use AR navigation
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (!isActive || cameraPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#000000', '#1A1A2E']}
          style={styles.loadingGradient}
        >
          <MaterialIcons name="camera" size={48} color="#00D4FF" />
          <Text style={styles.loadingText}>Initializing AR Camera...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      >
        {renderAROverlay()}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  arPath: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  arInfo: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  distanceIndicator: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  distanceText: {
    color: '#00D4FF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  distanceLabel: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#00D4FF',
    marginTop: 16,
    fontWeight: '600',
  },
});
