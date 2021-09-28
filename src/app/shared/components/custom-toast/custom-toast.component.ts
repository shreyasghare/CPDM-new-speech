import { Component, OnInit } from '@angular/core';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ToastOptions } from './toastOptions.model';
import { trigger, transition, animate, style } from '@angular/animations';
import { Toast } from './Toast.model';

@Component({
  selector: 'custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('500ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class CustomToastComponent implements OnInit {
  private defaultAutoHideDuration = 5000;
  toasts: Toast [] = [];
  showAnimation: boolean;

  constructor(private toastSerivce: ToastService) { }

  ngOnInit() {
    this.toastServiceUpdateListeners();
  }

  toastServiceUpdateListeners(): void {
    this.toastSerivce.showObservable.subscribe(toastDetails => {
      const {title, message, severity, guid, options} = toastDetails;
      this.add(title, message, severity, guid, options);
    });

    this.toastSerivce.updateObservable.subscribe(toastDetails => {
      const {guid , title, message, severity, options} = toastDetails;
      this.update(guid, title, message, severity, options);
    });

    this.toastSerivce.progressBarObservable.subscribe(toastDetails => {
      const {guid, percentage, title, message} = toastDetails;
      const toastIndex = this.findIndexByGuid(guid);
      if (toastIndex !== -1) {
      this.setProgressbarPercentage(guid, toastIndex, percentage, title, message);
      }
    });

    this.toastSerivce.removeToastObservable.subscribe(toastGuid => {
      this.removeToastByGuid(toastGuid, 0);
    });

  }

  private add(title: string, message: string, severity: string, guid: string, options: ToastOptions ): void {
    const {autoHide = true, duration = this.defaultAutoHideDuration, showProgressBar = false,
      progressBarPercentage = 0, showAnimation = true} = options;
    this.showAnimation = showAnimation;
    this.toasts.push({ title, message, severity, guid, showProgressBar, progressBarPercentage });
    if (autoHide !== false) {
    this.removeToastByGuid(guid, duration);
    }
  }

  private update(guid: string, title: string, message: string, severity: string, options: ToastOptions) {
    const { autoHide = true, duration = this.defaultAutoHideDuration, showAnimation = true } = options;
    this.showAnimation = showAnimation;
    const index = this.findIndexByGuid(guid);
    if (index !== -1) {
      this.toasts[index].title = title;
      this.toasts[index].message = message;
      this.toasts[index].severity = severity;
      this.toasts[index].showProgressBar = false;
      if (autoHide !== false) {
      this.removeToastByGuid(guid, duration);
      }
    }
  }

  public removeToastByIndex(toastIndex: number, timeout: number = 0): void {
    setTimeout(() => {
      this.toasts.splice(toastIndex, 1);
    }, timeout);
  }

  private removeToastByGuid(guid: string, timeout: number = 0): void {
    setTimeout(() => {
      const toastIndex = this.findIndexByGuid(guid);
      this.removeToastByIndex(toastIndex);
    }, timeout);
  }

  private findIndexByGuid(guid: string): number {
    return this.toasts.findIndex(value => guid === value.guid);
  }

  private setProgressbarPercentage(guid: string, index: number, percentage: number, status: string, message: string) {
    const toast = this.toasts[index].progressBarPercentage;
    if (toast < 100 && !isNaN(percentage)) {
      this.toasts[index].progressBarPercentage = percentage;
    } else if (toast === 100) {
      this.setProgressSuccess(index, status, message);
      this.removeToastByGuid(guid, this.defaultAutoHideDuration);
    }
  }

  private setProgressSuccess(index: number, title: string, message: string) {
    this.toasts[index].title = title;
    this.toasts[index].message = message;
    this.toasts[index].severity = 'success';
  }

  toastIconClass(severity: string): string {
    let iconClass = severity;
    switch (severity) {
          case 'danger':
            iconClass =  'error';
            break;

          case 'success':
            iconClass = 'check';
            break;
        }
    return `icon-${iconClass}-outline text-${severity}`;
  }
}
