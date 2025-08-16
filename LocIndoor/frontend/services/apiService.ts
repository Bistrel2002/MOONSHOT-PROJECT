import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, ENDPOINTS } from '../config/api';

// Storage keys for tokens
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions
export const TokenManager = {
  // Save tokens securely
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Clear all tokens (for logout)
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

// Request interceptor - automatically adds authorization header
apiClient.interceptors.request.use(
  async (config) => {
    const token = await TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 (unauthorized) and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenManager.getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken }
          );

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            await TokenManager.saveTokens(accessToken, newRefreshToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await TokenManager.clearTokens();
        // You can emit an event here to redirect to login screen
      }
    }

    return Promise.reject(error);
  }
);

// API Service class with all your backend endpoints
export class ApiService {
  // ===== AUTHENTICATION METHODS =====
  
  // Login user - sends email and password to backend
  static async login(email: string, password: string) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      
      if (response.data.success && response.data.data.accessToken) {
        // Save tokens if login successful
        await TokenManager.saveTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  // Register new user
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.data.success && response.data.data.accessToken) {
        // Save tokens if registration successful
        await TokenManager.saveTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  }

  // Logout user
  static async logout() {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
      await TokenManager.clearTokens();
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      await TokenManager.clearTokens();
      return { success: true };
    }
  }

  // Get user profile
  static async getUserProfile() {
    try {
      const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw this.handleError(error);
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw this.handleError(error);
    }
  }

  // Update user profile
  static async updateUserProfile(profileData: {
    name?: string;
    avatar?: string;
  }) {
    try {
      const response = await apiClient.put(ENDPOINTS.AUTH.PROFILE, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleError(error);
    }
  }

  // ===== LOCATION METHODS =====
  
  // Get all locations
  static async getLocations() {
    try {
      const response = await apiClient.get(ENDPOINTS.LOCATIONS.LIST);
      return response.data;
    } catch (error) {
      console.error('Get locations error:', error);
      throw this.handleError(error);
    }
  }

  // Create new location
  static async createLocation(locationData: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    floor?: number;
    buildingId?: string;
  }) {
    try {
      const response = await apiClient.post(ENDPOINTS.LOCATIONS.CREATE, locationData);
      return response.data;
    } catch (error) {
      console.error('Create location error:', error);
      throw this.handleError(error);
    }
  }

  // ===== BEACON METHODS =====
  
  // Get nearby beacons
  static async getNearbyBeacons(latitude: number, longitude: number, radius: number = 100) {
    try {
      const response = await apiClient.get(ENDPOINTS.BEACONS.NEARBY, {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Get nearby beacons error:', error);
      throw this.handleError(error);
    }
  }

  // Get all beacons
  static async getBeacons() {
    try {
      const response = await apiClient.get(ENDPOINTS.BEACONS.LIST);
      return response.data;
    } catch (error) {
      console.error('Get beacons error:', error);
      throw this.handleError(error);
    }
  }

  // ===== NAVIGATION METHODS =====
  
  // Start a new navigation session
  static async startNavigation(destinationName: string, startLocationName?: string) {
    try {
      const response = await apiClient.post(ENDPOINTS.NAVIGATION.START, {
        destinationName,
        startLocationName,
      });
      return response.data;
    } catch (error) {
      console.error('Start navigation error:', error);
      throw this.handleError(error);
    }
  }

  // Complete a navigation session
  static async completeNavigation(sessionId: string) {
    try {
      const response = await apiClient.put(ENDPOINTS.NAVIGATION.COMPLETE(sessionId));
      return response.data;
    } catch (error) {
      console.error('Complete navigation error:', error);
      throw this.handleError(error);
    }
  }

  // Cancel a navigation session
  static async cancelNavigation(sessionId: string) {
    try {
      const response = await apiClient.put(ENDPOINTS.NAVIGATION.CANCEL(sessionId));
      return response.data;
    } catch (error) {
      console.error('Cancel navigation error:', error);
      throw this.handleError(error);
    }
  }

  // Get navigation history
  static async getNavigationHistory(limit: number = 20, offset: number = 0) {
    try {
      const response = await apiClient.get(ENDPOINTS.NAVIGATION.HISTORY, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Get navigation history error:', error);
      throw this.handleError(error);
    }
  }

  // Get current active navigation session
  static async getCurrentNavigation() {
    try {
      const response = await apiClient.get(ENDPOINTS.NAVIGATION.CURRENT);
      return response.data;
    } catch (error) {
      console.error('Get current navigation error:', error);
      throw this.handleError(error);
    }
  }

  // ===== UTILITY METHODS =====
  
  // Check if backend is healthy
  static async healthCheck() {
    try {
      const response = await apiClient.get(ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw this.handleError(error);
    }
  }

  // Check if user is authenticated (has valid token)
  static async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getAccessToken();
    if (!token) return false;

    try {
      // Try to get user profile to verify token is valid
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Handle API errors consistently
  private static handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default ApiService;
