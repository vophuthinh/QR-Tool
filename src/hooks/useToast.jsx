import React from 'react';
import Toast from '../components/Toast';

/**
 * Toast container hook for managing multiple toasts
 * @returns {Object} { toasts, showToast, ToastContainer }
 */
export function useToast() {
    const [toasts, setToasts] = React.useState([]);

    const showToast = React.useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = React.useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const ToastContainer = React.useCallback(
        () => (
            <div className="fixed top-4 right-4 z-50 flex flex-col-reverse gap-2 max-h-[calc(100vh-2rem)] overflow-y-auto">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        ),
        [toasts, removeToast],
    );

    return { toasts, showToast, ToastContainer };
}
