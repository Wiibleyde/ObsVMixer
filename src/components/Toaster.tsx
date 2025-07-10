import { useEffect, useState } from 'react';

export interface ToasterMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToasterProps {
    messages: ToasterMessage[];
    onRemove: (id: string) => void;
}

export default function Toaster({ messages, onRemove }: ToasterProps) {
    const [visibleMessages, setVisibleMessages] = useState<ToasterMessage[]>([]);

    useEffect(() => {
        messages.forEach((message) => {
            if (!visibleMessages.find((m) => m.id === message.id)) {
                setVisibleMessages((prev) => [...prev, message]);

                // Show toaster
                setTimeout(() => {
                    const toasterElement = document.getElementById(`toaster-${message.id}`);
                    if (toasterElement) {
                        toasterElement.classList.add('show');
                    }
                }, 100);

                // Hide and remove toaster
                setTimeout(() => {
                    const toasterElement = document.getElementById(`toaster-${message.id}`);
                    if (toasterElement) {
                        toasterElement.classList.remove('show');
                    }
                    setTimeout(() => {
                        onRemove(message.id);
                        setVisibleMessages((prev) => prev.filter((m) => m.id !== message.id));
                    }, 300);
                }, 3000);
            }
        });
    }, [messages, visibleMessages, onRemove]);

    return (
        <>
            {visibleMessages.map((message) => (
                <div
                    key={message.id}
                    id={`toaster-${message.id}`}
                    className={`toaster ${message.type}`}
                    role="status"
                    aria-live={message.type === 'error' ? 'assertive' : 'polite'}
                >
                    {message.message}
                </div>
            ))}
        </>
    );
}
