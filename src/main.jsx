import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './auth/msalConfig.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                if (import.meta.env.DEV) {
                    console.log('Service Worker registered:', registration.scope);
                }
            })
            .catch((error) => {
                if (import.meta.env.DEV) {
                    console.log('Service Worker registration failed:', error);
                }
            });
    });
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </ErrorBoundary>
    </StrictMode>,
);
