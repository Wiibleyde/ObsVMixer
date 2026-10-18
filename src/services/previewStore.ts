import type { OBSService } from './obsService';

// Largeur des captures : suffisante pour une miniature, légère à encoder pour OBS
const PREVIEW_WIDTH = 320;
// Pause minimale entre deux cycles, même si un cycle a dépassé l'intervalle
const MIN_CYCLE_GAP = 100;

type Listener = () => void;

/**
 * Rafraîchit les aperçus des scènes actuellement affichées à l'écran.
 * Une seule capture à la fois : OBS n'est jamais sollicité en parallèle et
 * la cadence ralentit d'elle-même s'il répond lentement.
 */
export class PreviewStore {
    private obs: OBSService;
    private images = new Map<string, string>();
    private listeners = new Map<string, Set<Listener>>();
    // Compteur par scène : une caméra affichée à plusieurs endroits n'est capturée qu'une fois
    private shown = new Map<string, number>();
    private intervalMs = 1000;
    private runId = 0;
    private wake: (() => void) | null = null;

    constructor(obs: OBSService) {
        this.obs = obs;
    }

    get(sceneName: string): string | null {
        return this.images.get(sceneName) ?? null;
    }

    subscribe(sceneName: string, listener: Listener): () => void {
        let set = this.listeners.get(sceneName);
        if (!set) this.listeners.set(sceneName, (set = new Set()));
        set.add(listener);
        return () => {
            set.delete(listener);
            if (set.size === 0) this.listeners.delete(sceneName);
        };
    }

    /** Déclare une scène visible ; renvoie la fonction qui la retire. */
    show(sceneName: string): () => void {
        const wasIdle = this.shown.size === 0;
        this.shown.set(sceneName, (this.shown.get(sceneName) ?? 0) + 1);
        if (wasIdle) this.wake?.();

        let released = false;
        return () => {
            if (released) return;
            released = true;
            const count = (this.shown.get(sceneName) ?? 1) - 1;
            if (count <= 0) this.shown.delete(sceneName);
            else this.shown.set(sceneName, count);
        };
    }

    setInterval(ms: number): void {
        this.intervalMs = ms;
    }

    start(): void {
        void this.loop(++this.runId);
    }

    stop(): void {
        this.runId++;
        this.wake?.();
    }

    clear(): void {
        const names = [...this.images.keys()];
        this.images.clear();
        names.forEach((name) => this.notify(name));
    }

    private async loop(id: number): Promise<void> {
        while (id === this.runId) {
            const startedAt = performance.now();

            for (const name of [...this.shown.keys()]) {
                if (id !== this.runId) return;
                if (!this.shown.has(name)) continue;
                try {
                    const image = await this.obs.getScenePreview(name, PREVIEW_WIDTH);
                    if (id !== this.runId) return;
                    this.images.set(name, image);
                    this.notify(name);
                } catch {
                    // Scène supprimée ou OBS occupé : nouvelle tentative au prochain cycle
                }
            }

            const elapsed = performance.now() - startedAt;
            await this.sleep(this.shown.size === 0 ? null : Math.max(MIN_CYCLE_GAP, this.intervalMs - elapsed));
        }
    }

    /** Attend `ms` (ou indéfiniment si null) ; `wake` interrompt l'attente. */
    private sleep(ms: number | null): Promise<void> {
        return new Promise((resolve) => {
            const timer = ms === null ? undefined : setTimeout(() => done(), ms);
            const done = () => {
                clearTimeout(timer);
                if (this.wake === done) this.wake = null;
                resolve();
            };
            this.wake = done;
        });
    }

    private notify(sceneName: string): void {
        this.listeners.get(sceneName)?.forEach((listener) => listener());
    }
}
