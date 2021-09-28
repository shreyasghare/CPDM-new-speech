import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalErrorHandler } from '@cpdm-service/interceptor/global-error-handler.service';
import { HttpIntercepterBasicAuthService } from '@cpdm-service/auth/http-intercepter-basic-auth.service';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpIntercepterBasicAuthService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalErrorHandler,
      multi: true,
    },
  ]
})
export class CoreModule {}
