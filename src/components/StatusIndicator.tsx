interface StatusIndicatorProps {
  status: 'connected' | 'connecting' | 'error' | '';
  statusText: string;
  onDisconnect: () => void;
}

export default function StatusIndicator({ status, statusText, onDisconnect }: StatusIndicatorProps) {
  return (
    <div className="status-indicator" aria-live="polite" aria-atomic="true">
      <span className={`status-dot ${status}`}></span>
      <span>{statusText}</span>
      {status === 'connected' && (
        <button className="disconnect-btn" onClick={onDisconnect}>
          Déconnecter
        </button>
      )}
    </div>
  );
}
