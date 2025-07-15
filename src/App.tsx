import { useOBSController } from './hooks/useOBSController';
import { useSimpleRouter } from './hooks/useSimpleRouter';
import './globals.css';
import ConnectionForm from './components/ConnectionForm';
import StatusIndicator from './components/StatusIndicator';
import SceneSwitchBar from './components/SceneSwitchBar';
import MulticamContainer from './components/MulticamContainer';
import DebugPanel from './components/DebugPanel';
import Toaster from './components/Toaster';
import Clock from './components/Clock';
import Timer from './components/Timer';
import Countdown from './components/Countdown';
import Overlay from './components/Overlay';

function App() {
    const { currentPath, navigate } = useSimpleRouter();
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
        handleApplyAll,
        handleSceneSwitch,
    } = useOBSController();

    // Rendu conditionnel basé sur la route
    if (currentPath === '/clock') {
        return (
            <>
                <Clock />
            </>
        );
    }

    if (currentPath === '/timer') {
        return (
            <>
                <Timer />
            </>
        );
    }

    if (currentPath === '/countdown') {
        return (
            <>
                <Countdown />
            </>
        );
    }

    // Route par défaut ('/')
    return (
        <>
            <div className="header-bar">
                <h2>🎥 MULTICAM Controller</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/clock')}
                        style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🕐 Clock
                    </button>
                    <button 
                        onClick={() => navigate('/timer')}
                        style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ⏱️ Timer
                    </button>
                    <button 
                        onClick={() => window.open('/ObsVMixer/countdown?date=2025-12-31&time=23-59-59', '_blank')}
                        style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ⏰ Countdown
                    </button>
                    <StatusIndicator status={status} statusText={statusText} onDisconnect={handleDisconnect} />
                </div>
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

                    <Overlay
                        obsService={obsService}
                        isConnected={isConnected}
                        onToast={showToast}
                        updateTrigger={overlayUpdateTrigger}
                    />

                    <DebugPanel obsService={obsService} isConnected={isConnected} />
                </div>
            )}

            <Toaster messages={toasterMessages} onRemove={removeToast} />
        </>
    );
}

export default App;
