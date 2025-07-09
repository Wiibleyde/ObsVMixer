import { useState, useCallback } from 'react';
import { OBSService } from '../services/obsService';

export interface MulticamData {
  name: string;
  currentCamera: string | null;
  isLoading: boolean;
}

export function useOBSConnection() {
  const [obsService] = useState(new OBSService());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'connected' | 'connecting' | 'error' | ''>('');
  const [statusText, setStatusText] = useState('Déconnecté');

  const updateStatus = useCallback((newStatus: typeof status, text: string) => {
    setStatus(newStatus);
    setStatusText(text);
  }, []);

  const connect = useCallback(async (host: string, port: string, password: string) => {
    console.log("Starting connection to OBS...");
    setIsConnecting(true);
    updateStatus('connecting', 'Connexion...');

    try {
      console.log("Calling obsService.connect...");
      await obsService.connect(host, port, password);
      console.log("OBS connected successfully");
      
      setIsConnected(true);
      updateStatus('connected', 'Connecté');
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Connection error:", error);
      updateStatus('error', 'Erreur de connexion');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [obsService, updateStatus]);

  const disconnect = useCallback(async () => {
    if (isConnected) {
      await obsService.disconnect();
      setIsConnected(false);
      updateStatus('', 'Déconnecté');
    }
  }, [isConnected, obsService, updateStatus]);

  return {
    obsService,
    isConnected,
    isConnecting,
    status,
    statusText,
    connect,
    disconnect,
    updateStatus
  };
}
