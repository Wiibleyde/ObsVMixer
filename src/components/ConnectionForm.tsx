import { useState, useEffect } from 'react';

interface ConnectionFormProps {
  isVisible: boolean;
  isConnecting: boolean;
  onConnect: (host: string, port: string, password: string) => void;
}

export default function ConnectionForm({ isVisible, isConnecting, onConnect }: ConnectionFormProps) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('4455');
  const [password, setPassword] = useState('');

  // Load connection settings from localStorage
  useEffect(() => {
    const savedHost = localStorage.getItem('obsHost') || 'localhost';
    const savedPort = localStorage.getItem('obsPort') || '4455';
    const savedPassword = localStorage.getItem('obsPassword') || '';

    setHost(savedHost);
    setPort(savedPort);
    setPassword(savedPassword);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save connection settings
    localStorage.setItem('obsHost', host);
    localStorage.setItem('obsPort', port);
    localStorage.setItem('obsPassword', password);
    
    onConnect(host, port, password);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="connection-form">
      <h3>Connexion OBS WebSocket</h3>
      <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
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
          <button
            type="submit"
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
}
