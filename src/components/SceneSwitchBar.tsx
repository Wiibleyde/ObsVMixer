interface SceneSwitchBarProps {
  scenes: string[];
  currentScene: string | null;
  onSceneSwitch: (sceneName: string) => void;
}

export default function SceneSwitchBar({ scenes, currentScene, onSceneSwitch }: SceneSwitchBarProps) {
  if (scenes.length === 0) return null;

  return (
    <div className="scene-switch-bar" aria-label="Changer de scène">
      {scenes.map((scene) => {
        const isActive = scene === currentScene;
        const displayName = scene.startsWith("F ") ? scene.slice(2) : scene;
        
        return (
          <button
            key={scene}
            className={`scene-switch-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSceneSwitch(scene)}
            aria-label={`Aller à la scène ${scene}`}
            aria-current={isActive ? "true" : undefined}
            tabIndex={0}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
}
