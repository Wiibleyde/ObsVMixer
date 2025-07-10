import React from 'react';
import type { DebugPanelStyles } from '../../hooks/useDebugPanelStyles';

interface SceneListDisplayProps {
    styles: DebugPanelStyles;
    scenes: string[];
}

/**
 * Composant pour afficher la liste des scènes OBS
 */
export const SceneListDisplay: React.FC<SceneListDisplayProps> = ({ styles, scenes }) => {
    if (scenes.length === 0) return null;

    return (
        <div style={{ marginBottom: '15px' }}>
            <p style={styles.sectionTitle}>Scènes trouvées ({scenes.length}) :</p>
            <div style={styles.scrollableList}>
                {scenes.map((scene, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.listItem,
                            borderBottom: index < scenes.length - 1 ? '1px solid #444' : 'none',
                        }}
                        title={`Scène: ${scene}`}
                    >
                        {scene}
                    </div>
                ))}
            </div>
        </div>
    );
};
