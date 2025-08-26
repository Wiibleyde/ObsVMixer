import { useState, useEffect } from 'react';

interface MulticamItemProps {
    multicamName: string;
    cameraScenes: string[];
    currentCamera: string | null;
    isLoading: boolean;
    onApplyCamera: (multicamName: string, selectedCamera: string) => void;
}

export default function MulticamItem({
    multicamName,
    cameraScenes,
    currentCamera,
    isLoading,
    onApplyCamera,
}: MulticamItemProps) {
    const [selectedCamera, setSelectedCamera] = useState('');

    useEffect(() => {
        console.log(`MulticamItem ${multicamName} - currentCamera updated:`, currentCamera);
        setSelectedCamera(currentCamera || '');
    }, [currentCamera, multicamName]);

    const handleCameraSelect = (cameraName: string) => {
        setSelectedCamera(cameraName);
        // Ne plus appliquer automatiquement - l'utilisateur doit cliquer sur "Valider"
    };

    const handleApply = () => {
        if (!selectedCamera || selectedCamera === currentCamera) {
            return;
        }
        onApplyCamera(multicamName, selectedCamera);
    };

    const hasChanges = selectedCamera && selectedCamera !== currentCamera;

    const getCurrentCameraLabel = () => {
        if (isLoading) {
            return <span className="spinner"></span>;
        }
        if (currentCamera) {
            const label = currentCamera.replace(/^CAM\s?/, '');
            return <b>{label}</b>;
        }
        return <span style={{ color: '#aaa' }}>Aucune</span>;
    };

    const groupName = `camera_${multicamName}`.replace(/\s+/g, '_');

    return (
        <div className="multicam-item">
            <h3>{multicamName}</h3>
            <div className="camera-status">
                <span className="current-label">Actuelle:</span>
                <span className="current-cam-label" aria-live="polite" aria-atomic="true">
                    {getCurrentCameraLabel()}
                </span>
            </div>
            <div className="camera-selector">
                {cameraScenes.map((cam) => {
                    const label = cam.replace(/^CAM\s?/, '');
                    const radioId = `${groupName}_${cam}`.replace(/\s+/g, '_');
                    const isActive = currentCamera === cam;
                    const isSelected = selectedCamera === cam;
                    
                    return (
                        <div key={cam} className="camera-option">
                            <input
                                type="radio"
                                id={radioId}
                                name={groupName}
                                value={cam}
                                checked={isSelected}
                                onChange={() => handleCameraSelect(cam)}
                                className="camera-radio"
                                aria-label={`Sélectionner ${label} pour ${multicamName}`}
                            />
                            <label 
                                htmlFor={radioId} 
                                className={`camera-button ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                                title={isActive ? `${label} (actuellement active)` : `Sélectionner ${label}`}
                            >
                                {isActive && <span className="active-indicator">●</span>}
                                {label}
                            </label>
                        </div>
                    );
                })}
            </div>
            <button
                className="apply-button"
                onClick={handleApply}
                disabled={isLoading || !hasChanges}
                title="Appliquer la sélection"
                aria-label={`Appliquer la caméra sélectionnée à ${multicamName}`}
            >
                {isLoading ? <span className="spinner"></span> : '✓ Valider'}
            </button>
        </div>
    );
}
