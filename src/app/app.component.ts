import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { Router } from '@angular/router';
import { RouteConfigLoadEnd } from '@angular/router';
import { RouteConfigLoadStart } from '@angular/router';
import { MatomoInjector } from 'ngx-matomo';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Booleans to show or Hide the the loader----------------------
  showLoader = false;
  // ------------------------------------------------------------
  // Booleans to show or Hide the the Spinner---------------------
  showSpinner = false;
  // ------------------------------------------------------------

  constructor(
    private loaderService: LoaderService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private matomoInjector: MatomoInjector ) {
      this.matomoInjector.init(environment.matomo.url, environment.matomo.siteId);
    }

  ngOnInit() {
    this.spinnerServiceUpdatelistner();
    this.loaderServiceUpdatelistner();
    this.routingChangesUpdateListner();
  }

  loaderServiceUpdatelistner(): void {
    this.loaderService.loaderUpdateListener().subscribe(showLoader => {
      this.showLoader = showLoader;
      this.cdr.detectChanges();
    });
  }

  spinnerServiceUpdatelistner(): void {
    this.spinnerService.spinnerUpdateListener().subscribe(showSpinner => {
      this.showSpinner = showSpinner;
      this.cdr.detectChanges();
    });
  }

  routingChangesUpdateListner(): void {
    this.router.events.subscribe(event => {
      if ( event instanceof RouteConfigLoadStart ) {
        this.showSpinner = true;
      } else if ( event instanceof RouteConfigLoadEnd ) {
        this.showSpinner = false;
      }
    });
  }
}
