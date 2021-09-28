import { ToastOptions } from '@cpdm-model/custom-toast/customToast.model';

export interface Toast {
    showProgressBar?: boolean;
    severity?: string;
    message: string;
    title: string;
    guid: string;
    percentage?: number;
    progressBarPercentage?: number;
    options?: ToastOptions;
}