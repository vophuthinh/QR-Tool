import React from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import QRGenerator from './pages/QRGenerator';
import ErrorBoundary from './components/ErrorBoundary';
import { 
    validateUserDomain, 
    getUserDisplayName, 
    getAuthErrorMessage,
    isUserCancelledError 
} from './utils/auth-helpers';

const ErrorIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const SuccessIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export default function App() {
    const [page, setPage] = React.useState('home');

    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const user = accounts?.[0] || null;

    React.useEffect(() => {
        if (page === 'qr' && !isAuthenticated) {
            setPage('home');
            toast.error('Vui lòng đăng nhập để truy cập.');
        }
    }, [page, isAuthenticated]);

    const handleLogin = async () => {
        try {
            const cachedAccounts = instance.getAllAccounts();
            if (cachedAccounts.length > 0) {
                try {
                    await instance.acquireTokenSilent({
                        scopes: ['User.Read'],
                        account: cachedAccounts[0],
                    });
                    return;
                } catch (silentError) {
                    // Silent login failed, continue with popup
                }
            }

            await instance.loginPopup({
                scopes: ['User.Read'],
            });
        } catch (err) {
            const errorMessage = getAuthErrorMessage(err);
            if (errorMessage) {
                toast.error(errorMessage);
            }
            if (!isUserCancelledError(err)) {
                console.error('Login error:', err);
                throw err;
            }
        }
    };

    const handleStart = async () => {
        if (!isAuthenticated) {
            try {
                await handleLogin();
            } catch {
                return;
            }
        }
        if (isAuthenticated || instance.getAllAccounts().length > 0) {
            setPage('qr');
        }
    };

    const handleBackHome = () => {
        setPage('home');
    };

    const handleLogout = async () => {
        try {
            await instance.logoutPopup({
                postLogoutRedirectUri: window.location.origin,
            });
            setPage('home');
            toast.success('Đã đăng xuất thành công.');
        } catch (err) {
            console.error('Logout error:', err);
            const errorMessage = getAuthErrorMessage(err);
            if (errorMessage) {
                toast.error(errorMessage);
            }
        }
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
            ) : isAuthenticated ? (
                <QRGenerator onBack={handleBackHome} />
            ) : (
                <Home
                    onStart={handleStart}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                    isAuthenticated={isAuthenticated}
                    user={user}
                />
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
                        icon: <SuccessIcon />,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                        className: 'toast-success',
                    },
                    error: {
                        duration: 6000,
                        icon: <ErrorIcon />,
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
