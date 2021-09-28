import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HttpIntercepterBasicAuthService implements HttpInterceptor {

  constructor(private userAuth: UserDetailsService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // userAuth service will run and get the current user cec id from SSO
      const userObj = this.userAuth.getLoggedInUserObject;
      if (userObj) {
        // tslint:disable-next-line: variable-name
        const  { cecId: user_id, name: user_name } = userObj;

        // All request will has user_id header once user cecId availabe
        // Skip addition of bearer token while calling doc Central API from UI
        if (user_id && !(req.url.includes(`${environment.docCentralAPI}`))) {
          req = req.clone({
            setHeaders: {
              user_id,
              user_name,
              authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
          });
        }
      }

      return next.handle(req);
  }
}

