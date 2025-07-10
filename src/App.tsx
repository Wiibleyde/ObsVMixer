import { useOBSController } from './hooks/useOBSController';
import './styles/globals.css';
import ConnectionForm from './components/ConnectionForm';
import StatusIndicator from './components/StatusIndicator';
import SceneSwitchBar from './components/SceneSwitchBar';
import MulticamContainer from './components/MulticamContainer';
import DebugPanel from './components/DebugPanel';
import Toaster from './components/Toaster';

function App() {
    const {
        obsService,
        isConnected,
        isConnecting,
        status,
        statusText,
        multicams,
        cameraScenes,
        fScenes,
        currentScene,
        isLoadingInterface,
        toasterMessages,
        removeToast,
        handleConnect,
        handleDisconnect,
        handleApplyCamera,
        handleApplyAll,
        handleSceneSwitch,
    } = useOBSController();

    return (
        <>
            <div className="header-bar">
                <h2>🎥 MULTICAM Controller</h2>
                <StatusIndicator status={status} statusText={statusText} onDisconnect={handleDisconnect} />
            </div>

            <ConnectionForm isVisible={!isConnected} isConnecting={isConnecting} onConnect={handleConnect} />

            {isConnected && (
                <div>
                    <p style={{ marginTop: 0, marginBottom: 10 }}>Gérez vos caméras dans chaque scène MULTICAM</p>

                    <SceneSwitchBar scenes={fScenes} currentScene={currentScene} onSceneSwitch={handleSceneSwitch} />

                    <MulticamContainer
                        multicams={multicams}
                        cameraScenes={cameraScenes}
                        isLoading={isLoadingInterface}
                        onApplyCamera={handleApplyCamera}
                        onApplyAll={handleApplyAll}
                    />

                    <DebugPanel obsService={obsService} isConnected={isConnected} />
                </div>
            )}

            <Toaster messages={toasterMessages} onRemove={removeToast} />
        </>
    );
}

export default App;
