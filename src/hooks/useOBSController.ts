import { useState, useCallback, useEffect } from 'react';
import { OBSService } from '../services/obsService';
import { type ToasterMessage } from '../components/Toaster';

export interface MulticamData {
    name: string;
    currentCamera: string | null;
    isLoading: boolean;
}

export function useOBSController() {
    const [obsService] = useState(new OBSService());
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'connected' | 'connecting' | 'error' | ''>('');
    const [statusText, setStatusText] = useState('Déconnecté');

    const [multicams, setMulticams] = useState<MulticamData[]>([]);
    const [cameraScenes, setCameraScenes] = useState<string[]>([]);
    const [fScenes, setFScenes] = useState<string[]>([]);
    const [currentScene, setCurrentScene] = useState<string | null>(null);
    const [isLoadingInterface, setIsLoadingInterface] = useState(false);
    const [isApplyingCamera, setIsApplyingCamera] = useState(false);

    const [toasterMessages, setToasterMessages] = useState<ToasterMessage[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now().toString();
        setToasterMessages((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasterMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    const updateStatus = useCallback((newStatus: typeof status, text: string) => {
        setStatus(newStatus);
        setStatusText(text);
    }, []);

    const updateCurrentSelections = useCallback(
        async (multicamNames?: string[], forceUpdate = false) => {
            if (isApplyingCamera || (!isConnected && !forceUpdate)) return;
            const names = multicamNames || multicams.map((m) => m.name);
            if (names.length === 0) return;
            try {
                const updatedMulticams = await Promise.all(
                    names.map(async (name) => {
                        const currentCamera = await obsService.getCurrentCamera(name);
                        return {
                            name,
                            currentCamera,
                            isLoading: false,
                        };
                    })
                );
                setMulticams((prev) => {
                    const newMulticams = [...prev];
                    updatedMulticams.forEach((updated) => {
                        const index = newMulticams.findIndex((m) => m.name === updated.name);
                        if (index >= 0) {
                            newMulticams[index] = updated;
                        }
                    });
                    return newMulticams;
                });
            } catch {
                // Optionally handle error
            }
        },
        [isApplyingCamera, isConnected, multicams, obsService]
    );

    const refreshInterface = useCallback(
        async (forceRefresh = false) => {
            if (!isConnected && !forceRefresh) return;
            setIsLoadingInterface(true);
            try {
                const multicamScenes = await obsService.getMulticamScenes();
                const cameras = await obsService.getCameraScenes();
                setCameraScenes(cameras);
                const multicamData = multicamScenes.map((name) => ({
                    name,
                    currentCamera: null,
                    isLoading: false,
                }));
                setMulticams(multicamData);
                await updateCurrentSelections(multicamScenes, forceRefresh);
            } catch (err) {
                const error = err as Error;
                showToast('❌ Erreur lors du chargement : ' + error.message, 'error');
            } finally {
                setIsLoadingInterface(false);
            }
        },
        [isConnected, obsService, showToast, updateCurrentSelections]
    );

    const refreshSceneSwitchBar = useCallback(async () => {
        if (!isConnected) return;
        try {
            const [scenes, current] = await Promise.all([
                obsService.getFScenes(),
                obsService.getCurrentScene(),
            ]);
            setFScenes(scenes);
            setCurrentScene(current);
        } catch {
            // Optionally handle error
        }
    }, [isConnected, obsService]);

    const setupEventListeners = useCallback(() => {
        obsService.onConnectionClosed(() => {
            setIsConnected(false);
            updateStatus('error', 'Connexion perdue');
            showToast('⚠️ Connexion à OBS perdue', 'error');
        });
        obsService.onCurrentSceneChanged((sceneName) => {
            setCurrentScene(sceneName);
        });
        obsService.onSceneCreated(() => {
            obsService.clearScenesCache();
            refreshInterface();
            refreshSceneSwitchBar();
        });
        obsService.onSceneRemoved(() => {
            obsService.clearScenesCache();
            refreshInterface();
            refreshSceneSwitchBar();
        });
        obsService.onSceneNameChanged(() => {
            obsService.clearScenesCache();
            refreshInterface();
            refreshSceneSwitchBar();
        });
        obsService.onSceneItemCreated(() => {
            updateCurrentSelections();
        });
        obsService.onSceneItemRemoved(() => {
            updateCurrentSelections();
        });
    }, [obsService, updateStatus, showToast, refreshInterface, refreshSceneSwitchBar, updateCurrentSelections]);

    const handleConnect = async (host: string, port: string, password: string) => {
        setIsConnecting(true);
        updateStatus('connecting', 'Connexion...');
        try {
            await obsService.connect(host, port, password);
            setIsConnected(true);
            updateStatus('connected', 'Connecté');
            showToast('✅ Connecté à OBS', 'success');
            setupEventListeners();
            await new Promise((resolve) => setTimeout(resolve, 0));
            await Promise.all([
                refreshInterface(true),
                refreshSceneSwitchBar(),
            ]);
        } catch (err) {
            const error = err as Error;
            updateStatus('error', 'Erreur de connexion');
            showToast('❌ Erreur de connexion OBS : ' + error.message, 'error');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (isConnected) {
            await obsService.disconnect();
            setIsConnected(false);
            updateStatus('', 'Déconnecté');
            showToast("🔌 Déconnecté d'OBS", 'info');
        }
    };

    const setMulticamLoading = (multicamName: string, loading: boolean) => {
        setMulticams((prev) => prev.map((m) => (m.name === multicamName ? { ...m, isLoading: loading } : m)));
    };

    const handleApplyCamera = async (multicamName: string, selectedCamera: string) => {
        setIsApplyingCamera(true);
        setMulticamLoading(multicamName, true);
        try {
            await obsService.replaceSceneItem(multicamName, selectedCamera);
            showToast(`✅ ${multicamName} mis à jour avec ${selectedCamera}`, 'success');
        } catch (err) {
            const error = err as Error;
            showToast('❌ Erreur : ' + error.message, 'error');
        } finally {
            setMulticamLoading(multicamName, false);
            setTimeout(() => {
                setIsApplyingCamera(false);
                updateCurrentSelections();
            }, 500);
        }
    };

    const handleApplyAll = async () => {
        setIsApplyingCamera(true);
        const multicamsToModify = multicams.filter((multicam) => {
            const selectElement = document.getElementById(
                `select_${multicam.name}`.replace(/\s+/g, '_')
            ) as HTMLSelectElement;
            return selectElement && selectElement.value;
        });
        try {
            let appliedCount = 0;
            for (const multicam of multicamsToModify) {
                const selectElement = document.getElementById(
                    `select_${multicam.name}`.replace(/\s+/g, '_')
                ) as HTMLSelectElement;
                const selectedCamera = selectElement.value;
                setMulticamLoading(multicam.name, true);
                await obsService.replaceSceneItem(multicam.name, selectedCamera);
                setMulticamLoading(multicam.name, false);
                appliedCount++;
            }
            if (appliedCount > 0) {
                showToast(`🎉 ${appliedCount} MULTICAM mis à jour !`, 'success');
            } else {
                showToast('ℹ️ Aucune caméra sélectionnée', 'info');
            }
        } catch (err) {
            const error = err as Error;
            showToast('❌ Erreur : ' + error.message, 'error');
        } finally {
            setTimeout(() => {
                setIsApplyingCamera(false);
                updateCurrentSelections();
            }, 500);
        }
    };

    const handleSceneSwitch = async (sceneName: string) => {
        try {
            await obsService.switchToScene(sceneName);
            showToast(`🎬 Scène "${sceneName}" sélectionnée`, 'info');
            setCurrentScene(sceneName);
        } catch (err) {
            const error = err as Error;
            showToast('❌ Erreur lors du switch de scène : ' + error.message, 'error');
        }
    };

    useEffect(() => {
        if (isConnected) {
            refreshSceneSwitchBar();
        }
    }, [isConnected, refreshSceneSwitchBar]);

    return {
        obsService,
        isConnected,
        isConnecting,
        status,
        statusText,
        multicams,
        cameraScenes,
        fScenes,
        currentScene,
        isLoadingInterface,
        isApplyingCamera,
        toasterMessages,
        showToast,
        removeToast,
        handleConnect,
        handleDisconnect,
        handleApplyCamera,
        handleApplyAll,
        handleSceneSwitch,
    };
}
