import React, { useState } from "react";
import { Stack } from "expo-router";
import LoginPage from "../app/login-page";
import SignUpPage from "../app/signup-page";
import IntroScreen from "../app/intro";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'login' | 'signup'>('intro');

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
        onLogin={() => setIsAuthenticated(true)}
        onSignUpPress={() => setCurrentScreen('signup')}
        onBack={() => setCurrentScreen('intro')}
      />
    );
  }

  if (currentScreen === 'signup' && !isAuthenticated) {
    return (
      <SignUpPage 
        onSignUp={() => setIsAuthenticated(true)}
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