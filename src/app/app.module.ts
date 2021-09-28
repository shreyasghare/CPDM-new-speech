import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core.module';
import { StaticModule } from '@cpdm-component/static/static.module';
import { CustomToastComponent } from '@cpdm-shared/components/custom-toast/custom-toast.component';
import { ErrorComponent } from '@cpdm-component/static/error/error.component';


// CUI for main page
import { CuiModalModule } from '@cisco-ngx/cui-components';
import { CuiLoaderModule } from '@cisco-ngx/cui-components';
import { CuiSpinnerModule } from '@cisco-ngx/cui-components';
import { HttpClientModule } from '@angular/common/http';
import { MatomoModule } from 'ngx-matomo';
import { DeviceDetectorService } from 'ngx-device-detector';

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
    CustomToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    StaticModule,
    CuiModalModule,
    CuiLoaderModule,
    CuiSpinnerModule,
    HttpClientModule,
    MatomoModule,
  ],
  providers:[
    DeviceDetectorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
