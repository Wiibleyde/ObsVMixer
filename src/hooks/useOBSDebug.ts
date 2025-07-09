import { useState, useCallback, useEffect } from 'react';
import { OBSService } from '../services/obsService';

export interface DebugInfo {
    allScenes: string[];
    multicamInfo: { [key: string]: string | null };
    isLoading: boolean;
    lastUpdated: Date | null;
    errorMessage: string | null;
}

export interface UseOBSDebugReturn {
    debugInfo: DebugInfo;
    loadAllScenes: () => Promise<void>;
    testMulticamCameras: () => Promise<void>;
    clearDebugInfo: () => void;
    refreshAll: () => Promise<void>;
}

/**
 * Hook pour la gestion des fonctionnalités de debug OBS
 * Fournit des outils pour inspecter les scènes et les caméras
 */
export const useOBSDebug = (obsService: OBSService | null, isConnected: boolean): UseOBSDebugReturn => {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({
        allScenes: [],
        multicamInfo: {},
        isLoading: false,
        lastUpdated: null,
        errorMessage: null
    });

    // Nettoyage automatique quand on se déconnecte
    useEffect(() => {
        if (!isConnected) {
            setDebugInfo(prev => ({
                ...prev,
                allScenes: [],
                multicamInfo: {},
                errorMessage: null
            }));
        }
    }, [isConnected]);

    const setLoading = useCallback((loading: boolean) => {
        setDebugInfo(prev => ({ 
            ...prev, 
            isLoading: loading,
            ...(loading ? { errorMessage: null } : {})
        }));
    }, []);

    const setError = useCallback((error: string) => {
        setDebugInfo(prev => ({ 
            ...prev, 
            isLoading: false,
            errorMessage: error
        }));
    }, []);

    const loadAllScenes = useCallback(async () => {
        if (!obsService || !isConnected) {
            setError('Cannot load scenes: not connected or no obsService');
            return;
        }

        setLoading(true);
        
        try {
            console.log('Loading all OBS scenes...');
            const scenes = await obsService.getAllScenes();
            console.log(`Found ${scenes.length} scenes:`, scenes);
            
            setDebugInfo(prev => ({
                ...prev,
                allScenes: scenes,
                isLoading: false,
                lastUpdated: new Date(),
                errorMessage: null
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error loading scenes';
            console.error('Error loading scenes:', error);
            setError(`Error loading scenes: ${errorMessage}`);
        }
    }, [obsService, isConnected, setLoading, setError]);

    const testMulticamCameras = useCallback(async () => {
        if (!obsService || !isConnected) {
            setError('Cannot test multicam cameras: not connected or no obsService');
            return;
        }

        setLoading(true);
        
        try {
            console.log('Testing multicam cameras...');
            const multicamScenes = await obsService.getMulticamScenes();
            console.log('Multicam scenes found:', multicamScenes);

            if (multicamScenes.length === 0) {
                setDebugInfo(prev => ({
                    ...prev,
                    multicamInfo: {},
                    isLoading: false,
                    lastUpdated: new Date(),
                    errorMessage: 'No multicam scenes found (scenes with CAMSELECT)'
                }));
                return;
            }

            const info: { [key: string]: string | null } = {};
            
            for (const scene of multicamScenes) {
                console.log(`Testing scene: ${scene}`);
                try {
                    const currentCamera = await obsService.getCurrentCamera(scene);
                    console.log(`Current camera for ${scene}:`, currentCamera);
                    info[scene] = currentCamera;
                } catch (sceneError) {
                    console.error(`Error getting camera for scene ${scene}:`, sceneError);
                    info[scene] = null;
                }
            }

            setDebugInfo(prev => ({
                ...prev,
                multicamInfo: info,
                isLoading: false,
                lastUpdated: new Date(),
                errorMessage: null
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error testing multicam cameras';
            console.error('Error testing multicam cameras:', error);
            setError(`Error testing multicam cameras: ${errorMessage}`);
        }
    }, [obsService, isConnected, setLoading, setError]);

    const clearDebugInfo = useCallback(() => {
        setDebugInfo({
            allScenes: [],
            multicamInfo: {},
            isLoading: false,
            lastUpdated: null,
            errorMessage: null
        });
    }, []);

    const refreshAll = useCallback(async () => {
        if (!obsService || !isConnected) {
            setError('Cannot refresh: not connected or no obsService');
            return;
        }

        setLoading(true);
        try {
            // Charger les scènes et tester les multicams en parallèle
            await Promise.all([
                loadAllScenes(),
                testMulticamCameras()
            ]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error refreshing data';
            console.error('Error refreshing debug data:', error);
            setError(`Error refreshing data: ${errorMessage}`);
        }
    }, [obsService, isConnected, loadAllScenes, testMulticamCameras, setLoading, setError]);

    return {
        debugInfo,
        loadAllScenes,
        testMulticamCameras,
        clearDebugInfo,
        refreshAll
    };
};
