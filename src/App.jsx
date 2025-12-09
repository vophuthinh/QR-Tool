import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const QRGenerator = lazy(() => import('./pages/QRGenerator'));

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-800 dark:border-t-indigo-400"></div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đang tải...</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/qr-generator" replace />} />
                    <Route path="/qr-generator" element={<QRGenerator />} />
                    <Route path="*" element={<Navigate to="/qr-generator" replace />} />
                </Routes>
            </Suspense>
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
        </BrowserRouter>
    );
}

