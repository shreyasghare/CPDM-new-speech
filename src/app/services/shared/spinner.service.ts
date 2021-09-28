import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private spinner = new Subject<boolean>();
  constructor() { }

  show(): void {
    this.spinner.next(true);
  }

  hide(): void {
    this.spinner.next(false);
  }

  spinnerUpdateListener(): Observable<boolean> {
    return this.spinner.asObservable();
  }
}
