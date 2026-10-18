import { memo, useEffect, useRef, type ReactNode } from 'react';
import { usePreviewContext, useScenePreview } from '../hooks/usePreviews';

interface ScenePreviewProps {
    sceneName: string;
    children?: ReactNode;
}

// <span> plutôt que <div> : l'aperçu est souvent placé dans un <button>
function ScenePreview({ sceneName, children }: ScenePreviewProps) {
    const { store, enabled } = usePreviewContext();
    const image = useScenePreview(sceneName);
    const ref = useRef<HTMLSpanElement>(null);

    // Seuls les aperçus visibles à l'écran sont capturés
    useEffect(() => {
        const element = ref.current;
        if (!element || !enabled) return;

        let release: (() => void) | null = null;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                release ??= store.show(sceneName);
            } else {
                release?.();
                release = null;
            }
        });
        observer.observe(element);

        return () => {
            observer.disconnect();
            release?.();
        };
    }, [store, sceneName, enabled]);

    return (
        <span ref={ref} className="preview">
            {enabled && image ? (
                <img src={image} alt="" draggable={false} />
            ) : (
                !enabled && <span className="preview-empty">Aperçu coupé</span>
            )}
            {children}
        </span>
    );
}

export default memo(ScenePreview);
