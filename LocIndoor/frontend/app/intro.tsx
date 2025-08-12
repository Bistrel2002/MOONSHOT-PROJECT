import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Polygon } from 'react-native-svg';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface IntroScreenProps {
  onLoginPress: () => void;
  onSignUpPress: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onLoginPress, onSignUpPress }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Animation references
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoMoveUp = useRef(new Animated.Value(0)).current;
  const particleAnimation = useRef(new Animated.Value(0)).current;
  const circleAnimation = useRef(new Animated.Value(0)).current;
  const welcomeSlide = useRef(new Animated.Value(height)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(50)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start intro sequence
    startIntroAnimation();
  }, []);

  const startIntroAnimation = () => {
    // Phase 1: Logo entrance (0-800ms)
    Animated.parallel([
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Particles and effects (400-1200ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(particleAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circleAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // Phase 3: Show welcome section (1500ms)
    setTimeout(() => {
      setShowWelcome(true);
      startWelcomeAnimation();
    }, 3000);

    // Start continuous animations
    startContinuousAnimations();
  };

  const startWelcomeAnimation = () => {
    Animated.sequence([
      // Welcome message slides up and logo moves up
      Animated.parallel([
        Animated.timing(welcomeSlide, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoMoveUp, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Buttons appear with delay
      Animated.parallel([
        Animated.timing(buttonsSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const startContinuousAnimations = () => {
    // Glow animation loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }),
        Animated.timing(particleAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
        }),
        Animated.timing(circleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // Floating animation loop
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingLoop.start();
  };

  // Calculate animated values
  const logoScale = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const logoTranslateY = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const particleScale = particleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const circleScale = circleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const floatingTranslateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10],
  });

  const logoMoveUpTranslateY = logoMoveUp.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, -20, -80],
    extrapolate: 'clamp',
  });

  const combinedLogoTranslateY = Animated.add(logoTranslateY, logoMoveUpTranslateY);

  const ARElements = () => (
    <View style={styles.arElementsContainer}>
      {/* Floating Particles */}
      <Animated.View
        style={[
          styles.particle1,
          {
            opacity: particleAnimation,
            transform: [
              { scale: particleScale },
              { translateY: floatingTranslateY }
            ]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.particle2,
          {
            opacity: particleAnimation,
            transform: [
              { scale: particleScale },
              { translateY: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [10, -10],
              }) }
            ]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.particle3,
          {
            opacity: particleAnimation,
            transform: [
              { scale: particleScale },
              { translateY: floatingTranslateY }
            ]
          }
        ]}
      />

      {/* AR Grid Lines */}
      <Animated.View
        style={[
          styles.gridContainer,
          { opacity: circleAnimation }
        ]}
      >
        <Svg width="100%" height="100%" style={styles.svgOverlay}>
          <Line
            x1="10%"
            y1="20%"
            x2="90%"
            y2="25%"
            stroke="rgba(0, 212, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Line
            x1="15%"
            y1="70%"
            x2="85%"
            y2="75%"
            stroke="rgba(0, 255, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <Path
            d="M 50 10 Q 80 30 70 60 Q 40 80 10 50"
            stroke="rgba(111, 177, 252, 0.2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4,4"
          />
        </Svg>
      </Animated.View>

      {/* Floating Icons */}
      <Animated.View
        style={[
          styles.floatingIcon1,
          {
            opacity: circleAnimation,
            transform: [{ translateY: floatingTranslateY }]
          }
        ]}
      >
        <Feather name="navigation" size={20} color="rgba(0, 212, 255, 0.6)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingIcon2,
          {
            opacity: circleAnimation,
            transform: [{ translateY: floatingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [15, -15],
            }) }]
          }
        ]}
      >
        <MaterialIcons name="explore" size={24} color="rgba(0, 255, 255, 0.5)" />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* AR Elements Background */}
        <ARElements />

        {/* Main Logo Section */}
        <View style={[styles.logoSection, showWelcome && styles.logoSectionCompact]}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: combinedLogoTranslateY }
                ]
              }
            ]}
          >
            {/* Animated Glow Effect */}
            <Animated.View
              style={[
                styles.logoGlow,
                { opacity: glowOpacity }
              ]}
            />
            
            {/* Main Logo */}
            <LinearGradient
              colors={['#00D4FF', '#6FB1FC', '#00FFFF']}
              style={[styles.logoGradient, showWelcome && styles.logoGradientCompact]}
            >
              <MaterialIcons name="explore" size={showWelcome ? 40 : 60} color="white" />
            </LinearGradient>
            
            {/* Logo Text */}
            <Animated.Text 
              style={[
                styles.logoText,
                showWelcome && styles.logoTextCompact
              ]}
            >
              LOCINDOOR
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.logoSubtext,
                showWelcome && styles.logoSubtextCompact
              ]}
            >
              AR Navigation
            </Animated.Text>
            
            {/* Animated Circles */}
            <Animated.View
              style={[
                styles.animatedCircle1,
                {
                  opacity: circleAnimation,
                  transform: [{ scale: circleScale }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.animatedCircle2,
                {
                  opacity: circleAnimation,
                  transform: [{ scale: circleScale }]
                }
              ]}
            />
          </Animated.View>
        </View>

        {/* Welcome Section - Slides from bottom */}
        {showWelcome && (
          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: welcomeOpacity,
                transform: [{ translateY: welcomeSlide }]
              }
            ]}
          >
            <BlurView intensity={20} style={styles.welcomeCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.welcomeGradient}
              >
                {/* Welcome Content */}
                <View style={styles.welcomeContent}>
                  <View style={styles.welcomeIconContainer}>
                    <LinearGradient
                      colors={['#00D4FF', '#6FB1FC']}
                      style={styles.welcomeIcon}
                    >
                      <Ionicons name="location" size={28} color="white" />
                    </LinearGradient>
                  </View>
                  
                  <Text style={styles.welcomeTitle}>Welcome to the Future</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Experience next-generation AR indoor navigation. 
                    Step into a world where technology meets reality.
                  </Text>
                  
                  {/* Action Buttons */}
                  <Animated.View
                    style={[
                      styles.buttonsContainer,
                      {
                        opacity: buttonsOpacity,
                        transform: [{ translateY: buttonsSlide }]
                      }
                    ]}
                  >
                    {/* Login Button */}
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={onLoginPress}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#00D4FF', '#6FB1FC']}
                        style={styles.buttonGradient}
                      >
                        <Feather name="log-in" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>LOGIN</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    {/* Sign Up Button */}
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={onSignUpPress}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['rgba(0, 212, 255, 0.2)', 'rgba(111, 177, 252, 0.1)']}
                        style={styles.secondaryButtonGradient}
                      >
                        <Feather name="user-plus" size={20} color="#00D4FF" />
                        <Text style={styles.secondaryButtonText}>SIGN UP</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  arElementsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    minHeight: height * 0.6,
  },
  logoSectionCompact: {
    flex: 0.6,
    paddingTop: 200,
    paddingBottom: 20,
    minHeight: height * 0.4,
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 20,
  },
  logoGradientCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 5,
  },
  logoTextCompact: {
    fontSize: 24,
    marginBottom: 3,
  },
  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  logoSubtextCompact: {
    fontSize: 12,
  },
  animatedCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    top: -40,
    left: -40,
  },
  animatedCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    top: -90,
    left: -90,
  },
  // Particles and floating elements
  particle1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 10,
  },
  particle2: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
  particle3: {
    position: 'absolute',
    top: '15%',
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6FB1FC',
    shadowColor: '#6FB1FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 12,
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  svgOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon1: {
    position: 'absolute',
    top: '25%',
    left: '10%',
  },
  floatingIcon2: {
    position: 'absolute',
    top: '35%',
    right: '15%',
  },
  // Welcome section
  welcomeSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
    justifyContent: 'flex-end',
    maxHeight: height * 0.5,
  },
  welcomeCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  welcomeGradient: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconContainer: {
    marginBottom: 20,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.5)',
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
    letterSpacing: 1,
  },
});

export default IntroScreen;