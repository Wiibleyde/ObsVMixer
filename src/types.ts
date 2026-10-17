export type ConnectionStatus = 'connected' | 'connecting' | 'error' | '';

export type ToastType = 'success' | 'error' | 'info';

export interface ToasterMessage {
    id: string;
    message: string;
    type: ToastType;
}

export interface MulticamData {
    name: string;
    currentCamera: string | null;
    isLoading: boolean;
}

export interface OverlaySource {
    id: number;
    name: string;
    visible: boolean;
}
