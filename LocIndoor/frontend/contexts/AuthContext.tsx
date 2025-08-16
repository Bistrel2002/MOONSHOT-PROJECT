// Authentication Context - Manages user login state across the entire app
// This is like having a "memory" that remembers if the user is logged in

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService, { TokenManager } from '../services/apiService';

// Define what user data looks like
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// Define what the authentication context provides
interface AuthContextType {
  // State
  user: User | null;                    // Current logged-in user data
  isLoading: boolean;                   // Whether we're checking authentication
  isAuthenticated: boolean;             // Whether user is logged in

  // Functions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your entire app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property: user is authenticated if we have user data
  const isAuthenticated = !!user;

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user has valid token and get their data
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have tokens stored
      const hasToken = await TokenManager.getAccessToken();
      if (!hasToken) {
        setIsLoading(false);
        return;
      }

      // Try to get user profile to verify token is valid
      const response = await ApiService.getUserProfile();
      if (response.success) {
        setUser(response.data.user);
      } else {
        // Invalid token, clear it
        await TokenManager.clearTokens();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await TokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Refresh user data (useful after profile updates)
  const refreshUserData = async () => {
    try {
      const response = await ApiService.getUserProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Context value that will be provided to all child components
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
