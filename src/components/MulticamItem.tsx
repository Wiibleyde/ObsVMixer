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
  onApplyCamera
}: MulticamItemProps) {
  const [selectedCamera, setSelectedCamera] = useState('');

  useEffect(() => {
    console.log(`MulticamItem ${multicamName} - currentCamera updated:`, currentCamera);
    setSelectedCamera(currentCamera || '');
  }, [currentCamera, multicamName]);

  const handleApply = () => {
    if (!selectedCamera) {
      return;
    }
    onApplyCamera(multicamName, selectedCamera);
  };

  const getCurrentCameraLabel = () => {
    if (isLoading) {
      return <span className="spinner"></span>;
    }
    if (currentCamera) {
      const label = currentCamera.replace(/^CAM\s?/, "");
      return <b>{label}</b>;
    }
    return <span style={{ color: '#aaa' }}>Aucune</span>;
  };

  const selectId = `select_${multicamName}`.replace(/\s+/g, '_');

  return (
    <div className="multicam-item">
      <h3>{multicamName}</h3>
      <div className="multicam-controls">
        <label htmlFor={selectId} style={{ display: 'none' }}>
          Sélectionner la caméra pour {multicamName}
        </label>
        <select
          id={selectId}
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          aria-label={`Sélectionner la caméra pour ${multicamName}`}
          tabIndex={0}
        >
          <option value="">-- Caméra --</option>
          {cameraScenes.map((cam) => {
            const label = cam.replace(/^CAM\s?/, "");
            return (
              <option key={cam} value={cam}>
                {label}
              </option>
            );
          })}
        </select>
        <span 
          className="current-cam-label" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {getCurrentCameraLabel()}
        </span>
        <span className="tooltip">
          <button
            onClick={handleApply}
            title={`Appliquer à ce MULTICAM`}
            aria-label={`Appliquer la caméra sélectionnée à ${multicamName}`}
            tabIndex={0}
          >
            ✓
          </button>
          <span className="tooltiptext">
            Appliquer la caméra sélectionnée à ce MULTICAM
          </span>
        </span>
      </div>
    </div>
  );
}
