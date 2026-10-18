import { useOBSController } from './hooks/useOBSController';
import { useSimpleRouter } from './hooks/useSimpleRouter';
import { PreviewContext, usePreviews } from './hooks/usePreviews';
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
import PreviewControls from './components/PreviewControls';

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
        handleApplyCamera,
        handleSceneSwitch,
    } = useOBSController();
    const previews = usePreviews(obsService, isConnected);

    return (
        <PreviewContext.Provider value={previews.context}>
            <Header status={status} statusText={statusText} onDisconnect={handleDisconnect}>
                {isConnected && (
                    <PreviewControls
                        enabled={previews.enabled}
                        intervalMs={previews.intervalMs}
                        onToggle={previews.setEnabled}
                        onIntervalChange={previews.setIntervalMs}
                    />
                )}
            </Header>

            {isConnected ? (
                <main className="workspace">
                    <div className="stage">
                        <MulticamContainer
                            multicams={multicams}
                            cameraScenes={cameraScenes}
                            isLoading={isLoadingInterface}
                            onApplyCamera={handleApplyCamera}
                        />
                    </div>

                    <aside className="sidebar">
                        <SceneSwitchBar
                            scenes={fScenes}
                            currentScene={currentScene}
                            onSceneSwitch={handleSceneSwitch}
                        />
                        <Overlay obsService={obsService} onToast={showToast} updateTrigger={overlayUpdateTrigger} />
                    </aside>

                    {/* <DebugPanel obsService={obsService} isConnected={isConnected} /> */}
                </main>
            ) : (
                <ConnectionForm isConnecting={isConnecting} onConnect={handleConnect} />
            )}

            <Toaster messages={toasterMessages} onRemove={removeToast} />
        </PreviewContext.Provider>
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
