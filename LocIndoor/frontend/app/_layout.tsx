import React, { useState } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import LoginPage from "../app/login-page";
import SignUpPage from "../app/signup-page";
import IntroScreen from "../app/intro";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

// Create a separate component that uses the auth context
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'login' | 'signup'>('intro');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0052D4" />
      </View>
    );
  }

  if (currentScreen === 'intro') {
    return (
      <IntroScreen 
        onLoginPress={() => setCurrentScreen('login')}
        onSignUpPress={() => setCurrentScreen('signup')}
      />
    );
  }

  if (currentScreen === 'login' && !isAuthenticated) {
    return (
      <LoginPage 
        onLogin={() => {/* Authentication handled by context */}}
        onSignUpPress={() => setCurrentScreen('signup')}
        onBack={() => setCurrentScreen('intro')}
      />
    );
  }

  if (currentScreen === 'signup' && !isAuthenticated) {
    return (
      <SignUpPage 
        onSignUp={() => {/* Authentication handled by context */}}
        onLoginPress={() => setCurrentScreen('login')}
        onBack={() => setCurrentScreen('intro')}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="ar-navigation" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="history" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// Main component that provides the auth context
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}