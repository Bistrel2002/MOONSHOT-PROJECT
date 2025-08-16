// API Configuration
const DEV_CONFIG = {
 
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.43:3001/api'  // Your computer's IP address for physical device
    : 'https://your-production-url.com/api', 
  
  TIMEOUT: 10000, // 10 seconds timeout for requests
};

export const API_CONFIG = DEV_CONFIG;

export const ENDPOINTS = {
 
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    REFRESH: '/users/refresh',
    LOGOUT: '/users/logout',
    PROFILE: '/users/profile',
  },
  
  // Location endpoints
  LOCATIONS: {
    LIST: '/locations',
    CREATE: '/locations',
    BY_ID: (id: string) => `/locations/${id}`,
    UPDATE: (id: string) => `/locations/${id}`,
    DELETE: (id: string) => `/locations/${id}`,
  },
  
  // Beacon endpoints
  BEACONS: {
    LIST: '/beacons',
    CREATE: '/beacons',
    BY_ID: (id: string) => `/beacons/${id}`,
    UPDATE: (id: string) => `/beacons/${id}`,
    DELETE: (id: string) => `/beacons/${id}`,
    NEARBY: '/beacons/nearby',
  },
  
  // Health check
  HEALTH: '/health',
  
  // Navigation endpoints
  NAVIGATION: {
    START: '/navigation/start',
    COMPLETE: (sessionId: string) => `/navigation/${sessionId}/complete`,
    CANCEL: (sessionId: string) => `/navigation/${sessionId}/cancel`,
    HISTORY: '/navigation/history',
    CURRENT: '/navigation/current',
  },
};
