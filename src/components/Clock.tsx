import { useState, useEffect } from 'react';

function Clock() {
    const [time, setTime] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showSeconds, setShowSeconds] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date'); // format: true or false
        const secondsParam = urlParams.get('seconds'); // format: true or false
        setShowDate(dateParam === 'true');
        setShowSeconds(secondsParam === 'true');
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '4rem',
            fontWeight: 'bold',
        }}>
            {time.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: showSeconds ? '2-digit' : undefined,
                hour12: false
            })}
            {showDate && (
                <div style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                    {time.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            )}
        </div>
    );
}

export default Clock;
