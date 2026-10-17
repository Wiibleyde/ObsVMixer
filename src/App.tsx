import { useOBSController } from './hooks/useOBSController';
import { useSimpleRouter } from './hooks/useSimpleRouter';
import './globals.css';
import Header from './components/Header';
import ConnectionForm from './components/ConnectionForm';
import SceneSwitchBar from './components/SceneSwitchBar';
import MulticamContainer from './components/MulticamContainer';
// import DebugPanel from './components/DebugPanel';
import Toaster from './components/Toaster';
import Clock from './components/Clock';
import Timer from './components/Timer';
import Countdown from './components/Countdown';
import Overlay from './components/Overlay';

// Page principale, séparée pour que la connexion OBS ne soit montée que sur 'home'
function Home() {
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
        showToast,
        overlayUpdateTrigger,
        handleConnect,
        handleDisconnect,
        handleSelectCamera,
        handleApplyCamera,
        handleApplyAll,
        handleSceneSwitch,
    } = useOBSController();

    return (
        <>
            <Header status={status} statusText={statusText} onDisconnect={handleDisconnect} />

            {isConnected ? (
                <div>
                    <p style={{ marginTop: 0, marginBottom: 10 }}>Gérez vos caméras dans chaque scène MULTICAM</p>

                    <SceneSwitchBar scenes={fScenes} currentScene={currentScene} onSceneSwitch={handleSceneSwitch} />

                    <MulticamContainer
                        multicams={multicams}
                        cameraScenes={cameraScenes}
                        isLoading={isLoadingInterface}
                        onSelectCamera={handleSelectCamera}
                        onApplyCamera={handleApplyCamera}
                        onApplyAll={handleApplyAll}
                    />

                    <Overlay obsService={obsService} onToast={showToast} updateTrigger={overlayUpdateTrigger} />

                    {/* <DebugPanel obsService={obsService} isConnected={isConnected} /> */}
                </div>
            ) : (
                <ConnectionForm isConnecting={isConnecting} onConnect={handleConnect} />
            )}

            <Toaster messages={toasterMessages} onRemove={removeToast} />
        </>
    );
}

function App() {
    const { currentPage } = useSimpleRouter();

    switch (currentPage) {
        case 'clock':
            return <Clock />;
        case 'timer':
            return <Timer />;
        case 'countdown':
            return <Countdown />;
        default:
            return <Home />;
    }
}

export default App;
