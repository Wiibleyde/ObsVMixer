import MulticamItem from './MulticamItem';
import type { MulticamView } from '../hooks/useOBSController';

interface MulticamContainerProps {
    multicams: MulticamView[];
    cameraScenes: string[];
    isLoading: boolean;
    onSelectCamera: (multicamName: string, camera: string) => void;
    onApplyCamera: (multicamName: string, selectedCamera: string) => void;
    onApplyAll: () => void;
}

export default function MulticamContainer({
    multicams,
    cameraScenes,
    isLoading,
    onSelectCamera,
    onApplyCamera,
    onApplyAll,
}: MulticamContainerProps) {
    if (isLoading) {
        return (
            <div className="multicam-container">
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <span className="spinner"></span>
                    <span style={{ marginLeft: '10px' }}>Chargement des scènes...</span>
                </div>
            </div>
        );
    }

    if (multicams.length === 0) {
        return (
            <div className="multicam-container">
                <div style={{ textAlign: 'center', color: '#aaa', padding: '18px 0' }}>
                    <span style={{ fontSize: '16px' }}>😕</span>
                    <br />
                    <b style={{ fontSize: '12px' }}>Aucune scène MULTICAM trouvée</b>
                    <div style={{ fontSize: '10px', marginTop: '6px' }}>
                        Créez une scène commençant par <b>CAMSELECT</b> dans OBS.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                className="apply-all-button tooltip"
                onClick={onApplyAll}
                aria-label="Synchroniser toutes les sélections"
                title="Synchroniser toutes les sélections"
            >
                🔄 Synchroniser tout
                <span className="tooltiptext">Applique toutes les nouvelles sélections de caméras</span>
            </button>

            <div className="multicam-container">
                {multicams.map((multicam) => (
                    <MulticamItem
                        key={multicam.name}
                        multicamName={multicam.name}
                        cameraScenes={cameraScenes}
                        currentCamera={multicam.currentCamera}
                        selectedCamera={multicam.selectedCamera}
                        isLoading={multicam.isLoading}
                        onSelectCamera={onSelectCamera}
                        onApplyCamera={onApplyCamera}
                    />
                ))}
            </div>
        </>
    );
}
