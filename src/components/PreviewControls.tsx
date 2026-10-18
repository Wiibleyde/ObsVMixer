import { PREVIEW_INTERVALS } from '../hooks/usePreviews';

interface PreviewControlsProps {
    enabled: boolean;
    intervalMs: number;
    onToggle: (enabled: boolean) => void;
    onIntervalChange: (ms: number) => void;
}

export default function PreviewControls({ enabled, intervalMs, onToggle, onIntervalChange }: PreviewControlsProps) {
    return (
        <div className="preview-controls">
            <button
                type="button"
                className="ghost-btn"
                aria-pressed={enabled}
                onClick={() => onToggle(!enabled)}
                title={enabled ? 'Couper les aperçus pour soulager OBS' : 'Activer les aperçus'}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                    {!enabled && <path d="M3 3l18 18" />}
                </svg>
                Aperçus {enabled ? 'actifs' : 'coupés'}
            </button>
            <label className="visually-hidden" htmlFor="previewInterval">
                Fréquence de rafraîchissement des aperçus
            </label>
            <select
                id="previewInterval"
                className="select"
                value={intervalMs}
                disabled={!enabled}
                onChange={(e) => onIntervalChange(Number(e.target.value))}
            >
                {PREVIEW_INTERVALS.map((ms) => (
                    <option key={ms} value={ms}>
                        {(ms / 1000).toLocaleString('fr-FR')} s
                    </option>
                ))}
            </select>
        </div>
    );
}
