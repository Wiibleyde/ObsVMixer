import { useState, useEffect, type CSSProperties } from 'react';
import { formatDuration } from '../utils/time';

const centeredColumn: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
};

const bigText: CSSProperties = {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
};

/** Lit `?date=yyyy-mm-dd&time=hh-mm-ss` ; renvoie la date cible ou un message d'erreur. */
function parseTargetDate(search: string): { target: Date } | { error: string } {
    const params = new URLSearchParams(search);
    const dateParam = params.get('date');
    const timeParam = params.get('time');

    if (!dateParam || !timeParam) {
        return { error: 'Paramètres manquants. Format attendu: ?date=yyyy-mm-dd&time=hh-mm-ss' };
    }

    const [year, month, day] = dateParam.split('-').map(Number);
    const [hours, minutes, seconds] = timeParam.split('-').map(Number);

    if ([year, month, day, hours, minutes, seconds].some((n) => !Number.isInteger(n))) {
        return { error: 'Format de date/heure invalide' };
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return { error: 'Valeurs de date/heure invalides' };
    }

    const target = new Date(year, month - 1, day, hours, minutes, seconds);
    // Date normalise les débordements (ex. 31/02 → 03/03) : on vérifie que rien n'a bougé
    if (target.getFullYear() !== year || target.getMonth() !== month - 1 || target.getDate() !== day) {
        return { error: 'Valeurs de date/heure invalides' };
    }

    return { target };
}

function Countdown() {
    const [parsed] = useState(() => parseTargetDate(window.location.search));
    const [now, setNow] = useState(Date.now);

    const targetTime = 'target' in parsed ? parsed.target.getTime() : null;
    const timeLeft = targetTime !== null ? Math.max(0, targetTime - now) : 0;
    const isExpired = targetTime !== null && timeLeft === 0;

    useEffect(() => {
        if (targetTime === null || isExpired) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [targetTime, isExpired]);

    if ('error' in parsed) {
        return (
            <div style={{ ...centeredColumn, gap: '2rem', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336', textAlign: 'center' }}>
                    ❌ Erreur
                </div>
                <div style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
                    {parsed.error}
                </div>
                <div
                    style={{
                        fontSize: '1rem',
                        color: '#888',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                    }}
                >
                    Exemple d'URL valide:
                    <br />
                    ?page=countdown&date=2025-12-31&time=23-59-59
                </div>
            </div>
        );
    }

    return (
        <div style={centeredColumn}>
            <div style={bigText}>
                {isExpired ? '🎉 On arrive !' : formatDuration(Math.floor(timeLeft / 1000), true)}
            </div>
        </div>
    );
}

export default Countdown;
