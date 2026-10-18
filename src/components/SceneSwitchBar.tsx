import { memo } from 'react';
import ScenePreview from './ScenePreview';
import { switchSceneLabel } from '../utils/scene';

interface SceneSwitchBarProps {
    scenes: string[];
    currentScene: string | null;
    onSceneSwitch: (sceneName: string) => void;
}

function SceneSwitchBar({ scenes, currentScene, onSceneSwitch }: SceneSwitchBarProps) {
    if (scenes.length === 0) return null;

    return (
        <section className="panel-section" aria-labelledby="programTitle">
            <div className="section-head">
                <h2 id="programTitle" className="section-title">
                    Programme
                </h2>
                <span className="section-hint">Un clic passe directement à l'antenne</span>
            </div>
            <div className="scene-grid" role="group" aria-label="Changer de scène">
                {scenes.map((scene) => {
                    const isActive = scene === currentScene;

                    return (
                        <button
                            key={scene}
                            type="button"
                            className={`tile ${isActive ? 'is-live' : ''}`}
                            onClick={() => onSceneSwitch(scene)}
                            aria-label={`Aller à la scène ${scene}`}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            <ScenePreview sceneName={scene}>
                                {isActive && <span className="tally tally-live">PGM</span>}
                            </ScenePreview>
                            <span className="tile-label">{switchSceneLabel(scene)}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(SceneSwitchBar);
