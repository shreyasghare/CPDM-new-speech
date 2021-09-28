export interface ToastOptions {
    autoHide: boolean;
    showAnimation?: boolean;
    duration?: number;
    showProgressBar?: boolean;
}

export type Update = (title: string, message: string, severity: string,
                      options?: { autoHide: boolean, duration?: number }) => void;
