import { useState, useEffect } from 'react';

function Countdown() {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Extraire les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date'); // format: yyyy-mm-dd
        const timeParam = urlParams.get('time'); // format: hh-mm-ss

        if (!dateParam || !timeParam) {
            setError('Paramètres manquants. Format attendu: ?date=yyyy-mm-dd&time=hh-mm-ss');
            return;
        }

        try {
            // Parser la date et l'heure
            const [year, month, day] = dateParam.split('-').map(Number);
            const [hours, minutes, seconds] = timeParam.split('-').map(Number);

            // Validation des valeurs
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                throw new Error('Format de date/heure invalide');
            }

            if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
                throw new Error('Valeurs de date/heure invalides');
            }

            // Créer la date cible
            const target = new Date(year, month - 1, day, hours, minutes, seconds);

            if (isNaN(target.getTime())) {
                throw new Error('Date invalide');
            }

            setTargetDate(target);
            setError(null);

            // Calculer le temps restant initial
            const now = new Date().getTime();
            const difference = target.getTime() - now;
            setTimeLeft(Math.max(0, difference));
            setIsExpired(difference <= 0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de parsing de la date');
        }
    }, []);

    useEffect(() => {
        if (!targetDate || isExpired) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate.getTime() - now;

            if (difference <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                clearInterval(interval);
            } else {
                setTimeLeft(difference);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, isExpired]);

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return `${days}j ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: '2rem',
                padding: '2rem'
            }}>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f44336',
                    textAlign: 'center'
                }}>
                    ❌ Erreur
                </div>
                <div style={{
                    fontSize: '1.2rem',
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '600px'
                }}>
                    {error}
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: '#888',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px'
                }}>
                    Exemple d'URL valide:<br />
                    /countdown?date=2025-12-31&time=23-59-59
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        }}>
            {isExpired ? (
                <>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        🎉 On arrive !
                    </div>
                </>
            ) : (
                <>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                </>
            )}
        </div>
    );
}

export default Countdown;
