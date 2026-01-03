import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { clearAuth, getUser } from '../services/authService';
import { connectAdminSocket, disconnectAdminSocket, onForceLogout, offForceLogout } from '../services/socketService';

const SessionMonitor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = getUser();

        // Only connect if user is logged in
        if (!user) {
            console.log('[SessionMonitor] No user logged in, skipping socket connection');
            return;
        }

        console.log('[SessionMonitor] Connecting to Socket.IO...');

        // Connect to Socket.IO
        const socket = connectAdminSocket();

        if (!socket) {
            console.error('[SessionMonitor] Failed to connect to Socket.IO');
            return;
        }

        // Listen for force-logout event
        onForceLogout((data) => {
            console.log('[SessionMonitor] Force logout received:', data);

            // Show alert
            Swal.fire({
                title: 'Cảnh báo đăng nhập',
                text: data.message || 'Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Vui lòng đăng nhập lại.',
                icon: 'warning',
                confirmButtonText: 'Đăng nhập lại',
                confirmButtonColor: '#fbbf24',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                clearAuth();
                disconnectAdminSocket();
                navigate('/login');
            });
        });

        // Cleanup on unmount
        return () => {
            console.log('[SessionMonitor] Cleaning up...');
            offForceLogout();
            disconnectAdminSocket();
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};

export default SessionMonitor;
