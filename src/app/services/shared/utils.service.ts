import { Injectable } from '@angular/core';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

const toastInitialOptions = {
  show: 'Upload In Progress',
  success: 'Upload Success',
  failed: 'Upload Failed'
};
Object.freeze(toastInitialOptions);

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private uploadSubscription: Subscription;
  private downloadSubscription: Subscription;

  constructor(
    private toastService: ToastService,
    private http: HttpClient
    ) { }

  /**
   *
   * @param path api path to download and show toast from node.js
   * @param fileName Filename to save the file in browser
   */
  downloadFileFromNode(path: string, fileName: string) {
    return new Promise((resolve, reject) => {
      const toastGuid = this.toastService.showProgressBar('Download In Progress', fileName);
      this.downloadSubscription = this.http.get(`${environment.apiUrl}/api/v1/${path}`, { responseType: 'blob',
      reportProgress: true, observe: 'events'}).subscribe(res => {
        const events = res as { loaded: number, total: number };
        const httpResponse = res as HttpResponse<any>;
        this.toastService.updateProgressBar(toastGuid,
          Math.floor(events.loaded / events.total * 100),
          'Download Success', '');
        if (httpResponse.body) {
          saveAs(httpResponse.body, fileName);
          resolve();
          this.unsubscribeDownloadSubscription();
        }
      }, (err) => {
        this.toastService.update(toastGuid, 'Download Failed', 
        fileName, 'danger');
        reject(err);
        this.unsubscribeDownloadSubscription();
      });
    });
  }

  /**
   *
   * @param path Relative api path to the post api ex accessibility/xlsx/parse
   * @param file Mulipart form file to upload (Form Key name default as file)
   * @param toastOptions Toast options to speficy custom message for success and falure scenario
   * @param formData Optional Extra form data apart from file
   */
  async uploadFileToNode(path: string, file: File, toastOptions = toastInitialOptions, formData?: {[key: string]: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      const toastGuid = this.toastService.showProgressBar(toastOptions.show, file.name);
      const apiPath = `${environment.apiUrl}/api/v1/${path}`;

      // New multipart form instance
      const body = new FormData();
      body.append('file', file);

      // tslint:disable-next-line: forin
      for (const form in formData) {
        body.append(form, formData[form]);
      }

      // Subscribing to api
      this.uploadSubscription = this.http.post(apiPath, body, { reportProgress: true, observe: 'events' })
      .subscribe(response => {
        const events = response as { loaded: number, total: number };
        const httpResponse = response as HttpResponse<any>;
        this.toastService.updateProgressBar(toastGuid,
        Math.floor(events.loaded / events.total * 100), toastOptions.success,
        `Successfully imported the ${file.name}`);
        if (httpResponse.body && httpResponse.body.success) {
          resolve(httpResponse.body.data);
          this.unsubscribeUploadSubscription();
        }
      }, err => {
        this.toastService.update(toastGuid, toastOptions.failed, `${err.error.error}`, 'danger');
        reject(err);
        this.unsubscribeUploadSubscription();
      });
    });

  }

  /**
   * To Stop memory Leak
   */
  private unsubscribeUploadSubscription() {
    setTimeout(() => {
      if (this.uploadSubscription) {
        this.uploadSubscription.unsubscribe();
      }
    }, 100);
  }

  /**
   * To Stop memory Leak
   */
  private unsubscribeDownloadSubscription() {
    setTimeout(() => {
      if (this.downloadSubscription) {
        this.downloadSubscription.unsubscribe();
      }
    }, 100);
  }

}
