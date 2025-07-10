import { useState, useCallback } from 'react';
import './styles/globals.css';
import ConnectionForm from './components/ConnectionForm';
import StatusIndicator from './components/StatusIndicator';
import SceneSwitchBar from './components/SceneSwitchBar';
import MulticamContainer from './components/MulticamContainer';
import DebugPanel from './components/DebugPanel';
import Toaster, { type ToasterMessage } from './components/Toaster';
import { OBSService } from './services/obsService';

interface MulticamData {
    name: string;
    currentCamera: string | null;
    isLoading: boolean;
}

function App() {
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
            console.log(
                'updateCurrentSelections called, isApplyingCamera:',
                isApplyingCamera,
                'isConnected:',
                isConnected,
                'forceUpdate:',
                forceUpdate
            );
            if (isApplyingCamera || (!isConnected && !forceUpdate)) {
                console.log('Skipping updateCurrentSelections');
                return;
            }

            const names = multicamNames || multicams.map((m) => m.name);
            console.log('Names to update:', names);
            if (names.length === 0) {
                console.log('No names to update');
                return;
            }

            try {
                console.log('Getting current cameras for multicams...');
                const updatedMulticams = await Promise.all(
                    names.map(async (name) => {
                        console.log(`Getting current camera for ${name}...`);
                        const currentCamera = await obsService.getCurrentCamera(name);
                        console.log(`Current camera for ${name}:`, currentCamera);
                        return {
                            name,
                            currentCamera,
                            isLoading: false,
                        };
                    })
                );

                console.log('Updated multicam data:', updatedMulticams);

                setMulticams((prev) => {
                    console.log('Previous multicams:', prev);
                    const newMulticams = [...prev];
                    updatedMulticams.forEach((updated) => {
                        const index = newMulticams.findIndex((m) => m.name === updated.name);
                        if (index >= 0) {
                            console.log(`Updating ${updated.name} with camera:`, updated.currentCamera);
                            newMulticams[index] = updated;
                        }
                    });
                    console.log('New multicams:', newMulticams);
                    return newMulticams;
                });
            } catch (err) {
                console.error('Error updating current selections:', err);
            }
        },
        [isApplyingCamera, isConnected, multicams, obsService]
    );

    const refreshInterface = useCallback(
        async (forceRefresh = false) => {
            console.log('refreshInterface called, isConnected:', isConnected, 'forceRefresh:', forceRefresh);
            if (!isConnected && !forceRefresh) {
                console.log('Not connected, skipping refreshInterface');
                return;
            }

            console.log('Starting refreshInterface...');
            setIsLoadingInterface(true);
            try {
                console.log('Calling obsService.getMulticamScenes()...');
                const multicamScenes = await obsService.getMulticamScenes();
                console.log('Got multicam scenes:', multicamScenes);

                console.log('Calling obsService.getCameraScenes()...');
                const cameras = await obsService.getCameraScenes();
                console.log('Got camera scenes:', cameras);

                setCameraScenes(cameras);

                const multicamData = multicamScenes.map((name) => ({
                    name,
                    currentCamera: null,
                    isLoading: false,
                }));

                console.log('Setting multicam data:', multicamData);
                setMulticams(multicamData);

                // Update current selections
                console.log('Calling updateCurrentSelections...');
                await updateCurrentSelections(multicamScenes, forceRefresh);
                console.log('refreshInterface completed successfully');
            } catch (err) {
                const error = err as Error;
                console.error('Error in refreshInterface:', error);
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
            const [scenes, current] = await Promise.all([obsService.getFScenes(), obsService.getCurrentScene()]);

            setFScenes(scenes);
            setCurrentScene(current);
        } catch (err) {
            console.error('Error refreshing scene switch bar:', err);
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
        console.log('Starting connection to OBS...');
        setIsConnecting(true);
        updateStatus('connecting', 'Connexion...');

        try {
            console.log('Calling obsService.connect...');
            await obsService.connect(host, port, password);
            console.log('OBS connected successfully');

            // Set connected state FIRST
            setIsConnected(true);
            updateStatus('connected', 'Connecté');
            showToast('✅ Connecté à OBS', 'success');

            console.log('Setting up event listeners...');
            setupEventListeners();

            // Wait a tick for React state to update
            await new Promise((resolve) => setTimeout(resolve, 0));

            console.log('Calling refresh functions...');
            await Promise.all([
                refreshInterface(true), // Force refresh even if isConnected state isn't updated yet
                refreshSceneSwitchBar(),
            ]);
            console.log('Connection process completed');
        } catch (err) {
            const error = err as Error;
            console.error('Connection error:', error);
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

        // Get selected cameras from the DOM (similar to original implementation)
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

    return (
        <>
            <div className="header-bar">
                <h2>🎥 MULTICAM Controller</h2>
                <StatusIndicator status={status} statusText={statusText} onDisconnect={handleDisconnect} />
            </div>

            <ConnectionForm isVisible={!isConnected} isConnecting={isConnecting} onConnect={handleConnect} />

            {isConnected && (
                <div>
                    <p style={{ marginTop: 0, marginBottom: 10 }}>Gérez vos caméras dans chaque scène MULTICAM</p>

                    <SceneSwitchBar scenes={fScenes} currentScene={currentScene} onSceneSwitch={handleSceneSwitch} />

                    <MulticamContainer
                        multicams={multicams}
                        cameraScenes={cameraScenes}
                        isLoading={isLoadingInterface}
                        onApplyCamera={handleApplyCamera}
                        onApplyAll={handleApplyAll}
                    />

                    <DebugPanel obsService={obsService} isConnected={isConnected} />
                </div>
            )}

            <Toaster messages={toasterMessages} onRemove={removeToast} />
        </>
    );
}

export default App;
