import { memo, useMemo } from 'react';
import ScenePreview from './ScenePreview';
import type { MulticamData } from '../types';
import { cameraLabel, multicamLabel } from '../utils/scene';

interface CameraBankProps {
    cameraScenes: string[];
    multicams: MulticamData[];
    armedCamera: string | null;
    onArm: (camera: string) => void;
}

function CameraBank({ cameraScenes, multicams, armedCamera, onArm }: CameraBankProps) {
    // Scènes MULTICAM utilisant actuellement chaque caméra
    const usage = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const m of multicams) {
            if (m.currentCamera) map.set(m.currentCamera, [...(map.get(m.currentCamera) ?? []), m.name]);
        }
        return map;
    }, [multicams]);

    return (
        <section className="panel-section cameras" aria-labelledby="camerasTitle">
            <div className="section-head">
                <h2 id="camerasTitle" className="section-title">
                    Caméras
                </h2>
                <span className="section-hint">
                    {armedCamera
                        ? 'Cliquez une sortie pour envoyer — Échap pour annuler'
                        : 'Clic sur une caméra, puis sur une sortie'}
                </span>
            </div>
            <div className="tile-grid">
                {cameraScenes.map((cam) => {
                    const label = cameraLabel(cam);
                    const isArmed = armedCamera === cam;
                    const usedIn = usage.get(cam);

                    return (
                        <button
                            key={cam}
                            type="button"
                            className={`tile ${isArmed ? 'is-armed' : usedIn ? 'is-live' : ''}`}
                            onClick={() => onArm(cam)}
                            aria-pressed={isArmed}
                            aria-label={`Choisir ${label}`}
                        >
                            <ScenePreview sceneName={cam}>
                                {isArmed && <span className="tally tally-pending">PRÊTE</span>}
                            </ScenePreview>
                            <span className="tile-footer">
                                <span className="tile-label">{label}</span>
                                <span className="usage">
                                    {usedIn?.map((name) => (
                                        <span key={name} className="usage-chip" title={`Utilisée dans ${name}`}>
                                            S{multicamLabel(name)}
                                        </span>
                                    ))}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(CameraBank);
