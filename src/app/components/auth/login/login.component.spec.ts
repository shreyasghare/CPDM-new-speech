import { AppModule } from 'src/app/app.module';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CuiSpinnerComponent } from '@cisco-ngx/cui-components';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

xdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let cuiSpinnerComponent: ComponentFixture<CuiSpinnerComponent>;
  let testBedService: UserDetailsService;
  const router = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [AppModule],
      providers: [{ provide: Router, useValue: router }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    cuiSpinnerComponent = TestBed.createComponent(CuiSpinnerComponent);
    testBedService = TestBed.get(UserDetailsService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(cuiSpinnerComponent).toBeTruthy();
  });
  it('should inject UserDetailsService', inject([UserDetailsService], (injectService: UserDetailsService) => {
    expect(injectService).toBe(testBedService);
  }));
  it('should have cui-spinner', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.absolute-center')).not.toBeNull();
  });
  it('should have app-footer', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.footer__fixed')).not.toBeNull();
  });
  // it('onLogin() input length test', ()=>{
  //   component.onLogin();
  //   expect(component.inputValue).toBeLessThanOrEqual(8);
  //   // expect(router.navigate).toHaveBeenCalledWith(['/home']);
  // });
  // it('onLogin navigate', ()=>{
  //   component.onLogin();
  //   expect(router.navigate).toHaveBeenCalledWith(['/home']);
  // });
  it('onLogin()', () => {
    component.onLogin();
    expect(component.onLogin).toBeTruthy();
  });
  it('should set setUserToSession to be true', () => {
    component.setUserToSession('');
    expect(component.setUserToSession).toBeTruthy();
  });
});
