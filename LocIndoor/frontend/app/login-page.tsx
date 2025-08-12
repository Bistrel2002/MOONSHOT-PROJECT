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
import Svg, { Line, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface LoginPageProps {
  onLogin: () => void;
  onSignUpPress: () => void;
  onBack?: () => void;
}

export default function LoginPage({ onLogin, onSignUpPress, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;
  const scaleAnimation = useRef(new Animated.Value(0.9)).current;
  const buttonScaleAnimation = useRef(new Animated.Value(1)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  
  const validateEmail = (email: string): boolean =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if(!validateEmail(email)){
      Alert.alert('Error', 'Please enter a valid email address \n\nExample: example@example.com');
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
      onLogin();
    }, 2000);
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert('Social Login', `${platform} login coming soon!`);
  };

  useEffect(() => {
    // Initial entrance animations
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
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

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

    return () => {
      floatingLoop.stop();
    };
  }, []);

  const floatingTranslateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* AR Navigation themed background */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundContainer}
      >
        {/* AR Navigation Elements */}
        <Animated.View 
          style={[
            styles.arElement1,
            {
              transform: [{ translateY: floatingTranslateY }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              })
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.arElement2,
            {
              transform: [{ 
                translateY: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                })
              }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.8],
              })
            }
          ]}
        />
        
        {/* Floating AR Icons */}
        <Animated.View 
          style={[
            styles.floatingIcon1,
            {
              transform: [{ translateY: floatingTranslateY }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })
            }
          ]}
        >
          <Feather name="navigation" size={20} color="rgba(0, 212, 255, 0.6)" />
        </Animated.View>
        <Animated.View 
          style={[
            styles.floatingIcon2,
            {
              transform: [{ 
                translateY: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, -8],
                })
              }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.9],
              })
            }
          ]}
        >
          <MaterialIcons name="explore" size={18} color="rgba(0, 255, 255, 0.5)" />
        </Animated.View>
        
        {/* AR Grid Lines */}
        <Svg width="100%" height="100%" style={styles.arGridOverlay}>
          <Line
            x1="20%"
            y1="25%"
            x2="80%"
            y2="30%"
            stroke="rgba(0, 212, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Line
            x1="15%"
            y1="60%"
            x2="85%"
            y2="65%"
            stroke="rgba(0, 255, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <Path
            d="M 30 40 Q 150 60 270 45 Q 350 30 400 70"
            stroke="rgba(111, 177, 252, 0.2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4,4"
          />
        </Svg>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnimation,
                  transform: [
                    { translateY: slideAnimation },
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
                  <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              )}
              
              {/* Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Feather name="log-in" size={32} color="white" />
                </View>
                <Text style={styles.logoText}>Welcome Back</Text>
                <Text style={styles.logoSubtext}>Sign in to continue</Text>
              </View>
            </Animated.View>

            {/* Main Content Card */}
            <Animated.View 
              style={[
                styles.mainCard,
                {
                  opacity: fadeAnimation,
                  transform: [
                    { translateY: slideAnimation },
                    { scale: scaleAnimation }
                  ]
                }
              ]}
            >
              <BlurView intensity={20} style={styles.glassCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.cardGradient}
                >
                  {/* Form Fields */}
                  <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="email" size={20} color={emailFocused ? "#00D4FF" : "#999"} />
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
                        <MaterialIcons name="lock" size={20} color={passwordFocused ? "#00D4FF" : "#999"} />
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

                    {/* Forgot Password */}
                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScaleAnimation }] }}>
                      <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
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
                            <Text style={styles.loginButtonText}>Sign In</Text>
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

                    {/* Social Login */}
                    <View style={styles.socialContainer}>
                      <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Google')}
                      >
                        <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Apple')}
                      >
                        <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                      <Text style={styles.signUpText}>Don't have an account? </Text>
                      <TouchableOpacity onPress={onSignUpPress}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
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
  arElement1: {
    position: 'absolute',
    top: '20%',
    right: '15%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    shadowColor: 'rgba(0, 212, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  arElement2: {
    position: 'absolute',
    bottom: '25%',
    left: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.15)',
    shadowColor: 'rgba(0, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingIcon1: {
    position: 'absolute',
    top: '35%',
    left: '20%',
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: '40%',
    right: '25%',
  },
  arGridOverlay: {
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  mainCard: {
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  cardGradient: {
    padding: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#333333',
    fontWeight: '500',
  },
  inputFocused: {
    color: '#000000',
  },
  passwordToggle: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signUpLink: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});