import { memo } from 'react';
import ScenePreview from './ScenePreview';
import type { MulticamData } from '../types';
import { cameraLabel } from '../utils/scene';

interface MulticamItemProps {
    multicam: MulticamData;
    armedCamera: string | null;
    onSend: (multicamName: string) => void;
}

function MulticamItem({ multicam, armedCamera, onSend }: MulticamItemProps) {
    const { name, currentCamera, isLoading } = multicam;
    const isAlreadyCurrent = armedCamera !== null && armedCamera === currentCamera;
    const canSend = armedCamera !== null && !isAlreadyCurrent && !isLoading;

    const hint = armedCamera && (
        <span className="slot-hint">
            {isAlreadyCurrent ? 'Déjà sur cette sortie' : `Envoyer ${cameraLabel(armedCamera)} ici`}
        </span>
    );

    return (
        <button
            type="button"
            className={`slot-card ${armedCamera ? 'is-drop-target' : ''}`}
            onClick={() => onSend(name)}
            disabled={!canSend}
            aria-label={canSend ? `Envoyer ${armedCamera} sur ${name}` : undefined}
        >
            {currentCamera ? (
                <ScenePreview sceneName={currentCamera}>{hint}</ScenePreview>
            ) : (
                <span className="preview">
                    <span className="preview-empty">Aucune caméra</span>
                    {hint}
                </span>
            )}
            <span className="slot-info">
                <span className="slot-name">{name}</span>
                <span className="slot-current" aria-live="polite" aria-atomic="true">
                    {isLoading ? (
                        <span className="spinner"></span>
                    ) : (
                        currentCamera && (
                            <>
                                <span className="dot dot-live" aria-hidden="true"></span>
                                {cameraLabel(currentCamera)}
                            </>
                        )
                    )}
                </span>
            </span>
        </button>
    );
}

export default memo(MulticamItem);
