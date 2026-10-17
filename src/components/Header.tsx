import StatusIndicator from './StatusIndicator';
import type { ConnectionStatus } from '../types';

interface HeaderProps {
    status: ConnectionStatus;
    statusText: string;
    onDisconnect: () => void;
}

export default function Header({ status, statusText, onDisconnect }: HeaderProps) {
    return (
        <div className="header-bar">
            <h2>🎥 MULTICAM Controller</h2>
            <StatusIndicator status={status} statusText={statusText} onDisconnect={onDisconnect} />
        </div>
    );
}
