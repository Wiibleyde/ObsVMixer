import { useState, useEffect } from 'react';

function Timer() {
    const [time, setTime] = useState(0); // en secondes
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: number;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
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
                {formatTime(time)}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={handleStart}
                    disabled={isRunning}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: isRunning ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                    }}
                >
                    Start
                </button>

                <button
                    onClick={handleStop}
                    disabled={!isRunning}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: !isRunning ? '#ccc' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isRunning ? 'not-allowed' : 'pointer',
                    }}
                >
                    Stop
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

export default Timer;
