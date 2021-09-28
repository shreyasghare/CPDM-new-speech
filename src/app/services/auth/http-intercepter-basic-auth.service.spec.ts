// import { TestBed } from '@angular/core/testing';
// import { HttpClientModule } from '@angular/common/http';
// import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
// import { HttpIntercepterBasicAuthService } from '@cpdm-service--auth/http-intercepter-basic-auth.service';
// import { HttpTestingController } from '@angular/common/http/testing';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';

// xdescribe('HttpIntercepterBasicAuthService', () => {
//     let service: UserDetailsService;
//     let httpMock: HttpTestingController;
//     beforeEach(() => TestBed.configureTestingModule({
//       imports: [HttpClientModule],
//       providers: [UserDetailsService, {provide: HTTP_INTERCEPTORS, useClass: HttpIntercepterBasicAuthService, multi: true}]
//   }));
// //   service = TestBed.get(UserDetailsService);
// //   httpMock = TestBed.get(HttpTestingController);

//     it('should be created', () => {
//     const service: HttpIntercepterBasicAuthService = TestBed.get(HttpIntercepterBasicAuthService);
//     expect(service).toBeTruthy();
//   });
// //   it('should add an authorization header', () =>{
// //     let res = service.getLoggedInCecId();
// //     expect(res).toBeTruthy();
// //   });
// });
