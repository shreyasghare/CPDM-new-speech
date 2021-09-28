import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService implements CanActivate {

  constructor(private userService: UserDetailsService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userService.isUserLoggedIn()) {
        return true;
    } else {

     // this.router.navigate([""]);
     // return false;

      // not logged in so redirect to login page with the return url and return false
      this.router.navigate([''], { queryParams: { returnUrl: state.url }});
      return false;
    }

  }
}
