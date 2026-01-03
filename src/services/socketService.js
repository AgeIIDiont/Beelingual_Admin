import { io } from 'socket.io-client';
import { getUser } from './authService';

let socket = null;

/**
 * Connect to Session Socket.IO server
 * Works for both admin panel and mobile app
 */
export const connectAdminSocket = () => {
    if (socket && socket.connected) {
        console.log('[Socket.IO] Already connected');
        return socket;
    }

    const user = getUser();
    if (!user) {
        console.log('[Socket.IO] No user found, cannot connect');
        return null;
    }

    // Connect to /session namespace (works for all users)
    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    socket = io(`${SOCKET_URL}/session`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('[Socket.IO] Connected:', socket.id);

        // Authenticate with userId
        socket.emit('authenticate', user.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');

        // Re-authenticate after reconnection
        const currentUser = getUser();
        if (currentUser) {
            socket.emit('authenticate', currentUser.id);
        }
    });

    return socket;
};

/**
 * Disconnect from Socket.IO server
 */
export const disconnectAdminSocket = () => {
    if (socket) {
        console.log('[Socket.IO] Disconnecting...');
        socket.disconnect();
        socket = null;
    }
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Listen for force-logout event
 * @param {Function} callback - Callback function to execute when force-logout is received
 */
export const onForceLogout = (callback) => {
    if (!socket) {
        console.warn('[Socket.IO] Socket not connected, cannot listen for force-logout');
        return;
    }

    socket.on('force-logout', (data) => {
        console.log('[Socket.IO] Received force-logout event:', data);
        callback(data);
    });
};

/**
 * Remove force-logout listener
 */
export const offForceLogout = () => {
    if (socket) {
        socket.off('force-logout');
    }
};
