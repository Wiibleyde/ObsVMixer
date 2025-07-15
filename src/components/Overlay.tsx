import { useState, useEffect, useCallback } from 'react';
import { OBSService } from '../services/obsService';

interface Source {
    name: string;
    visible: boolean;
}

interface OverlayProps {
    obsService: OBSService;
    isConnected: boolean;
    onToast: (message: string, type: 'success' | 'error' | 'info') => void;
    updateTrigger?: number;
}

const Overlay: React.FC<OverlayProps> = ({ obsService, isConnected, onToast, updateTrigger }) => {
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const loadSources = useCallback(async () => {
        if (!isConnected) return;

        setIsLoading(true);
        try {
            const overlaySources = await obsService.getOverlaySources();
            setSources(overlaySources);
        } catch (error) {
            const err = error as Error;
            onToast(`❌ Erreur lors du chargement des sources OVERLAY : ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, obsService, onToast]);

    const toggleSourceVisibility = async (sourceName: string, currentVisible: boolean) => {
        if (!isConnected) return;

        setIsUpdating(sourceName);
        try {
            await obsService.setSourceVisibility(sourceName, !currentVisible);

            // Mettre à jour l'état local
            setSources((prev) =>
                prev.map((source) => (source.name === sourceName ? { ...source, visible: !currentVisible } : source))
            );

            const action = !currentVisible ? 'affichée' : 'masquée';
            onToast(`✅ Source "${sourceName}" ${action}`, 'success');
        } catch (error) {
            const err = error as Error;
            onToast(`❌ ${err.message}`, 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    useEffect(() => {
        loadSources();
    }, [loadSources]);

    // Recharger les sources quand updateTrigger change
    useEffect(() => {
        if (updateTrigger !== undefined) {
            loadSources();
        }
    }, [updateTrigger, loadSources]);

    if (!isConnected) {
        return null;
    }

    if (isLoading) {
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
                    <div key={source.name} className="overlay-source-item">
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
                                onClick={() => toggleSourceVisibility(source.name, source.visible)}
                                disabled={isUpdating === source.name}
                                title={source.visible ? 'Masquer' : 'Afficher'}
                            >
                                {isUpdating === source.name ? (
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
};

export default Overlay;
