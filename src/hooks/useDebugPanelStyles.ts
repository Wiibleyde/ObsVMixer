import { useMemo } from 'react';

export interface DebugPanelStyles {
    container: React.CSSProperties;
    header: React.CSSProperties;
    buttonContainer: React.CSSProperties;
    button: React.CSSProperties;
    buttonDisabled: React.CSSProperties;
    sectionTitle: React.CSSProperties;
    scrollableList: React.CSSProperties;
    listItem: React.CSSProperties;
    infoContainer: React.CSSProperties;
    cameraActive: React.CSSProperties;
    cameraInactive: React.CSSProperties;
}

/**
 * Hook pour la gestion des styles du panel de debug
 * Centralise tous les styles pour faciliter la maintenance
 */
export const useDebugPanelStyles = (): DebugPanelStyles => {
    return useMemo(
        () => ({
            container: {
                background: '#333',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '4px',
                border: '1px solid #555',
            },
            header: {
                margin: '0 0 10px 0',
                color: '#43e36b',
                fontSize: '14px',
                fontWeight: 'bold',
            },
            buttonContainer: {
                marginBottom: '10px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap' as const,
            },
            button: {
                background: '#555',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.2s ease',
            },
            buttonDisabled: {
                background: '#333',
                color: '#999',
                cursor: 'not-allowed',
            },
            sectionTitle: {
                fontSize: '11px',
                color: '#aaa',
                margin: '0 0 5px 0',
            },
            scrollableList: {
                maxHeight: '150px',
                overflow: 'auto',
                background: '#222',
                padding: '5px',
                borderRadius: '2px',
                fontSize: '10px',
                fontFamily: 'monospace',
                border: '1px solid #444',
            },
            listItem: {
                padding: '2px 0',
                borderBottom: '1px solid #444',
                wordBreak: 'break-all' as const,
            },
            infoContainer: {
                background: '#222',
                padding: '5px',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'monospace',
                border: '1px solid #444',
            },
            cameraActive: {
                padding: '2px 0',
                color: '#43e36b',
            },
            cameraInactive: {
                padding: '2px 0',
                color: '#f44336',
            },
        }),
        []
    );
};
