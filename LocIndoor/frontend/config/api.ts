// API Configuration
const DEV_CONFIG = {
 
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001/api'  
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
};
