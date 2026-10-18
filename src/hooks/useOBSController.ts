import { useState, useCallback, useEffect, useRef } from 'react';
import { OBSService, MULTICAM_PREFIX, OVERLAY_SCENE } from '../services/obsService';
import type { ConnectionStatus, MulticamData } from '../types';
import { getErrorMessage } from '../utils/error';
import { useToaster } from './useToaster';

// Délai avant resynchronisation après une modification : laisse passer la rafale
// d'événements SceneItemCreated/Removed générés par nos propres appels
const APPLY_SETTLE_DELAY = 500;

interface CameraChange {
    multicam: string;
    camera: string;
}

export function useOBSController() {
    const [obsService] = useState(() => new OBSService());
    const { messages: toasterMessages, showToast, removeToast } = useToaster();

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<ConnectionStatus>('');
    const [statusText, setStatusText] = useState('Déconnecté');

    const [multicams, setMulticams] = useState<MulticamData[]>([]);
    const [cameraScenes, setCameraScenes] = useState<string[]>([]);
    const [fScenes, setFScenes] = useState<string[]>([]);
    const [currentScene, setCurrentScene] = useState<string | null>(null);
    const [isLoadingInterface, setIsLoadingInterface] = useState(false);
    const [overlayUpdateTrigger, setOverlayUpdateTrigger] = useState(0);

    // Refs lues par les handlers d'événements OBS, pour ne pas les réabonner à chaque rendu
    const multicamNamesRef = useRef<string[]>([]);
    const pendingAppliesRef = useRef(0);
    const isManualDisconnectRef = useRef(false);

    const updateStatus = useCallback((newStatus: ConnectionStatus, text: string) => {
        setStatus(newStatus);
        setStatusText(text);
    }, []);

    const updateCurrentSelections = useCallback(async () => {
        const names = multicamNamesRef.current;
        if (pendingAppliesRef.current > 0 || names.length === 0) return;

        const cameras = new Map(
            await Promise.all(names.map(async (name) => [name, await obsService.getCurrentCamera(name)] as const))
        );
        setMulticams((prev) =>
            prev.map((m) => (cameras.has(m.name) ? { ...m, currentCamera: cameras.get(m.name) ?? null } : m))
        );
    }, [obsService]);

    const refreshInterface = useCallback(async () => {
        setIsLoadingInterface(true);
        try {
            const [multicamScenes, cameras] = await Promise.all([
                obsService.getMulticamScenes(),
                obsService.getCameraScenes(),
            ]);
            const currentCameras = await Promise.all(multicamScenes.map((name) => obsService.getCurrentCamera(name)));

            multicamNamesRef.current = multicamScenes;
            setCameraScenes(cameras);
            setMulticams(
                multicamScenes.map((name, i) => ({ name, currentCamera: currentCameras[i], isLoading: false }))
            );
        } catch (err) {
            showToast(`❌ Erreur lors du chargement : ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsLoadingInterface(false);
        }
    }, [obsService, showToast]);

    const refreshSceneSwitchBar = useCallback(async () => {
        try {
            const [scenes, current] = await Promise.all([obsService.getFScenes(), obsService.getCurrentScene()]);
            setFScenes(scenes);
            setCurrentScene(current);
        } catch (err) {
            console.error('Error refreshing scene switch bar:', err);
        }
    }, [obsService]);

    // Chargement initial + abonnement aux événements OBS tant que la connexion est active
    useEffect(() => {
        if (!isConnected) return;

        refreshInterface();
        refreshSceneSwitchBar();

        const onScenesChanged = () => {
            obsService.clearScenesCache();
            refreshInterface();
            refreshSceneSwitchBar();
        };

        const onSceneItemsChanged = ({ sceneName }: { sceneName: string }) => {
            if (sceneName === OVERLAY_SCENE) {
                setOverlayUpdateTrigger((n) => n + 1);
            } else if (sceneName.startsWith(MULTICAM_PREFIX)) {
                updateCurrentSelections();
            }
        };

        const unsubscribers = [
            obsService.on('ConnectionClosed', () => {
                setIsConnected(false);
                if (isManualDisconnectRef.current) return;
                updateStatus('error', 'Connexion perdue');
                showToast('⚠️ Connexion à OBS perdue', 'error');
            }),
            obsService.on('CurrentProgramSceneChanged', ({ sceneName }) => setCurrentScene(sceneName)),
            obsService.on('SceneCreated', onScenesChanged),
            obsService.on('SceneRemoved', onScenesChanged),
            obsService.on('SceneNameChanged', onScenesChanged),
            obsService.on('SceneItemCreated', onSceneItemsChanged),
            obsService.on('SceneItemRemoved', onSceneItemsChanged),
            obsService.on('SceneItemEnableStateChanged', onSceneItemsChanged),
        ];

        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    }, [
        isConnected,
        obsService,
        refreshInterface,
        refreshSceneSwitchBar,
        updateCurrentSelections,
        updateStatus,
        showToast,
    ]);

    const handleConnect = useCallback(
        async (host: string, port: string, password: string) => {
            setIsConnecting(true);
            updateStatus('connecting', 'Connexion...');
            try {
                await obsService.connect(host, port, password);
                setIsConnected(true);
                updateStatus('connected', 'Connecté');
                showToast('✅ Connecté à OBS', 'success');
            } catch (err) {
                updateStatus('error', 'Erreur de connexion');
                showToast(`❌ Erreur de connexion OBS : ${getErrorMessage(err)}`, 'error');
            } finally {
                setIsConnecting(false);
            }
        },
        [obsService, updateStatus, showToast]
    );

    const handleDisconnect = useCallback(async () => {
        // Évite que le listener ConnectionClosed ne signale une "connexion perdue"
        isManualDisconnectRef.current = true;
        try {
            await obsService.disconnect();
        } finally {
            isManualDisconnectRef.current = false;
        }
        setIsConnected(false);
        updateStatus('', 'Déconnecté');
        showToast("🔌 Déconnecté d'OBS", 'info');
    }, [obsService, updateStatus, showToast]);

    const setMulticamsLoading = useCallback((names: string[], isLoading: boolean) => {
        setMulticams((prev) => prev.map((m) => (names.includes(m.name) ? { ...m, isLoading } : m)));
    }, []);

    /** Applique les changements en parallèle ; renvoie le nombre de succès et la première erreur. */
    const applyChanges = useCallback(
        async (changes: CameraChange[]) => {
            const names = changes.map((c) => c.multicam);
            pendingAppliesRef.current++;
            setMulticamsLoading(names, true);

            const results = await Promise.allSettled(
                changes.map((c) => obsService.replaceSceneItem(c.multicam, c.camera))
            );

            setMulticamsLoading(names, false);
            setTimeout(() => {
                pendingAppliesRef.current--;
                updateCurrentSelections();
            }, APPLY_SETTLE_DELAY);

            const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
            return {
                succeeded: results.length - failures.length,
                error: failures.length > 0 ? getErrorMessage(failures[0].reason) : null,
            };
        },
        [obsService, setMulticamsLoading, updateCurrentSelections]
    );

    const handleApplyCamera = useCallback(
        async (multicam: string, camera: string) => {
            const { error } = await applyChanges([{ multicam, camera }]);
            if (error) {
                showToast(`❌ Erreur : ${error}`, 'error');
            } else {
                showToast(`✅ ${multicam} mis à jour avec ${camera}`, 'success');
            }
        },
        [applyChanges, showToast]
    );

    const handleSceneSwitch = useCallback(
        async (sceneName: string) => {
            try {
                await obsService.switchToScene(sceneName);
                setCurrentScene(sceneName);
                showToast(`🎬 Scène "${sceneName}" sélectionnée`, 'info');
            } catch (err) {
                showToast(`❌ Erreur lors du switch de scène : ${getErrorMessage(err)}`, 'error');
            }
        },
        [obsService, showToast]
    );

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
        toasterMessages,
        showToast,
        removeToast,
        overlayUpdateTrigger,
        handleConnect,
        handleDisconnect,
        handleApplyCamera,
        handleSceneSwitch,
    };
}
