/**
 * Frontend Error Logger
 * Logs errors to console and can be extended to send to backend
 */

class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep last 100 errors
        // Store original console methods to avoid infinite loops
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
    }

    /**
     * Log an error
     * @param {string} component - Component name where error occurred
     * @param {string} action - Action being performed
     * @param {Error|string} error - Error object or message
     * @param {Object} context - Additional context data
     */
    logError(component, action, error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            component,
            action,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Add to in-memory logs
        this.logs.push(errorLog);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest log
        }

        // Log to console with color using original console.error to avoid infinite loop
        this.originalConsoleError.call(console,
            `%c[${component}] ${action}`,
            'color: #ff4444; font-weight: bold;',
            '\nError:', error,
            '\nContext:', context,
            '\nTimestamp:', errorLog.timestamp
        );

        // Store in localStorage for persistence
        try {
            const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            storedLogs.push(errorLog);
            // Keep only last 50 in localStorage to avoid quota issues
            const recentLogs = storedLogs.slice(-50);
            localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
        } catch (e) {
            this.originalConsoleWarn.call(console, 'Failed to store error log in localStorage:', e);
        }

        return errorLog;
    }

    /**
     * Log a warning (non-critical error)
     */
    logWarning(component, action, message, context = {}) {
        this.originalConsoleWarn.call(console,
            `%c[${component}] ${action}`,
            'color: #ff9800; font-weight: bold;',
            '\nWarning:', message,
            '\nContext:', context
        );
    }

    /**
     * Log info message
     */
    logInfo(component, action, message, context = {}) {
        console.info(
            `%c[${component}] ${action}`,
            'color: #2196f3; font-weight: bold;',
            '\nInfo:', message,
            '\nContext:', context
        );
    }

    /**
     * Get all error logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Get logs from localStorage
     */
    getStoredLogs() {
        try {
            return JSON.parse(localStorage.getItem('errorLogs') || '[]');
        } catch (e) {
            console.error('Failed to retrieve stored logs:', e);
            return [];
        }
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('errorLogs');
    }

    /**
     * Download logs as JSON file
     */
    downloadLogs() {
        const allLogs = {
            memoryLogs: this.logs,
            storedLogs: this.getStoredLogs()
        };

        const dataStr = JSON.stringify(allLogs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `frontend-errors-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Send logs to backend (implement this based on your backend API)
     */
    async sendLogsToBackend() {
        try {
            const logs = this.getStoredLogs();
            if (logs.length === 0) {
                console.log('No logs to send');
                return;
            }

            // TODO: Replace with your actual backend endpoint
            // const response = await fetch('/api/logs/frontend', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     },
            //     body: JSON.stringify({ logs })
            // });

            console.log('Would send', logs.length, 'logs to backend (not implemented yet)');
            return logs;
        } catch (error) {
            console.error('Failed to send logs to backend:', error);
        }
    }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Add global error handler
window.addEventListener('error', (event) => {
    errorLogger.logError(
        'Global',
        'Uncaught Error',
        event.error || event.message,
        {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }
    );
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(
        'Global',
        'Unhandled Promise Rejection',
        event.reason,
        {
            promise: event.promise
        }
    );
});

// Intercept console.error to capture React errors and warnings
const originalConsoleError = console.error;
console.error = function(...args) {
    // Log to errorLogger
    errorLogger.logError(
        'Console',
        'console.error',
        args.join(' '),
        {
            arguments: args,
            type: 'console.error'
        }
    );
    // Call original console.error
    originalConsoleError.apply(console, args);
};

// Intercept console.warn to capture React warnings
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
    // Log to errorLogger as warning
    const warningLog = {
        timestamp: new Date().toISOString(),
        component: 'Console',
        action: 'console.warn',
        message: args.join(' '),
        context: {
            arguments: args,
            type: 'console.warn'
        },
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    // Add to in-memory logs
    errorLogger.logs.push(warningLog);
    if (errorLogger.logs.length > errorLogger.maxLogs) {
        errorLogger.logs.shift();
    }

    // Store in localStorage
    try {
        const storedLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        storedLogs.push(warningLog);
        const recentLogs = storedLogs.slice(-50);
        localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (e) {
        originalConsoleWarn.call(console, 'Failed to store warning log:', e);
    }

    // Call original console.warn
    originalConsoleWarn.apply(console, args);
};

export default errorLogger;
