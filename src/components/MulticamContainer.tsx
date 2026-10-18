import { useCallback, useEffect, useState } from 'react';
import MulticamItem from './MulticamItem';
import CameraBank from './CameraBank';
import type { MulticamData } from '../types';
import { cameraLabel } from '../utils/scene';

interface MulticamContainerProps {
    multicams: MulticamData[];
    cameraScenes: string[];
    isLoading: boolean;
    onApplyCamera: (multicamName: string, camera: string) => void;
}

export default function MulticamContainer({
    multicams,
    cameraScenes,
    isLoading,
    onApplyCamera,
}: MulticamContainerProps) {
    // Caméra choisie, en attente d'être envoyée sur une sortie
    const [armedCamera, setArmedCamera] = useState<string | null>(null);
    const armed = armedCamera !== null && cameraScenes.includes(armedCamera) ? armedCamera : null;

    useEffect(() => {
        if (!armed) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setArmedCamera(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [armed]);

    const handleArm = useCallback((camera: string) => {
        setArmedCamera((prev) => (prev === camera ? null : camera));
    }, []);

    const handleSend = useCallback(
        (multicamName: string) => {
            if (!armed) return;
            onApplyCamera(multicamName, armed);
            setArmedCamera(null);
        },
        [armed, onApplyCamera]
    );

    if (isLoading) {
        return (
            <section className="panel-section slots">
                <div className="empty-state">
                    <span className="spinner"></span>
                    <span>Chargement des scènes...</span>
                </div>
            </section>
        );
    }

    if (multicams.length === 0) {
        return (
            <section className="panel-section slots">
                <div className="empty-state">
                    <b>Aucune scène MULTICAM trouvée</b>
                    <span>
                        Créez une scène commençant par <b>CAMSELECT</b> dans OBS.
                    </span>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="panel-section slots" aria-labelledby="slotsTitle">
                <div className="section-head">
                    <h2 id="slotsTitle" className="section-title">
                        Sorties multicam
                    </h2>
                    <span className="section-hint" aria-live="polite">
                        {armed ? (
                            <>
                                Envoyer <b className="armed-name">{cameraLabel(armed)}</b> sur…
                            </>
                        ) : (
                            "Choisissez d'abord une caméra"
                        )}
                    </span>
                </div>
                <div className="slot-grid">
                    {multicams.map((multicam) => (
                        <MulticamItem key={multicam.name} multicam={multicam} armedCamera={armed} onSend={handleSend} />
                    ))}
                </div>
            </section>

            <CameraBank cameraScenes={cameraScenes} multicams={multicams} armedCamera={armed} onArm={handleArm} />
        </>
    );
}
