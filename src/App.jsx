import React from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import QRGenerator from './pages/QRGenerator';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
    const [page, setPage] = React.useState('home'); // 'home' | 'qr'

    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const user = accounts?.[0] || null;

    const handleLogin = async () => {
        try {
            await instance.loginPopup({
                scopes: ['User.Read'], // đủ để lấy tên/email
            });
        } catch (err) {
            console.error(err);
            toast.error('Đăng nhập Microsoft thất bại hoặc bị hủy.');
            throw err; // để handleStart biết login fail
        }
    };

    const handleStart = async () => {
        // Bấm "Bắt đầu tạo QR"
        if (!isAuthenticated) {
            try {
                await handleLogin();
            } catch {
                return; // login fail thì không vào QR
            }
        }
        setPage('qr');
    };

    const handleBackHome = () => {
        setPage('home');
    };

    const handleLogout = () => {
        instance
            .logoutPopup({
                postLogoutRedirectUri: window.location.origin,
            })
            .catch((err) => {
                console.error(err);
                toast.error('Đăng xuất thất bại.');
            });
    };

    return (
        <ErrorBoundary>
            {page === 'home' ? (
                <Home
                    onStart={handleStart}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                    isAuthenticated={isAuthenticated}
                    user={user}
                />
            ) : (
                <QRGenerator onBack={handleBackHome} />
            )}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 5000,
                    className: 'react-hot-toast',
                    style: {
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                        className: 'toast-success',
                    },
                    error: {
                        duration: 6000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        className: 'toast-error',
                    },
                }}
            />
        </ErrorBoundary>
    );
}
