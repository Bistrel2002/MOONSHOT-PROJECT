import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { UnityARView } from '../components/UnityARView';
import { ExpoARCameraView } from '../components/ExpoARCameraView';

const { width, height } = Dimensions.get('window');

export default function ARNavigationScreen() {
  const { destination } = useLocalSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [distance, setDistance] = useState('45m');
  const [eta, setEta] = useState('2 min');
  const [panelVisible, setPanelVisible] = useState(true);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [useUnityAR, setUseUnityAR] = useState(true); // Enable Unity AR to load floorline scene
  const [unityAvailable, setUnityAvailable] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const compassRotation = useRef(new Animated.Value(0)).current;

  const destinationData = destination ? JSON.parse(destination as string) : null;

  const navigationSteps = [
    "Head north towards the main corridor",
    "Turn right at the first intersection", 
    "Continue straight for 20 meters",
    "Turn left after the elevator",
    "Destination is on your right"
  ];

  useEffect(() => {
    // Request camera permissions
    const requestCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
        console.log('Camera permission status:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'This app needs camera access to provide AR navigation. Please enable camera permissions in your device settings.',
            [
              { text: 'Cancel', onPress: () => router.back() },
              { text: 'OK', onPress: () => router.back() }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setHasCameraPermission(false);
      }
    };

    requestCameraPermissions();

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous compass rotation
    const compassLoop = Animated.loop(
      Animated.timing(compassRotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    compassLoop.start();

    // Pulse animation for navigation indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Unity initialization with fallback to Expo camera
    const initializeARSystem = async () => {
      // Wait for camera permissions
      if (hasCameraPermission === null) {
        return;
      }
      
      if (!hasCameraPermission) {
        console.log('Camera permission denied, cannot initialize AR');
        setIsUnityLoaded(false);
        setUseUnityAR(false);
        setUnityAvailable(false);
        return;
      }

      try {
        console.log('Camera permissions granted - testing Unity availability...');
        
        // Test Unity availability with a timeout
        const unityTest = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              // Try to access Unity functionality
              // In a real scenario, you'd check if Unity module is available
              console.log('Testing Unity integration...');
              
              // Enable Unity integration to load floorline.unity scene
              // Set to true to use your actual Unity AR navigation scene
              const hasUnityLibrary = true; // Enable Unity to load floorline.unity scene
              
              if (hasUnityLibrary) {
                setIsUnityLoaded(true);
                setUnityAvailable(true);
                setUseUnityAR(true); // Enable Unity AR for floorline scene
                console.log('Unity AR available and initialized - floorline scene ready');
                resolve(true);
              } else {
                throw new Error('Unity library not found');
              }
            } catch (error) {
              reject(error);
            }
          }, 1000);
        });

        await unityTest;
        
        if (destinationData) {
          console.log('Destination data available for Unity:', destinationData);
        }
        
      } catch (error) {
        console.log('Unity not available, using Expo camera fallback:', error);
        setIsUnityLoaded(false);
        setUseUnityAR(false);
        setUnityAvailable(false);
        
        // Expo camera will be used as fallback
        console.log('Expo Camera AR fallback activated');
      }
    };
    
    // Initialize AR system only after camera permissions are determined
    if (hasCameraPermission !== null) {
      initializeARSystem();
    }

    return () => {
      compassLoop.stop();
      pulseLoop.stop();
    };
  }, [hasCameraPermission, destinationData]);

  // Removed automatic navigation simulation - no fake timers or auto progress

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setPanelVisible(false); // Minimize panel when navigation starts
    
    // Animate to minimized panel state
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Animate the compass to show activation
    Animated.timing(pulseAnimation, {
      toValue: 1.3,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    
    console.log('Navigation started - waiting for AR system to handle routing');
  };

  const handleStopNavigation = () => {
    Alert.alert(
      'Stop Navigation 🛑',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive', 
          onPress: () => {
            setIsNavigating(false);
            setPanelVisible(true); // Restore full panel
            
            // Animate back to full panel
            Animated.timing(slideAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
            
            router.back();
          }
        }
      ]
    );
  };



  const compassRotationInterpolate = compassRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <Animated.View 
            style={[
              styles.header,
              { opacity: fadeAnimation }
            ]}
          >
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>AR Navigation</Text>
              <Text style={styles.headerSubtitle}>
                {destinationData?.name || 'Unknown Destination'}
              </Text>
            </View>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {isNavigating ? 'Navigating' : 'Ready'}
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* AR Camera View with Unity and Expo Camera Fallback */}
      <View style={styles.arCameraContainer}>
        {hasCameraPermission === false ? (
          <LinearGradient
            colors={['#000000', '#1A1A2E', '#16213E']}
            style={styles.arFallbackContainer}
          >
            <Animated.View style={[styles.arPlaceholder, { opacity: fadeAnimation }]}>
              <View style={styles.arCenterContent}>
                <Feather name="camera-off" size={48} color="#FF6B6B" />
                <Text style={styles.arPlaceholderText}>Camera Access Required</Text>
                <Text style={styles.arSubtext}>
                  Please enable camera permissions to use AR navigation
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>
        ) : useUnityAR && isUnityLoaded && unityAvailable && hasCameraPermission ? (
          // Try Unity AR View with error boundary
          <View style={styles.arCameraContainer}>
            <UnityARView
              destination={destinationData}
              onNavigationStart={() => {
                console.log('Unity AR navigation started');
                setIsNavigating(true);
              }}
              onNavigationComplete={() => {
                console.log('Unity AR navigation completed');
                // No automatic completion - let Unity handle the navigation flow
              }}
            />
            {/* Add overlay message */}
            <View style={styles.unityOverlay}>
              <Text style={styles.unityOverlayText}>Loading Unity AR Scene...</Text>
              <Text style={styles.unityOverlaySubtext}>Floor line rendering initializing</Text>
            </View>
          </View>
        ) : hasCameraPermission ? (
          <ExpoARCameraView
            destination={destinationData}
            onNavigationStart={() => {
              console.log('Expo AR navigation started');
              setIsNavigating(true);
            }}
            onNavigationComplete={() => {
              console.log('Expo AR navigation completed');
              // No automatic completion - just show the AR navigation
            }}
          />
        ) : (
          <LinearGradient
            colors={['#000000', '#1A1A2E', '#16213E']}
            style={styles.arFallbackContainer}
          >
            <Animated.View style={[styles.arPlaceholder, { opacity: fadeAnimation }]}>
              <View style={styles.arCenterContent}>
                <Feather name="camera" size={48} color="#00D4FF" />
                <Text style={styles.arPlaceholderText}>
                  {hasCameraPermission === null ? 'Requesting Camera Access...' : 'Initializing AR Camera...'}
                </Text>
                <Text style={styles.arSubtext}>
                  {hasCameraPermission === null 
                    ? 'Please grant camera permission' 
                    : 'Loading AR system...'}
                </Text>
                
                {/* AR Compass */}
                <Animated.View 
                  style={[
                    styles.arCompass,
                    { 
                      transform: [
                        { rotate: compassRotationInterpolate },
                        { scale: pulseAnimation }
                      ]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#00D4FF', '#6FB1FC']}
                    style={styles.compassGradient}
                  >
                    <MaterialIcons name="navigation" size={32} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </View>
            </Animated.View>
          </LinearGradient>
        )}

        {/* Navigation Active Indicator */}
        {isNavigating && (
          <BlurView intensity={80} style={styles.directionOverlay}>
            <View style={styles.directionIndicator}>
              <View style={styles.stepIndicator}>
                <MaterialIcons name="navigation" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.directionContent}>
                <Text style={styles.directionTitle}>AR Navigation Active</Text>
                <Text style={styles.directionText}>
                  Navigating to {destinationData?.name || 'destination'}
                </Text>
              </View>
            </View>
          </BlurView>
        )}
      </View>

      {/* Navigation Panel - Full or Minimized */}
      <Animated.View 
        style={[
          isNavigating ? styles.minimizedPanel : styles.navigationPanel,
          { transform: [{ translateY: slideAnimation }] }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={isNavigating ? styles.minimizedPanelGradient : styles.panelGradient}
        >
          {!isNavigating ? (
            // Full Panel - Before Navigation Starts
            <>
              {/* Panel Header */}
              <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
                <View style={styles.quickStats}>
                  <View style={styles.quickStatItem}>
                    <Text style={styles.quickStatValue}>{distance}</Text>
                    <Text style={styles.quickStatLabel}>Distance</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.quickStatItem}>
                    <Text style={styles.quickStatValue}>{eta}</Text>
                    <Text style={styles.quickStatLabel}>ETA</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.quickStatItem}>
                    <Text style={styles.quickStatValue}>95%</Text>
                    <Text style={styles.quickStatLabel}>Accuracy</Text>
                  </View>
                </View>
              </View>

              {/* Navigation Info */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Navigation Ready</Text>
                  <Text style={styles.progressSteps}>AR Mode</Text>
                </View>
              </View>

              {/* Destination Info */}
              <BlurView intensity={10} style={styles.instructionCard}>
                <View style={styles.instructionHeader}>
                  <View style={styles.stepCircle}>
                    <MaterialIcons name="place" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionTitle}>Destination</Text>
                    <Text style={styles.instructionText}>
                      {destinationData?.name || 'Selected location'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.instructionNext}>
                    <Feather name="chevron-right" size={20} color="#00D4FF" />
                  </TouchableOpacity>
                </View>
              </BlurView>

              {/* Navigation Controls */}
              <View style={styles.controlsSection}>
                <TouchableOpacity 
                  style={styles.startButton} 
                  onPress={handleStartNavigation}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.startButtonGradient}
                  >
                    <Feather name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Start Navigation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Minimized Panel - During Navigation
            <View style={styles.minimizedContent}>
              {/* Navigation Status */}
              <View style={styles.minimizedProgressSection}>
                <View style={styles.minimizedProgressHeader}>
                  <Text style={styles.minimizedProgressText}>
                    AR Navigation Active • {destinationData?.name || 'Destination'}
                  </Text>
                </View>
              </View>

              {/* Minimized Controls */}
              <View style={styles.minimizedControls}>
                <TouchableOpacity 
                  style={styles.minimizedStopButton}
                  onPress={handleStopNavigation}
                >
                  <Feather name="square" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerGradient: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  arCameraContainer: {
    flex: 1,
    position: 'relative',
    marginTop: -10,
  },
  arFallbackContainer: {
    flex: 1,
  },
  arPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arPlaceholderText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  arSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  arCompass: {
    marginTop: 40,
  },
  compassGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  directionOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  directionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  directionContent: {
    flex: 1,
  },
  directionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D4FF',
    marginBottom: 4,
  },
  directionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 22,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  navigationPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  panelGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  minimizedPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  minimizedPanelGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  minimizedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minimizedProgressSection: {
    flex: 1,
    marginRight: 15,
  },
  minimizedProgressHeader: {
    marginBottom: 8,
  },
  minimizedProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  minimizedProgressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  minimizedProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  minimizedControls: {
    flexDirection: 'row',
  },
  minimizedStopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressSteps: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D4FF',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  instructionCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepCircleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  instructionNext: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsSection: {
    marginBottom: 20,
  },
  startButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  pauseButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  stopButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  unityToggleButton: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  unityToggleText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unityOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
  },
  unityOverlayText: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  unityOverlaySubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});