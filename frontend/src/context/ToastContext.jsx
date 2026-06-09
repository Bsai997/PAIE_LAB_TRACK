import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((type, message, duration = 3200) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        window.setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const showSuccess = useCallback((message, duration) => {
        showToast('success', message, duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        showToast('error', message, duration);
    }, [showToast]);

    const value = useMemo(() => ({ showToast, showSuccess, showError }), [showToast, showSuccess, showError]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
                        <span>{toast.message}</span>
                        <button type="button" className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Close message">
                            x
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}