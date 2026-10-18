import { useState, useEffect, useCallback } from 'react';
import type { OBSService } from '../services/obsService';
import type { OverlaySource, ToastType } from '../types';
import { getErrorMessage } from '../utils/error';

interface OverlayProps {
    obsService: OBSService;
    onToast: (message: string, type: ToastType) => void;
    updateTrigger: number;
}

export default function Overlay({ obsService, onToast, updateTrigger }: OverlayProps) {
    const [sources, setSources] = useState<OverlaySource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const loadSources = useCallback(async () => {
        setIsLoading(true);
        try {
            setSources(await obsService.getOverlaySources());
        } catch (err) {
            onToast(`❌ Erreur lors du chargement des sources OVERLAY : ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [obsService, onToast]);

    // Recharge au montage et à chaque changement de visibilité signalé par OBS
    useEffect(() => {
        loadSources();
    }, [loadSources, updateTrigger]);

    const toggleSourceVisibility = async (source: OverlaySource) => {
        const visible = !source.visible;
        setUpdatingId(source.id);
        try {
            await obsService.setSourceVisibility(source, visible);
            setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, visible } : s)));
            onToast(`✅ Source "${source.name}" ${visible ? 'affichée' : 'masquée'}`, 'success');
        } catch (err) {
            onToast(`❌ ${getErrorMessage(err)}`, 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    // Spinner uniquement au premier chargement, pour éviter le clignotement à chaque rechargement
    const content =
        isLoading && sources.length === 0 ? (
            <div className="empty-state">
                <span className="spinner"></span>
                <span>Chargement...</span>
            </div>
        ) : sources.length === 0 ? (
            <div className="empty-state">Aucune source OVERLAY</div>
        ) : (
            <ul className="overlay-sources">
                {sources.map((source) => (
                    <li key={source.id} className="overlay-source-item">
                        <span className="source-name" title={source.name}>
                            {source.name}
                        </span>
                        <button
                            type="button"
                            className="switch"
                            onClick={() => toggleSourceVisibility(source)}
                            disabled={updatingId === source.id}
                            aria-pressed={source.visible}
                            aria-label={`Afficher ${source.name}`}
                        >
                            <span className="switch-knob"></span>
                        </button>
                    </li>
                ))}
            </ul>
        );

    return (
        <section className="panel-section overlay-panel" aria-labelledby="overlayTitle">
            <div className="section-head">
                <h2 id="overlayTitle" className="section-title">
                    Overlay
                </h2>
            </div>
            <div className="overlay-container">{content}</div>
        </section>
    );
}
