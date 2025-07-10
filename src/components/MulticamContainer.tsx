import MulticamItem from './MulticamItem';

interface MulticamData {
    name: string;
    currentCamera: string | null;
    isLoading: boolean;
}

interface MulticamContainerProps {
    multicams: MulticamData[];
    cameraScenes: string[];
    isLoading: boolean;
    onApplyCamera: (multicamName: string, selectedCamera: string) => void;
    onApplyAll: () => void;
}

export default function MulticamContainer({
    multicams,
    cameraScenes,
    isLoading,
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
                aria-label="Appliquer la sélection à tous les MULTICAM"
                title="Appliquer la sélection à tous les MULTICAM"
                tabIndex={0}
            >
                🎉 Appliquer tout
                <span className="tooltiptext">Appliquer la sélection à tous les MULTICAM</span>
            </button>

            <div className="multicam-container">
                {multicams.map((multicam) => (
                    <MulticamItem
                        key={multicam.name}
                        multicamName={multicam.name}
                        cameraScenes={cameraScenes}
                        currentCamera={multicam.currentCamera}
                        isLoading={multicam.isLoading}
                        onApplyCamera={onApplyCamera}
                    />
                ))}
            </div>
        </>
    );
}
