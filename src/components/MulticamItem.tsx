import { memo } from 'react';
import { CAMERA_PREFIX } from '../services/obsService';

interface MulticamItemProps {
    multicamName: string;
    cameraScenes: string[];
    currentCamera: string | null;
    selectedCamera: string;
    isLoading: boolean;
    onSelectCamera: (multicamName: string, camera: string) => void;
    onApplyCamera: (multicamName: string, selectedCamera: string) => void;
}

const CAMERA_LABEL_REGEX = new RegExp(`^${CAMERA_PREFIX}\\s?`);
const cameraLabel = (camera: string) => camera.replace(CAMERA_LABEL_REGEX, '');
const toId = (value: string) => value.replace(/\s+/g, '_');

function MulticamItem({
    multicamName,
    cameraScenes,
    currentCamera,
    selectedCamera,
    isLoading,
    onSelectCamera,
    onApplyCamera,
}: MulticamItemProps) {
    const hasChanges = selectedCamera !== '' && selectedCamera !== currentCamera;
    const groupName = toId(`camera_${multicamName}`);

    const handleApply = () => {
        if (hasChanges) onApplyCamera(multicamName, selectedCamera);
    };

    return (
        <div className="multicam-item">
            <h3>{multicamName}</h3>
            <div className="camera-status">
                <span className="current-label">Actuelle:</span>
                <span className="current-cam-label" aria-live="polite" aria-atomic="true">
                    {isLoading ? (
                        <span className="spinner"></span>
                    ) : currentCamera ? (
                        <b>{cameraLabel(currentCamera)}</b>
                    ) : (
                        <span style={{ color: '#aaa' }}>Aucune</span>
                    )}
                </span>
            </div>
            <div className="camera-selector">
                {cameraScenes.map((cam) => {
                    const label = cameraLabel(cam);
                    const radioId = toId(`${groupName}_${cam}`);
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
                                onChange={() => onSelectCamera(multicamName, cam)}
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

export default memo(MulticamItem);
