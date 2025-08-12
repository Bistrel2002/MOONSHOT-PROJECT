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

const { width, height } = Dimensions.get('window');

export default function ARNavigationScreen() {
  const { destination } = useLocalSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [distance, setDistance] = useState('45m');
  const [eta, setEta] = useState('2 min');
  const [panelVisible, setPanelVisible] = useState(true);

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

    return () => {
      compassLoop.stop();
      pulseLoop.stop();
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
            Alert.alert(
              'Destination Reached! 🎉',
              `You have arrived at ${destinationData?.name || 'your destination'}.`,
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return prev;
          }
        });
        
        // Update distance and ETA
        setDistance(prev => {
          const currentDistance = parseInt(prev);
          const newDistance = Math.max(0, currentDistance - 8);
          return `${newDistance}m`;
        });
        
        setEta(prev => {
          const currentMinutes = parseInt(prev);
          const newMinutes = Math.max(0, currentMinutes - 0.4);
          return newMinutes < 1 ? '< 1 min' : `${Math.round(newMinutes)} min`;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isNavigating, destinationData, totalSteps]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
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
            router.back();
          }
        }
      ]
    );
  };

  const handleRecenter = () => {
    // Animate recenter action
    Animated.sequence([
      Animated.timing(fadeAnimation, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    Alert.alert('Camera Recentered 🎯', 'AR view has been recentered to your current position.');
  };

  const togglePanel = () => {
    const toValue = panelVisible ? height * 0.4 : 0;
    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setPanelVisible(!panelVisible);
  };

  const compassRotationInterpolate = compassRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* AR Camera Background with Gradient */}
      <LinearGradient
        colors={['#000000', '#1A1A2E', '#16213E']}
        style={styles.arCameraContainer}
      >
        <Animated.View style={[styles.arPlaceholder, { opacity: fadeAnimation }]}>
          <View style={styles.arCenterContent}>
            <Feather name="camera" size={48} color="#00D4FF" />
            <Text style={styles.arPlaceholderText}>AR Camera View</Text>
            <Text style={styles.arSubtext}>Unity AR Component Will Render Here</Text>
            
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

          {/* Direction Indicator Overlay */}
          {isNavigating && (
            <BlurView intensity={80} style={styles.directionOverlay}>
              <View style={styles.directionIndicator}>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepNumber}>{currentStep}</Text>
                </View>
                <View style={styles.directionContent}>
                  <Text style={styles.directionTitle}>Next Step</Text>
                  <Text style={styles.directionText}>
                    {navigationSteps[currentStep - 1]}
                  </Text>
                </View>
                <TouchableOpacity style={styles.arrowButton}>
                  <Feather name="arrow-right" size={24} color="#00D4FF" />
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </Animated.View>

        {/* Top Status Bar */}
        <BlurView intensity={20} style={styles.topStatusBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationName}>
              {destinationData?.name || 'Unknown Destination'}
            </Text>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {isNavigating ? 'Navigating' : 'Ready'}
            </Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Feather name="more-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </BlurView>

        {/* AR Controls */}
        <View style={styles.arControls}>
          <TouchableOpacity style={styles.arControlButton} onPress={handleRecenter}>
            <BlurView intensity={40} style={styles.controlButtonBlur}>
              <Feather name="target" size={20} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.arControlButton} onPress={togglePanel}>
            <BlurView intensity={40} style={styles.controlButtonBlur}>
              <Feather name={panelVisible ? "chevron-down" : "chevron-up"} size={20} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.arControlButton}>
            <BlurView intensity={40} style={styles.controlButtonBlur}>
              <Feather name="settings" size={20} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modern Navigation Panel */}
      <Animated.View 
        style={[
          styles.navigationPanel,
          { transform: [{ translateY: slideAnimation }] }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.panelGradient}
        >
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

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Navigation Progress</Text>
              <Text style={styles.progressSteps}>{currentStep}/{totalSteps}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#00D4FF', '#6FB1FC']}
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStep / totalSteps) * 100}%` }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Current Instruction */}
          <BlurView intensity={10} style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepCircleText}>{currentStep}</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Step {currentStep}</Text>
                <Text style={styles.instructionText}>
                  {navigationSteps[currentStep - 1]}
                </Text>
              </View>
              <TouchableOpacity style={styles.instructionNext}>
                <Feather name="chevron-right" size={20} color="#00D4FF" />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Navigation Controls */}
          <View style={styles.controlsSection}>
            {!isNavigating ? (
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
            ) : (
              <View style={styles.activeControls}>
                <TouchableOpacity 
                  style={styles.pauseButton}
                  onPress={() => setIsNavigating(false)}
                >
                  <BlurView intensity={20} style={styles.controlButtonContent}>
                    <Feather name="pause" size={18} color="#FF9800" />
                    <Text style={styles.pauseButtonText}>Pause</Text>
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.stopButton}
                  onPress={handleStopNavigation}
                >
                  <BlurView intensity={20} style={styles.controlButtonContent}>
                    <Feather name="square" size={18} color="#F44336" />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  arCameraContainer: {
    flex: 1,
    position: 'relative',
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
  topStatusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  arControls: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    flexDirection: 'column',
    gap: 15,
  },
  arControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    width: 56,
    height: 56,
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
});