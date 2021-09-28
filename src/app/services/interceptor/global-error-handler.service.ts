import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ToastService } from '@cpdm-service/shared/toast.service';

@Injectable({
  providedIn: 'root'
})

export class GlobalErrorHandler implements HttpInterceptor {

  constructor(public toastService: ToastService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        this.handleError(err);
        console.error(err);
        return throwError(err);
      })
    );
  }
  handleError(httpError: any) {
    if (httpError.status === 403 && httpError.error.error === 'Forbidden') {
      this.toastService.show(
        'Security Alert',
        'Please remove any special characters',
        'danger'
      );
    }else if (httpError.status === 401) {
      sessionStorage.removeItem('token');
      location.reload(true);//TODO either reload or redirect user to landing page
    }else if(httpError.status === 500 && httpError.error.error === 'request entity too large'){
      //Fix For DE2781,DE2804 issues
      this.toastService.show('Error in saving data', 'Data is too long. Please reduce input text data to proceed', 'danger');
    }
  }
}
