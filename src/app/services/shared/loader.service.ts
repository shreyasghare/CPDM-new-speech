import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loader = new Subject<boolean>();
  constructor() { }

  show(): void {
   this.loader.next(true);
  }

  hide(): void {
    this.loader.next(false);
  }

  loaderUpdateListener(): Observable<boolean> {
    return this.loader.asObservable();
  }
}
