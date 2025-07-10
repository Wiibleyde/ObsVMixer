import { useState, useCallback } from 'react';
import { OBSService } from '../services/obsService';

interface UseSceneSwitcherProps {
    obsService: OBSService;
    isConnected: boolean;
}

export function useSceneSwitcher({ obsService, isConnected }: UseSceneSwitcherProps) {
    const [fScenes, setFScenes] = useState<string[]>([]);
    const [currentScene, setCurrentScene] = useState<string | null>(null);

    const refreshSceneSwitchBar = useCallback(async () => {
        if (!isConnected) return;

        try {
            const [scenes, current] = await Promise.all([obsService.getFScenes(), obsService.getCurrentScene()]);

            setFScenes(scenes);
            setCurrentScene(current);
        } catch (err) {
            console.error('Error refreshing scene switch bar:', err);
        }
    }, [isConnected, obsService]);

    const switchToScene = useCallback(
        async (sceneName: string) => {
            try {
                await obsService.switchToScene(sceneName);
                setCurrentScene(sceneName);
                return { success: true, message: `🎬 Scène "${sceneName}" sélectionnée` };
            } catch (err) {
                const error = err as Error;
                return { success: false, message: `❌ Erreur lors du switch de scène : ${error.message}` };
            }
        },
        [obsService]
    );

    const setupEventListeners = useCallback(
        (
            onConnectionLost: () => void,
            onRefreshInterface: () => void,
            onRefreshScenes: () => void,
            onUpdateSelections: () => void
        ) => {
            obsService.onConnectionClosed(() => {
                onConnectionLost();
            });

            obsService.onCurrentSceneChanged((sceneName) => {
                setCurrentScene(sceneName);
            });

            obsService.onSceneCreated(() => {
                obsService.clearScenesCache();
                onRefreshInterface();
                onRefreshScenes();
            });

            obsService.onSceneRemoved(() => {
                obsService.clearScenesCache();
                onRefreshInterface();
                onRefreshScenes();
            });

            obsService.onSceneNameChanged(() => {
                obsService.clearScenesCache();
                onRefreshInterface();
                onRefreshScenes();
            });

            obsService.onSceneItemCreated(() => {
                onUpdateSelections();
            });

            obsService.onSceneItemRemoved(() => {
                onUpdateSelections();
            });
        },
        [obsService]
    );

    return {
        fScenes,
        currentScene,
        refreshSceneSwitchBar,
        switchToScene,
        setupEventListeners,
        setCurrentScene,
    };
}
