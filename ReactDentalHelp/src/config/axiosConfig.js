import axios from 'axios';
import errorLogger from '../utils/errorLogger.js';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token automatically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        errorLogger.logError(
            'Axios',
            'Request Failed',
            error,
            {
                config: error.config
            }
        );
        return Promise.reject(error);
    }
);

// Response interceptor - log all errors
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging (optional)
        if (import.meta.env.DEV) {
            console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        // Extract error details
        const errorDetails = {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
        };

        // Log to errorLogger
        errorLogger.logError(
            'API',
            `${errorDetails.method || 'REQUEST'} ${errorDetails.url || 'Unknown URL'}`,
            error,
            {
                ...errorDetails,
                timestamp: new Date().toISOString(),
            }
        );

        // Log to console with details
        console.error(
            `❌ API Error: ${errorDetails.method} ${errorDetails.url}`,
            '\nStatus:', errorDetails.status,
            '\nMessage:', errorDetails.message,
            '\nResponse:', errorDetails.data
        );

        return Promise.reject(error);
    }
);

export default axiosInstance;
