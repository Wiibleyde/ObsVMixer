import { useState, useEffect, type CSSProperties } from 'react';
import { formatDuration } from '../utils/time';

const buttonStyle = (color: string, disabled = false): CSSProperties => ({
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: disabled ? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
});

function Timer() {
    // Basé sur des timestamps plutôt qu'un compteur +1/s : pas de dérive, même si l'onglet est throttlé
    const [elapsedMs, setElapsedMs] = useState(0);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [now, setNow] = useState(Date.now);
    const isRunning = startedAt !== null;

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(interval);
    }, [isRunning]);

    const totalMs = elapsedMs + (startedAt !== null ? now - startedAt : 0);

    const handleStart = () => {
        const t = Date.now();
        setNow(t);
        setStartedAt(t);
    };
    const handleStop = () => {
        if (startedAt === null) return;
        setElapsedMs((prev) => prev + Date.now() - startedAt);
        setStartedAt(null);
    };
    const handleReset = () => {
        setElapsedMs(0);
        setStartedAt(null);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: '2rem',
            }}
        >
            <div
                style={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '1rem',
                }}
            >
                {formatDuration(Math.floor(totalMs / 1000))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleStart} disabled={isRunning} style={buttonStyle('#4CAF50', isRunning)}>
                    Start
                </button>
                <button onClick={handleStop} disabled={!isRunning} style={buttonStyle('#f44336', !isRunning)}>
                    Stop
                </button>
                <button onClick={handleReset} style={buttonStyle('#2196F3')}>
                    Reset
                </button>
            </div>
        </div>
    );
}

export default Timer;
