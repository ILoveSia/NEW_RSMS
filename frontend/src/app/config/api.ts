import { env } from './env';

// API Configuration
export const apiConfig = {
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  
  // Request headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Auth headers
  getAuthHeaders: (token: string) => ({
    'Authorization': `Bearer ${token}`,
  }),
  
  // Retry configuration
  retry: {
    retries: 3,
    retryDelay: 1000, // 1 second
    retryCondition: (error: any) => {
      return (
        error.code === 'NETWORK_ERROR' ||
        (error.response?.status >= 500 && error.response?.status <= 599)
      );
    },
  },
  
  // Request interceptor config
  interceptors: {
    request: {
      // Add auth token automatically
      addAuthToken: true,
      // Log requests in development
      logRequests: env.isDevelopment,
    },
    response: {
      // Log responses in development
      logResponses: env.isDevelopment,
      // Auto refresh token on 401
      autoRefreshToken: true,
    },
  },
} as const;

// API Endpoints
export const apiEndpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile',
  },
  
  // Users
  users: {
    list: '/users',
    detail: (id: number) => `/users/${id}`,
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    search: '/users/search',
  },
  
  // Entities
  entities: {
    list: '/entities',
    detail: (id: number) => `/entities/${id}`,
    create: '/entities',
    update: (id: number) => `/entities/${id}`,
    delete: (id: number) => `/entities/${id}`,
    search: '/entities/search',
    actions: (id: number) => `/entities/${id}/actions`,
  },
  
  // Reports
  reports: {
    list: '/reports',
    detail: (id: number) => `/reports/${id}`,
    create: '/reports',
    generate: (id: number) => `/reports/${id}/generate`,
    download: (id: number) => `/reports/${id}/download`,
    history: '/reports/history',
  },
  
  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
    charts: '/dashboard/charts',
    notifications: '/dashboard/notifications',
  },
  
  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
    system: '/settings/system',
  },
  
  // Files
  files: {
    upload: '/files/upload',
    download: (id: string) => `/files/${id}/download`,
    delete: (id: string) => `/files/${id}`,
  },
  
  // Search
  search: {
    global: '/search/global',
    suggestions: '/search/suggestions',
  },
} as const;

// Request timeout configurations
export const timeoutConfig = {
  default: 30000,        // 30 seconds
  upload: 300000,        // 5 minutes for file uploads
  download: 600000,      // 10 minutes for large downloads
  report: 120000,        // 2 minutes for report generation
} as const;