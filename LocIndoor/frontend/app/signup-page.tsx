import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface SignUpPageProps {
  onSignUp: () => void;
  onLoginPress: () => void;
  onBack?: () => void;
}

export default function SignUpPage({ onSignUp, onLoginPress, onBack }: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideUpAnimation = useRef(new Animated.Value(100)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnimation = useRef(new Animated.Value(1)).current;
  const sparkleAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string): boolean =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): {isValid: boolean; message: string} =>{
    if (password.lenght < 8){
      return{ isValid: false, message: "Password must be at least 8 characters long"};
    }
    if (!/[A-Z]/.test(password)){
      return{ isValid: false, message: "Password must contain at least one uppercase letter"};
    }
    if (!/[a-z]/.test(password)){
      return{ isValid: false, message: "Password must contain at least one lowercase letter"};
    }
    if (!/[0-9]/.test(password)){
      return{ isValid: false, message: "Password must contain at least one number"};
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)){
      return{ isValid: false, message: "Password must contain at least one special character"};
    }
    return{ isValid: true, message: ""};
  };
  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if(!validateEmail(email)){
      Alert.alert('Error', 'Please enter a valid email address \n\nExample: example@example.com');
      return;
    }

    const passwordValidation = validatePassword(password);
    if(!passwordValidation.isValid){
      Alert.alert('Invalid Password', passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignUp();
    }, 2000);
  };

  const handleSocialSignUp = (platform: string) => {
    Alert.alert('Social Sign Up', `${platform} sign up coming soon!`);
  };

  useEffect(() => {
    // Initial entrance animations
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnimation, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation loop
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    sparkleLoop.start();

    // Pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Rotation animation loop
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    return () => {
      sparkleLoop.stop();
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const sparkleOpacity = sparkleAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const rotateInterpolation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // AR Navigation themed decorative elements
  const WelcomeGraphics = () => (
    <View style={styles.graphicsContainer}>
      {/* AR Waypoints with welcoming glow */}
      <Animated.View 
        style={[
          styles.arWaypoint1,
          { 
            opacity: sparkleOpacity,
            transform: [{ scale: pulseAnimation }]
          }
        ]}
      >
        <LinearGradient
          colors={['#00D4FF', '#40E0D0']}
          style={styles.waypointGradient}
        >
          <Feather name="map-pin" size={16} color="white" />
        </LinearGradient>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.arWaypoint2,
          { 
            opacity: sparkleAnimation,
            transform: [
              { rotate: rotateInterpolation },
              { scale: pulseAnimation }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#00FFFF', '#00D4FF']}
          style={styles.waypointGradient}
        >
          <Feather name="navigation" size={18} color="white" />
        </LinearGradient>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.arWaypoint3,
          { 
            opacity: sparkleOpacity,
            transform: [{ scale: pulseAnimation }]
          }
        ]}
      >
        <LinearGradient
          colors={['#6FB1FC', '#9ED8FF']}
          style={styles.waypointGradient}
        >
          <MaterialIcons name="explore" size={14} color="white" />
        </LinearGradient>
      </Animated.View>

      {/* Floating welcome icons */}
      <Animated.View 
        style={[
          styles.floatingWelcomeIcon1,
          {
            opacity: sparkleAnimation,
            transform: [{ 
              translateY: sparkleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -12],
              })
            }]
          }
        ]}
      >
        <Feather name="user-plus" size={20} color="rgba(0, 212, 255, 0.6)" />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.floatingWelcomeIcon2,
          {
            opacity: sparkleOpacity,
            transform: [{ 
              translateY: pulseAnimation.interpolate({
                inputRange: [1, 1.1],
                outputRange: [0, 8],
              })
            }]
          }
        ]}
      >
        <MaterialIcons name="favorite" size={16} color="rgba(64, 224, 208, 0.5)" />
      </Animated.View>

      {/* AR Navigation grid and paths */}
      <Svg width="100%" height="100%" style={styles.svgBackground}>
        <Defs>
          <RadialGradient id="arGrad1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(0, 212, 255, 0.2)" />
            <Stop offset="100%" stopColor="rgba(0, 212, 255, 0.03)" />
          </RadialGradient>
          <RadialGradient id="arGrad2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(0, 255, 255, 0.15)" />
            <Stop offset="100%" stopColor="rgba(0, 255, 255, 0.02)" />
          </RadialGradient>
        </Defs>
        
        {/* Navigation paths */}
        <Path 
          d="M 30 40 Q 150 60 270 45 Q 350 30 400 70" 
          stroke="rgba(0, 212, 255, 0.3)" 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="5,8"
        />
        <Path 
          d="M 50 80 Q 180 100 320 85 Q 380 70 420 110" 
          stroke="rgba(0, 255, 255, 0.2)" 
          strokeWidth="1" 
          fill="none"
          strokeDasharray="3,6"
        />
      </Svg>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* AR Navigation themed background with welcoming touches */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC', '#9ED8FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundContainer}
      >
        <WelcomeGraphics />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnimation,
                  transform: [
                    { translateY: slideUpAnimation },
                    { scale: scaleAnimation }
                  ]
                }
              ]}
            >
              {/* Back Button */}
              {onBack && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBack}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.backButtonGradient}
                  >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {/* Welcome Section */}
              <View style={styles.welcomeContainer}>
                <Animated.View 
                  style={[
                    styles.welcomeIcon,
                    { transform: [{ scale: pulseAnimation }] }
                  ]}
                >
                  <LinearGradient
                    colors={['#00D4FF', '#6FB1FC']}
                    style={styles.welcomeIconGradient}
                  >
                    <Feather name="user-plus" size={36} color="white" />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.welcomeTitle}>Join Our Community!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Create your account and start your AR navigation journey
                </Text>
              </View>
            </Animated.View>

            {/* Main Content Card */}
            <Animated.View 
              style={[
                styles.mainCard,
                {
                  opacity: fadeAnimation,
                  transform: [
                    { translateY: slideUpAnimation },
                    { scale: scaleAnimation }
                  ]
                }
              ]}
            >
              <BlurView intensity={25} style={styles.glassCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                  style={styles.cardGradient}
                >
                  {/* Form Fields */}
                  <View style={styles.formContainer}>
                    {/* Full Name Input */}
                    <View style={[styles.inputContainer, fullNameFocused && styles.inputContainerFocused]}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="person" size={20} color={fullNameFocused ? "#00D4FF" : "#666"} />
                      </View>
                      <TextInput
                        style={[styles.input, fullNameFocused && styles.inputFocused]}
                        placeholder="Full Name"
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={fullName}
                        onChangeText={setFullName}
                        onFocus={() => setFullNameFocused(true)}
                        onBlur={() => setFullNameFocused(false)}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>

                    {/* Email Input */}
                    <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="email" size={20} color={emailFocused ? "#00D4FF" : "#666"} />
                      </View>
                      <TextInput
                        style={[styles.input, emailFocused && styles.inputFocused]}
                        placeholder="Email Address"
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    {/* Password Input */}
                    <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="lock" size={20} color={passwordFocused ? "#00D4FF" : "#666"} />
                      </View>
                      <TextInput
                        style={[styles.input, passwordFocused && styles.inputFocused]}
                        placeholder="Password"
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={[styles.inputContainer, confirmPasswordFocused && styles.inputContainerFocused]}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="lock-outline" size={20} color={confirmPasswordFocused ? "#00D4FF" : "#666"} />
                      </View>
                      <TextInput
                        style={[styles.input, confirmPasswordFocused && styles.inputFocused]}
                        placeholder="Confirm Password"
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Terms & Conditions */}
                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By signing up, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Text>
                    </View>

                    {/* Sign Up Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScaleAnimation }] }}>
                      <TouchableOpacity 
                        style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
                        onPress={handleSignUp}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={isLoading ? ['#ccc', '#999'] : ['#00D4FF', '#6FB1FC']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.buttonGradient}
                        >
                          {isLoading ? (
                            <View style={styles.loadingContainer}>
                              <Animated.View style={[styles.loadingDot]} />
                              <Animated.View style={[styles.loadingDot]} />
                              <Animated.View style={[styles.loadingDot]} />
                            </View>
                          ) : (
                            <View style={styles.buttonContent}>
                              <Text style={styles.signUpButtonText}>Create Account</Text>
                              <Feather name="arrow-right" size={20} color="#FFFFFF" />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>

                    {/* OR Divider */}
                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.orText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Social Sign Up */}
                    <View style={styles.socialContainer}>
                      <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialSignUp('Google')}
                      >
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name="logo-google" size={24} color="#00D4FF" />
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialSignUp('Apple')}
                      >
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name="logo-apple" size={24} color="#00D4FF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                      <Text style={styles.loginText}>Already have an account? </Text>
                      <TouchableOpacity onPress={onLoginPress}>
                        <Text style={styles.loginLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  graphicsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  arWaypoint1: {
    position: 'absolute',
    top: '15%',
    right: '20%',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  arWaypoint2: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  arWaypoint3: {
    position: 'absolute',
    bottom: '40%',
    right: '25%',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  waypointGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingWelcomeIcon1: {
    position: 'absolute',
    top: '45%',
    left: '25%',
  },
  floatingWelcomeIcon2: {
    position: 'absolute',
    bottom: '30%',
    right: '30%',
  },
  svgBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  welcomeIcon: {
    marginBottom: 20,
  },
  welcomeIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainCard: {
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  cardGradient: {
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFocused: {
    borderColor: '#00D4FF',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 212, 255, 0.4)',
    shadowRadius: 12,
    transform: [{ scale: 1.02 }],
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputFocused: {
    color: '#000',
  },
  passwordToggle: {
    padding: 5,
  },
  termsContainer: {
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(102, 102, 102, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#00D4FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: 'rgba(0, 212, 255, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(102, 102, 102, 0.7)',
    paddingHorizontal: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  socialButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 27.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: 'rgba(102, 102, 102, 0.8)',
  },
  loginLink: {
    fontSize: 16,
    color: '#00D4FF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});