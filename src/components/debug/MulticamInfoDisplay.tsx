import React from 'react';
import type { DebugPanelStyles } from '../../hooks/useDebugPanelStyles';

interface MulticamInfoDisplayProps {
    styles: DebugPanelStyles;
    multicamInfo: { [key: string]: string | null };
}

/**
 * Composant pour afficher les informations des caméras multicam
 */
export const MulticamInfoDisplay: React.FC<MulticamInfoDisplayProps> = ({ styles, multicamInfo }) => {
    const entries = Object.entries(multicamInfo);

    if (entries.length === 0) return null;

    return (
        <div>
            <p style={styles.sectionTitle}>Caméras actuelles dans les scènes CAMSELECT :</p>
            <div style={styles.infoContainer}>
                {entries.map(([scene, camera]) => (
                    <div
                        key={scene}
                        style={camera ? styles.cameraActive : styles.cameraInactive}
                        title={`Scène: ${scene} - Caméra: ${camera || 'Aucune'}`}
                    >
                        <strong>{scene}:</strong> {camera || 'Aucune caméra'}
                    </div>
                ))}
            </div>
        </div>
    );
};
