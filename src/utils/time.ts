const pad2 = (n: number) => n.toString().padStart(2, '0');

/** Formate une durée en secondes en `HH:MM:SS` (préfixé de `Xj` si plus d'un jour et `withDays`). */
export function formatDuration(totalSeconds: number, withDays = false): string {
    const days = withDays ? Math.floor(totalSeconds / 86400) : 0;
    const rest = totalSeconds - days * 86400;
    const hours = Math.floor(rest / 3600);
    const minutes = Math.floor((rest % 3600) / 60);
    const seconds = rest % 60;
    const hms = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    return days > 0 ? `${days}j ${hms}` : hms;
}
