import OBSWebSocket, { type EventTypes } from 'obs-websocket-js';
import type { OverlaySource } from '../types';
import { getErrorMessage } from '../utils/error';

export const MULTICAM_PREFIX = 'CAMSELECT';
export const CAMERA_PREFIX = 'CAM';
export const SWITCH_PREFIX = 'F';
export const OVERLAY_SCENE = 'OVERLAY';

interface SceneItem {
    sceneItemId: number;
    sourceName: string;
    sceneItemEnabled?: boolean;
}

interface Scene {
    sceneName: string;
}

const isCameraScene = (name: string) =>
    name.startsWith(CAMERA_PREFIX) && !name.startsWith(MULTICAM_PREFIX) && !name.toLowerCase().includes('multicam');

export class OBSService {
    private obs = new OBSWebSocket();
    private scenesCache: Promise<string[]> | null = null;
    private videoSizeCache: Promise<{ width: number; height: number }> | null = null;

    async connect(host: string, port: string, password?: string): Promise<void> {
        this.clearCaches();
        await this.obs.connect(`ws://${host}:${port}`, password || undefined);
    }

    async disconnect(): Promise<void> {
        await this.obs.disconnect();
        this.clearCaches();
    }

    /** Abonne un listener à un événement OBS et renvoie la fonction de désabonnement. */
    on<E extends keyof EventTypes>(event: E, listener: (data: EventTypes[E]) => void): () => void {
        const handler = listener as never;
        this.obs.on(event, handler);
        return () => this.obs.off(event, handler);
    }

    private clearCaches(): void {
        this.scenesCache = null;
        this.videoSizeCache = null;
    }

    clearScenesCache(): void {
        this.scenesCache = null;
    }

    // Scene operations
    getAllScenes(): Promise<string[]> {
        // On met la promesse en cache pour dédupliquer les appels concurrents
        this.scenesCache ??= this.obs
            .call('GetSceneList')
            .then((res) => (res.scenes as unknown as Scene[]).map((s) => s.sceneName))
            .catch((err) => {
                this.scenesCache = null;
                throw err;
            });
        return this.scenesCache;
    }

    async getMulticamScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        return allScenes.filter((name) => name.startsWith(MULTICAM_PREFIX)).sort();
    }

    async getCameraScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        return allScenes.filter(isCameraScene).reverse();
    }

    async getFScenes(): Promise<string[]> {
        const allScenes = await this.getAllScenes();
        return allScenes.filter((name) => name.startsWith(SWITCH_PREFIX)).reverse();
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
        const res = await this.obs.call('GetSceneItemList', { sceneName });
        return res.sceneItems as unknown as SceneItem[];
    }

    async getCurrentCamera(multicamName: string): Promise<string | null> {
        try {
            const items = await this.getSceneItems(multicamName);
            return items.find((item) => item.sourceName.startsWith(CAMERA_PREFIX))?.sourceName ?? null;
        } catch (err) {
            console.error(`Error getting current camera for ${multicamName}:`, err);
            return null;
        }
    }

    private getVideoSize(): Promise<{ width: number; height: number }> {
        this.videoSizeCache ??= this.obs
            .call('GetVideoSettings')
            .then((res) => ({ width: res.baseWidth, height: res.baseHeight }))
            .catch(() => {
                this.videoSizeCache = null;
                return { width: 1920, height: 1080 };
            });
        return this.videoSizeCache;
    }

    async replaceSceneItem(multicamName: string, newSceneName: string): Promise<void> {
        try {
            const [items, { width, height }] = await Promise.all([
                this.getSceneItems(multicamName),
                this.getVideoSize(),
            ]);

            // Vide la scène MULTICAM puis y ajoute la nouvelle caméra
            await Promise.all(
                items.map((item) =>
                    this.obs.call('RemoveSceneItem', { sceneName: multicamName, sceneItemId: item.sceneItemId })
                )
            );

            const { sceneItemId } = await this.obs.call('CreateSceneItem', {
                sceneName: multicamName,
                sourceName: newSceneName,
            });

            // Étire l'élément pour remplir toute la scène
            await this.obs.call('SetSceneItemTransform', {
                sceneName: multicamName,
                sceneItemId,
                sceneItemTransform: {
                    positionX: 0,
                    positionY: 0,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    boundsType: 'OBS_BOUNDS_SCALE_INNER',
                    boundsWidth: width,
                    boundsHeight: height,
                },
            });
        } catch (err) {
            throw new Error(`Erreur lors de la modification de ${multicamName}: ${getErrorMessage(err)}`);
        }
    }

    // Overlay operations
    async getOverlaySources(): Promise<OverlaySource[]> {
        try {
            const items = await this.getSceneItems(OVERLAY_SCENE);
            return items.map((item) => ({
                id: item.sceneItemId,
                name: item.sourceName,
                visible: item.sceneItemEnabled !== false,
            }));
        } catch (err) {
            throw new Error(`Erreur lors de la récupération des sources OVERLAY: ${getErrorMessage(err)}`);
        }
    }

    async setSourceVisibility(source: OverlaySource, visible: boolean): Promise<void> {
        try {
            await this.obs.call('SetSceneItemEnabled', {
                sceneName: OVERLAY_SCENE,
                sceneItemId: source.id,
                sceneItemEnabled: visible,
            });
        } catch (err) {
            throw new Error(
                `Erreur lors de la modification de la visibilité de "${source.name}": ${getErrorMessage(err)}`
            );
        }
    }
}
