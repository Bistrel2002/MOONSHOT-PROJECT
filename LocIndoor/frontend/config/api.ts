// API Configuration
const DEV_CONFIG = {
  // For development, use localhost when running on simulator/emulator
  // For physical device, you'll need to use your computer's IP address
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001/api'  // Use localhost for simulator/emulator
    : 'https://your-production-url.com/api', 
  
  TIMEOUT: 30000, // 30 seconds timeout for requests (increased for slower connections)
};

// Alternative configuration for physical device testing
const PHYSICAL_DEVICE_CONFIG = {
  BASE_URL: 'http://192.168.1.43:3001/api',  // Your computer's IP address for physical device
  TIMEOUT: 30000,
};

// Export the appropriate config based on environment
// For now, use the physical device config since localhost isn't working
export const API_CONFIG = PHYSICAL_DEVICE_CONFIG;

// You can switch back to localhost for simulator testing:
// export const API_CONFIG = DEV_CONFIG;

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
