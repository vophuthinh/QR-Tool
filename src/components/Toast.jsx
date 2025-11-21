import React from 'react';

/**
 * Toast notification component for inline alerts
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type ('info'|'success'|'warning'|'error')
 * @param {Function} props.onClose - Close callback
 * @param {number} props.duration - Auto-close duration in ms (0 = no auto-close)
 */
export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
        success:
            'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        warning:
            'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
        error: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
    };

    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`fixed top-4 right-4 z-50 max-w-md rounded-xl border-2 px-4 py-3 shadow-lg animate-slide-in ${styles[type]}`}
        >
            <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">
                    {icons[type]}
                </span>
                <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    aria-label="Đóng thông báo"
                    className="flex-shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
