import { useState, useEffect } from 'react';

const readOptions = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        showDate: params.get('date') === 'true',
        showSeconds: params.get('seconds') === 'true',
    };
};

function Clock() {
    const [time, setTime] = useState(() => new Date());
    const [{ showDate, showSeconds }] = useState(readOptions);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '4rem',
                fontWeight: 'bold',
            }}
        >
            {time.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: showSeconds ? '2-digit' : undefined,
                hour12: false,
            })}
            {showDate && (
                <div style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                    {time.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            )}
        </div>
    );
}

export default Clock;
