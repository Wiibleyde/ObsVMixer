import { memo } from 'react';

interface SceneSwitchBarProps {
    scenes: string[];
    currentScene: string | null;
    onSceneSwitch: (sceneName: string) => void;
}

function SceneSwitchBar({ scenes, currentScene, onSceneSwitch }: SceneSwitchBarProps) {
    if (scenes.length === 0) return null;

    return (
        <div className="scene-switch-bar" role="group" aria-label="Changer de scène">
            {scenes.map((scene) => {
                const isActive = scene === currentScene;
                const displayName = scene.startsWith('F ') ? scene.slice(2) : scene;

                return (
                    <button
                        key={scene}
                        className={`scene-switch-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onSceneSwitch(scene)}
                        aria-label={`Aller à la scène ${scene}`}
                        aria-current={isActive ? 'true' : undefined}
                    >
                        {displayName}
                    </button>
                );
            })}
        </div>
    );
}

export default memo(SceneSwitchBar);
