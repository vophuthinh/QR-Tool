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
