import { TestBed, async } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { Router } from '@angular/router';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { RouteGuardService } from './route-guard.service';
import { HttpClientModule } from '@angular/common/http';

xdescribe('RouteGuardService', () => {
  let routeGuard: RouteGuardService;
  let userService: UserDetailsService;

  const routeMock: any = { snapshot: {}};
  const routeStateMock: any = { snapshot: {}, url: '/cookies'};
  const routerMock = {navigate: jasmine.createSpy('navigate')};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [FormsModule, CommonModule, HttpClientModule],
        providers: [UserDetailsService, RouteGuardService, { provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}]
    }).compileComponents();
  }));

  beforeEach(() => {
    routeGuard = TestBed.get(RouteGuardService);
    userService = TestBed.get(UserDetailsService);
  });

  it('should be created', () => {
    const service: RouteGuardService = TestBed.get(RouteGuardService);
    expect(service).toBeTruthy();
  });

  it('should be able to hit route when user is logged in', () => {
    spyOn(userService, 'isUserLoggedIn').and.returnValue(true);
    expect(routeGuard.canActivate(routeMock, routeStateMock)).toEqual(true);
  });

  it('should redirect an unauthenticated user to the login route', () => {
    spyOn(userService, 'isUserLoggedIn').and.returnValue(false);
    expect(routeGuard.canActivate(routeMock, routeStateMock)).toEqual(false);
    // expect(routeMock.navigate).toHaveBeenCalledWith([""]);
  });
});
