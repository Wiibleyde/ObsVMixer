import { useState, useCallback } from 'react';

export interface ToasterMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useToaster() {
    const [messages, setMessages] = useState<ToasterMessage[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now().toString();
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
