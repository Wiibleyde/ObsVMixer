import { useState, useCallback } from 'react';
import type { ToasterMessage, ToastType } from '../types';

// Compteur plutôt que Date.now() : deux toasts dans la même milliseconde auraient la même clé
let nextToastId = 0;

export function useToaster() {
    const [messages, setMessages] = useState<ToasterMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = String(nextToastId++);
        setMessages((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    return {
        messages,
        showToast,
        removeToast,
    };
}
