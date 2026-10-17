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
    if (isLoading && sources.length === 0) {
        return (
            <div className="overlay-container">
                <div style={{ textAlign: 'center', padding: '6px' }}>
                    <span className="spinner"></span>
                    <span style={{ marginLeft: '6px', fontSize: '10px' }}>Chargement...</span>
                </div>
            </div>
        );
    }

    if (sources.length === 0) {
        return (
            <div className="overlay-container">
                <div style={{ textAlign: 'center', color: '#aaa', padding: '6px', fontSize: '10px' }}>
                    <span>📺</span> Aucune source OVERLAY
                </div>
            </div>
        );
    }

    return (
        <div className="overlay-container">
            <h3>🎭 OVERLAY</h3>
            <div className="overlay-sources">
                {sources.map((source) => (
                    <div key={source.id} className="overlay-source-item">
                        <span className="source-name">{source.name}</span>
                        <div className="source-controls">
                            <span
                                className={`visibility-indicator ${source.visible ? 'visible' : 'hidden'}`}
                                aria-live="polite"
                            >
                                {source.visible ? 'ON' : 'OFF'}
                            </span>
                            <button
                                className="toggle-btn"
                                onClick={() => toggleSourceVisibility(source)}
                                disabled={updatingId === source.id}
                                title={source.visible ? 'Masquer' : 'Afficher'}
                            >
                                {updatingId === source.id ? (
                                    <span className="spinner"></span>
                                ) : source.visible ? (
                                    '❌'
                                ) : (
                                    '✅'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="refresh-btn" onClick={loadSources} disabled={isLoading} title="Actualiser">
                🔄 Actualiser
            </button>
        </div>
    );
}
