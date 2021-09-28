import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private userId: string;
  loginFaild = false;
  inputValue: string;
  disableLogIn = false;
  getLoggedInUserSubscription: Subscription;
  returnUrl: any;


  constructor(public userDetailsSerivce: UserDetailsService, private router: Router, private route: ActivatedRoute) { }

  //Used for local development
  onLogin() {
    this.disableLogIn = true;
    if (this.inputValue.length <= 8) {
      this.setUserToSession(this.inputValue);
    }
  }

  ngOnInit() {
    // get return url from route parameters or default to '/home'
    this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams.returnUrl || '/home');

    if (this.userDetailsSerivce.isUserLoggedIn()) {
      // this.router.navigate(['/home']);

      // user loged in now redirect to return url
      this.router.navigateByUrl(decodeURIComponent(this.returnUrl));
    } else {
      // If Angular is running in Development mode do not call the get logged in user cec id from SSO
      if (isDevMode()) { return this.loginFaild = true; }
      

      //Uncomment below code once admin is introduced
      this.getLoggedInUserSubscription = this.userDetailsSerivce.getLoggedInUser().subscribe(async (res) => {
          if (res !== null && res.cecId != undefined) {
           this.userId = atob(res.cecId); // decode base 64
           this.setUserToSession(this.userId);
          }
          }, (err) => {
            this.loginFaild = true;
          });
    }
  }

  setUserToSession(userName: string) {

    this.userDetailsSerivce.login(userName).subscribe(resData => {
      this.router.navigateByUrl(decodeURIComponent(this.returnUrl));
    },
      errorMessage => {
        this.inputValue = '';
      this.disableLogIn = false;
      })

  }

  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    if (this.getLoggedInUserSubscription) {
      this.getLoggedInUserSubscription.unsubscribe();
    }
    // *****************************************************/
  }

}
