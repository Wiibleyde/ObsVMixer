import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { PreviewStore } from '../services/previewStore';
import type { OBSService } from '../services/obsService';

export const PREVIEW_INTERVALS = [500, 1000, 2000] as const;
const DEFAULT_INTERVAL = 1000;

const STORAGE_KEYS = {
    enabled: 'previewEnabled',
    interval: 'previewInterval',
} as const;

const readInterval = () => {
    const stored = Number(localStorage.getItem(STORAGE_KEYS.interval));
    return (PREVIEW_INTERVALS as readonly number[]).includes(stored) ? stored : DEFAULT_INTERVAL;
};

interface PreviewContextValue {
    store: PreviewStore;
    enabled: boolean;
}

export const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreviewContext(): PreviewContextValue {
    const context = useContext(PreviewContext);
    if (!context) throw new Error('usePreviewContext doit être utilisé dans un PreviewContext');
    return context;
}

/** Dernière capture d'une scène ; ne re-rend que le composant qui l'affiche. */
export function useScenePreview(sceneName: string): string | null {
    const { store } = usePreviewContext();
    const subscribe = useCallback((listener: () => void) => store.subscribe(sceneName, listener), [store, sceneName]);
    return useSyncExternalStore(subscribe, () => store.get(sceneName));
}

/** Pilote les captures : actives seulement si connecté, activées et onglet/dock visible. */
export function usePreviews(obsService: OBSService, isConnected: boolean) {
    const [store] = useState(() => new PreviewStore(obsService));
    const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEYS.enabled) !== 'false');
    const [intervalMs, setIntervalMs] = useState(readInterval);
    const [isPageVisible, setIsPageVisible] = useState(() => !document.hidden);

    useEffect(() => {
        const onVisibilityChange = () => setIsPageVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.enabled, String(enabled));
    }, [enabled]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.interval, String(intervalMs));
        store.setInterval(intervalMs);
    }, [store, intervalMs]);

    useEffect(() => {
        if (!isConnected) store.clear();
    }, [store, isConnected]);

    useEffect(() => {
        if (!enabled || !isConnected || !isPageVisible) return;
        store.start();
        return () => store.stop();
    }, [store, enabled, isConnected, isPageVisible]);

    const context = useMemo(() => ({ store, enabled }), [store, enabled]);

    return { context, enabled, setEnabled, intervalMs, setIntervalMs };
}
