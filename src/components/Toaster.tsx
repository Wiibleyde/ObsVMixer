import { useEffect, useState } from 'react';
import type { ToasterMessage } from '../types';

const SHOW_DELAY = 100;
const DISPLAY_DURATION = 3000;
const HIDE_ANIMATION = 300;

interface ToasterProps {
    messages: ToasterMessage[];
    onRemove: (id: string) => void;
}

interface ToastProps {
    message: ToasterMessage;
    onRemove: (id: string) => void;
}

function Toast({ message, onRemove }: ToastProps) {
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        const timers = [
            setTimeout(() => setIsShown(true), SHOW_DELAY),
            setTimeout(() => setIsShown(false), DISPLAY_DURATION),
            setTimeout(() => onRemove(message.id), DISPLAY_DURATION + HIDE_ANIMATION),
        ];
        return () => timers.forEach(clearTimeout);
    }, [message.id, onRemove]);

    return (
        <div
            className={`toaster ${message.type}${isShown ? ' show' : ''}`}
            role="status"
            aria-live={message.type === 'error' ? 'assertive' : 'polite'}
        >
            {message.message}
        </div>
    );
}

export default function Toaster({ messages, onRemove }: ToasterProps) {
    return (
        <div className="toaster-stack">
            {messages.map((message) => (
                <Toast key={message.id} message={message} onRemove={onRemove} />
            ))}
        </div>
    );
}
