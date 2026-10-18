import type { ReactNode } from 'react';
import StatusIndicator from './StatusIndicator';
import type { ConnectionStatus } from '../types';

interface HeaderProps {
    status: ConnectionStatus;
    statusText: string;
    onDisconnect: () => void;
    children?: ReactNode;
}

export default function Header({ status, statusText, onDisconnect, children }: HeaderProps) {
    return (
        <header className="header-bar">
            <div className="brand">
                <h1>ObsVMixer</h1>
                <span className="brand-subtitle">Régie multicam</span>
            </div>
            <div className="header-actions">
                {children}
                <StatusIndicator status={status} statusText={statusText} onDisconnect={onDisconnect} />
            </div>
        </header>
    );
}
