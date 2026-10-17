import { useState } from 'react';

interface ConnectionFormProps {
    isConnecting: boolean;
    onConnect: (host: string, port: string, password: string) => void;
}

const STORAGE_KEYS = {
    host: 'obsHost',
    port: 'obsPort',
    password: 'obsPassword',
} as const;

const readStorage = (key: string, fallback: string) => localStorage.getItem(key) || fallback;

export default function ConnectionForm({ isConnecting, onConnect }: ConnectionFormProps) {
    const [host, setHost] = useState(() => readStorage(STORAGE_KEYS.host, 'localhost'));
    const [port, setPort] = useState(() => readStorage(STORAGE_KEYS.port, '4455'));
    const [password, setPassword] = useState(() => readStorage(STORAGE_KEYS.password, ''));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEYS.host, host);
        localStorage.setItem(STORAGE_KEYS.port, port);
        localStorage.setItem(STORAGE_KEYS.password, password);

        onConnect(host, port, password);
    };

    return (
        <div className="connection-form">
            <h3>Connexion OBS WebSocket</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="obsHost">Adresse :</label>
                    <input
                        type="text"
                        id="obsHost"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="localhost"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="obsPort">Port :</label>
                    <input
                        type="number"
                        id="obsPort"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="4455"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="obsPassword">Mot de passe :</label>
                    <input
                        type="password"
                        id="obsPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Laissez vide si aucun"
                    />
                </div>
                <div className="form-buttons">
                    <button type="submit" className="connect-btn" disabled={isConnecting}>
                        {isConnecting ? 'Connexion...' : 'Se connecter'}
                    </button>
                </div>
            </form>
        </div>
    );
}
