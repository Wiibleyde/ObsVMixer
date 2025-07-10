import type { OBSService } from '../services/obsService';
import { useOBSDebug } from '../hooks/useOBSDebug';
import { useDebugPanelStyles } from '../hooks/useDebugPanelStyles';
import { DebugActions } from './debug/DebugActions';
import { SceneListDisplay } from './debug/SceneListDisplay';
import { MulticamInfoDisplay } from './debug/MulticamInfoDisplay';

interface DebugPanelProps {
    obsService: OBSService | null;
    isConnected: boolean;
}

/**
 * Panel de debug pour inspecter l'état d'OBS
 * Permet de visualiser les scènes et tester les caméras multicam
 */
export default function DebugPanel({ obsService, isConnected }: DebugPanelProps) {
    const styles = useDebugPanelStyles();
    const { debugInfo, loadAllScenes, testMulticamCameras, clearDebugInfo, refreshAll } = useOBSDebug(
        obsService,
        isConnected
    );

    // Ne pas afficher le panel si pas connecté
    if (!isConnected) {
        return null;
    }

    return (
        <div style={styles.container}>
            <h4 style={styles.header}>🔍 Debug - OBS</h4>

            <DebugActions
                styles={styles}
                isLoading={debugInfo.isLoading}
                errorMessage={debugInfo.errorMessage}
                lastUpdated={debugInfo.lastUpdated}
                onLoadAllScenes={loadAllScenes}
                onTestMulticamCameras={testMulticamCameras}
                onRefreshAll={refreshAll}
                onClearDebugInfo={clearDebugInfo}
            />

            <SceneListDisplay styles={styles} scenes={debugInfo.allScenes} />

            <MulticamInfoDisplay styles={styles} multicamInfo={debugInfo.multicamInfo} />
        </div>
    );
}
