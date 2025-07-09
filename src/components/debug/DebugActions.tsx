import React from 'react';
import type { DebugPanelStyles } from '../../hooks/useDebugPanelStyles';

interface DebugActionsProps {
    styles: DebugPanelStyles;
    isLoading: boolean;
    errorMessage?: string | null;
    lastUpdated?: Date | null;
    onLoadAllScenes: () => void;
    onTestMulticamCameras: () => void;
    onRefreshAll?: () => void;
    onClearDebugInfo?: () => void;
}

/**
 * Composant pour les actions de debug (boutons)
 */
export const DebugActions: React.FC<DebugActionsProps> = ({
    styles,
    isLoading,
    errorMessage,
    lastUpdated,
    onLoadAllScenes,
    onTestMulticamCameras,
    onRefreshAll,
    onClearDebugInfo
}) => {
    const buttonStyle = (disabled: boolean) => ({
        ...styles.button,
        ...(disabled ? styles.buttonDisabled : {}),
        ':hover': disabled ? {} : { backgroundColor: '#666' }
    });

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };

    return (
        <div>
            <div style={styles.buttonContainer}>
                <button
                    onClick={onLoadAllScenes}
                    disabled={isLoading}
                    style={buttonStyle(isLoading)}
                    title="Charger toutes les scènes disponibles dans OBS"
                >
                    {isLoading ? 'Chargement...' : 'Charger scènes'}
                </button>

                <button
                    onClick={onTestMulticamCameras}
                    disabled={isLoading}
                    style={buttonStyle(isLoading)}
                    title="Tester la détection des caméras dans les scènes multicam"
                >
                    {isLoading ? 'Test...' : 'Tester multicam'}
                </button>

                {onRefreshAll && (
                    <button
                        onClick={onRefreshAll}
                        disabled={isLoading}
                        style={{
                            ...buttonStyle(isLoading),
                            backgroundColor: isLoading ? '#333' : '#2196F3'
                        }}
                        title="Actualiser toutes les données"
                    >
                        {isLoading ? 'Actualisation...' : '🔄 Actualiser tout'}
                    </button>
                )}

                {onClearDebugInfo && (
                    <button
                        onClick={onClearDebugInfo}
                        disabled={isLoading}
                        style={{
                            ...buttonStyle(isLoading),
                            backgroundColor: isLoading ? '#333' : '#f44336'
                        }}
                        title="Effacer les informations de debug"
                    >
                        🗑️ Effacer
                    </button>
                )}
            </div>

            {/* Affichage des erreurs */}
            {errorMessage && (
                <div style={{
                    background: '#f44336',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    marginBottom: '10px',
                    border: '1px solid #d32f2f'
                }}>
                    ⚠️ {errorMessage}
                </div>
            )}

            {/* Affichage de la dernière mise à jour */}
            {lastUpdated && !errorMessage && (
                <div style={{
                    color: '#aaa',
                    fontSize: '10px',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                }}>
                    Dernière mise à jour : {formatTime(lastUpdated)}
                </div>
            )}
        </div>
    );
};
