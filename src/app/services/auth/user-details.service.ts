import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
//[DE3162](https://rally1.rallydev.com/#/300796297852ud/iterationstatus?detail=%2Fdefect%2F496785033300&fdp=true?fdp=true): Demo_An empty browser screen other than the CPDM Central icon in the tab is only shown when application is accessed on higher chrome versions(87+)
import { DeviceDetectorService,DeviceInfo } from 'ngx-device-detector';
import { map } from 'rxjs/operators';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { MatomoTracker } from 'ngx-matomo';
import { User } from '@cpdm-model/user.model';
import * as jwt_decode from 'jwt-decode';


interface AuthResponse {
  token: string,
  refreshToken: string,
  expiresIn: string
}


@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {
  private userRoleDetails: boolean;
  private device: DeviceInfo; /// vs54379


  //Authentication changes
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private deviceService: DeviceDetectorService, private matomoTracker: MatomoTracker) {
    // To get user operating system
    this.device = this.deviceService.getDeviceInfo();

    //Authentication changes
    const token=sessionStorage.getItem('token')
    this.currentUserSubject = new BehaviorSubject<User>(this.tokenDecoder(token));
    this.currentUser = this.currentUserSubject.asObservable();    

  }

  // Get logged in user details
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  // Get logged in user role
  public get userRole(): string {
    return this.currentUserSubject.value && this.currentUserSubject.value.role;
  }

  // Check whether logged-in user is 'admin' or not
  public get isAdminUser(): boolean {
    return this.currentUserSubject.value && this.currentUserSubject.value.isAdmin;
  }


  getUserDeviceInfo(): DeviceInfo {
    if (this.device != undefined) {
      return this.device;
    }
  }


  // Method to get current user from SSO
  getLoggedInUser(): Observable<any> {
    return this.http.get<any>(`${environment.uiUrl}/cecId`);
  }

  // Get user details by passing id
  getUserDetailsFromDirectory(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/v1/users/${userId.trim()}`);
  }

  // get mailer group by passing id
  getMailerGroup(mailer: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/api/v1/teams/${mailer.trim()}`);
  }


  // Method to get authenticated user
  isUserLoggedIn(): Boolean {
    let user;
    if (this.currentUserSubject.value != null) {
      user = this.currentUserSubject.value;
    }
    return !(user === null || user === undefined);
  }

  // Method to get logged in user cecID
  getLoggedInCecId(): string {
    if (this.isUserLoggedIn()) {
      const user = this.currentUserSubject.value;
      return user.cecId;
    }
  }

  // Method to get logged in user details
  get getLoggedInUserObject(): User {
    if (this.isUserLoggedIn()) {
      return this.currentUserSubject.value;
    }
  }

  // Get logged in user information from seesion storage
  getLoggedInUserName(): string {
    if (this.isUserLoggedIn()) {
      const user = this.currentUserSubject.value;
      return `Welcome, ${user.name}`;
    }
  }

  // Method to log out from current session
  logOut(): void {
    sessionStorage.removeItem('token');
  }

  
//Method to get list of user by role
  getUsersByRole(role): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/users/find/${role}`);
  }


  async searchUser(userName) {
    const listOfUsers = await this.http.get(`${environment.apiUrl}/api/v1/users/user-search/${userName}`)
      .pipe(
        debounceTime(500),  // WAIT FOR 500 MILISECONDS ATER EACH KEY STROKE.
        map(
          (data: any) => {
            return (
              data.length !== 0 ? data.data : []
            );
          }
        ));

    return listOfUsers;
  }

  async searchMailer(mailerName) {
    const listOfMailer = await this.http.get(`${environment.apiUrl}/api/v1/users/mailer-search/${mailerName}`)
      .pipe(
        debounceTime(500),  // WAIT FOR 500 MILISECONDS ATER EACH KEY STROKE.
        map(
          (data: any) => {
            return (
              data.length !== 0 ? data.data : []
            );
          }
        ));

    return listOfMailer;
  }


  //used to login and get JWT token for the requested user and also used when user switches between roles
  login(userId: string,role?:string) {

    //call login api to get Bearer Token
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/login`, {
      userId: userId,
      role:role
    }).pipe(
      catchError(errorRes => {
        return throwError(errorRes);
      }), tap(resData => {

        //Saving token details in session for future reference        
        sessionStorage.setItem('token', resData.token);

        //Decoding the Token
        this.currentUserSubject.next(this.tokenDecoder(resData.token));
        
        //Matomo changes to track logged in user
        this.matomoTracker.setUserId(this.currentUserSubject.value.cecId);
        this.matomoTracker.setDocumentTitle(this.currentUserSubject.value.name);
        this.matomoTracker.trackEvent('HomePage','Login',`role = ${this.userRole}`);


        //Update observable
        return JSON.stringify(this.currentUserSubject.value);
      })

    );
  }


  //Method used to decode the token
  tokenDecoder(token:string){
    if(!token){
    return null;
    }
    return jwt_decode(token);
  }


}
