import OBSWebSocket from 'obs-websocket-js';

interface SceneItem {
    sceneItemId: number;
    sourceName: string;
    sceneItemEnabled?: boolean;
    [key: string]: unknown;
}

interface Scene {
    sceneName: string;
    [key: string]: unknown;
}

export class OBSService {
    private obs: OBSWebSocket;
    private allScenesCache: string[] | null = null;

    constructor() {
        this.obs = new OBSWebSocket();
    }

    async connect(host: string, port: string, password?: string): Promise<void> {
        const wsUrl = `ws://${host}:${port}`;
        await this.obs.connect(wsUrl, password || undefined);
        this.allScenesCache = null; // Clear cache on new connection
    }

    async disconnect(): Promise<void> {
        await this.obs.disconnect();
        this.allScenesCache = null;
    }

    // Event handling - simplified to avoid complex typing issues
    onConnectionClosed(callback: () => void): void {
        this.obs.on('ConnectionClosed', callback);
    }

    onCurrentSceneChanged(callback: (sceneName: string) => void): void {
        this.obs.on('CurrentProgramSceneChanged', (data: unknown) => {
            const sceneData = data as { sceneName: string };
            callback(sceneData.sceneName);
        });
    }

    onSceneCreated(callback: () => void): void {
        this.obs.on('SceneCreated', callback);
    }

    onSceneRemoved(callback: () => void): void {
        this.obs.on('SceneRemoved', callback);
    }

    onSceneNameChanged(callback: () => void): void {
        this.obs.on('SceneNameChanged', callback);
    }

    onSceneItemCreated(callback: () => void): void {
        this.obs.on('SceneItemCreated', callback);
    }

    onSceneItemRemoved(callback: () => void): void {
        this.obs.on('SceneItemRemoved', callback);
    }

    onSceneItemEnableStateChanged(callback: () => void): void {
        this.obs.on('SceneItemEnableStateChanged', callback);
    }

    // Scene operations
    async getAllScenes(): Promise<string[]> {
        if (this.allScenesCache) return this.allScenesCache;
        const scenes = await this.obs.call('GetSceneList');
        this.allScenesCache = (scenes.scenes as Scene[]).map((s) => s.sceneName);
        return this.allScenesCache;
    }

    clearScenesCache(): void {
        this.allScenesCache = null;
    }

    async getMulticamScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        console.log('All scenes:', allScenes);
        const multicamScenes = allScenes.filter((name) => name.startsWith('CAMSELECT')).sort();
        console.log('Filtered multicam scenes:', multicamScenes);
        return multicamScenes;
    }

    async getCameraScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        return allScenes
            .filter(
                (name) =>
                    (name.startsWith('CAM') || name.startsWith('CAM ')) &&
                    !name.startsWith('CAMSELECT') &&
                    !name.toLowerCase().includes('multicam')
            )
            .reverse();
    }

    async getFScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        return allScenes.filter((name) => name.startsWith('F')).reverse();
    }

    async getCurrentScene(): Promise<string> {
        const res = await this.obs.call('GetCurrentProgramScene');
        return res.currentProgramSceneName;
    }

    async switchToScene(sceneName: string): Promise<void> {
        await this.obs.call('SetCurrentProgramScene', { sceneName });
    }

    // Scene item operations
    async getSceneItems(sceneName: string): Promise<SceneItem[]> {
        const items = await this.obs.call('GetSceneItemList', { sceneName });
        return items.sceneItems as SceneItem[];
    }

    async getCurrentCamera(multicamName: string): Promise<string | null> {
        try {
            console.log(`Getting scene items for ${multicamName}...`);
            const items = await this.getSceneItems(multicamName);
            console.log(
                `Scene items for ${multicamName}:`,
                items.map((item) => item.sourceName)
            );

            const camera = items.find((item) => {
                const isCamera = item.sourceName.startsWith('CAM') || item.sourceName.startsWith('CAM ');
                return isCamera;
            });

            const result = camera ? camera.sourceName : null;
            console.log(`Found camera for ${multicamName}:`, result);
            return result;
        } catch (err) {
            console.error(`Error getting current camera for ${multicamName}:`, err);
            return null;
        }
    }

    async replaceSceneItem(multicamName: string, newSceneName: string): Promise<void> {
        try {
            // Get all items in the MULTICAM scene
            const items = await this.getSceneItems(multicamName);

            // Remove all existing items from the MULTICAM scene
            await Promise.all(
                items.map((item) =>
                    this.obs.call('RemoveSceneItem', {
                        sceneName: multicamName,
                        sceneItemId: item.sceneItemId,
                    })
                )
            );

            // Add the new camera scene to the MULTICAM scene
            const newItem = await this.obs.call('CreateSceneItem', {
                sceneName: multicamName,
                sourceName: newSceneName,
            });

            // Set the transform to fill the scene
            await this.obs.call('SetSceneItemTransform', {
                sceneName: multicamName,
                sceneItemId: newItem.sceneItemId,
                sceneItemTransform: {
                    positionX: 0,
                    positionY: 0,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    boundsType: 'OBS_BOUNDS_SCALE_INNER',
                    boundsWidth: 1920,
                    boundsHeight: 1080,
                },
            });
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`Erreur lors de la modification de ${multicamName}: ${error.message}`);
        }
    }

    // Overlay operations
    async getOverlaySources(): Promise<{ name: string; visible: boolean }[]> {
        try {
            const items = await this.getSceneItems('OVERLAY');
            return items.map((item) => ({
                name: item.sourceName,
                visible: item.sceneItemEnabled !== false,
            }));
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`Erreur lors de la récupération des sources OVERLAY: ${error.message}`);
        }
    }

    async setSourceVisibility(sourceName: string, visible: boolean): Promise<void> {
        try {
            const items = await this.getSceneItems('OVERLAY');
            const item = items.find((i) => i.sourceName === sourceName);
            
            if (!item) {
                throw new Error(`Source "${sourceName}" introuvable dans la scène OVERLAY`);
            }

            await this.obs.call('SetSceneItemEnabled', {
                sceneName: 'OVERLAY',
                sceneItemId: item.sceneItemId,
                sceneItemEnabled: visible,
            });
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`Erreur lors de la modification de la visibilité de "${sourceName}": ${error.message}`);
        }
    }
}
