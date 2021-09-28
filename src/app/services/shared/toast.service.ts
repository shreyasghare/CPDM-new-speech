import { Injectable } from '@angular/core';
import { ToastOptions, Update } from '@cpdm-model/custom-toast/customToast.model';
import { Toast } from '@cpdm-shared/components/custom-toast/Toast.model';
import {  Subject } from 'rxjs';

const toastDefaultOptions = {
  autoHide: true,
  showAnimation: true
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // Service to show / create toast messages globally using rxjs BehaviorSubject
  // tslint:disable-next-line: variable-name
  private _show = new Subject<Toast>();
  // tslint:disable-next-line: variable-name
  private _showAndUpdate = new Subject<Toast>();
  // tslint:disable-next-line: variable-name
  private _update = new Subject<Toast>();
  // tslint:disable-next-line: variable-name
  private _progressBar = new Subject<Toast>();
  // tslint:disable-next-line: variable-name
  private _remove = new Subject<string>();

  // change or show tost messages globally
  showObservable = this._show.asObservable();
  showAndUpdateObservable = this._showAndUpdate.asObservable();
  updateObservable = this._update.asObservable();
  progressBarObservable = this._progressBar.asObservable();
  removeToastObservable = this._remove.asObservable();

  constructor() { }

  /**
   * Pops the toast with severity, title and message
   * @param title The title to display
   * @param severity The severity of the toast
   * @param message The message to display
   * @param autoHide The duration to auto hide the toast
   */
  show(title: string, message: string, severity: string,
       options: ToastOptions  = toastDefaultOptions
       ): {guid: string, ToastServiceRef: ToastService, update: Update, hide: () => void; } {
    const guid = this.guid();
    this._show.next({title, message, severity, guid, options});
    return {
      guid,
      ToastServiceRef: this,
      update() {
       const allArgs = [...arguments];

       if (!allArgs[3]) {
        allArgs[3] = { autoHide: true };
       }

       this.ToastServiceRef.update(guid, ...allArgs);
      },
      hide() {
        this.ToastServiceRef.remove(guid);
      }
    };
  }

  showProgressBar(title: string, fileName: string, options: {showAnimation: boolean} = {showAnimation: true}) {
    const { showAnimation } = options;
    const message = fileName;

    if (title != null) {
      const guid = this.guid();
      this._show.next({title, message, severity: 'info', guid,
      options: {autoHide: false, showProgressBar: true, showAnimation}});
      return guid;
    }
  }

  update(guid: string, title: string, message: string, severity: string,
         options: {autoHide: boolean, duration?: number, showAnimation?: boolean} = {autoHide: true}) {
    this._update.next({guid, title, message, severity, options});
  }

  remove(guid: string) {
    this._remove.next(guid);
  }

  updateProgressBar(guid: string, percentage: number, title: string, message: string): void {
    this._progressBar.next({guid, percentage, title, message});
  }

  /**
   * Pops the multiple toasts with severity, title and message
   * @param title The title to display
   * @param severity The severity of the toast
   * @param body The message to display
   * @param duration The duration to auto hide the toast
   */
  showAndUpdateToast(title: string, body: string, severity: string, duration?: number): void {
    // this._showAndUpdate.next({title,body,severity,duration});
  }

  /**
   * Get A UNIQ ID
   */
  // ***************************************************************************
  guid() {
    return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line: no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // ***************************************************************************


}
