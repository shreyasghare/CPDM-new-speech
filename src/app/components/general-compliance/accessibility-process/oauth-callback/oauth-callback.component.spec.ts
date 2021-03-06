import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OauthCallbackComponent } from './oauth-callback.component';

xdescribe('OauthCallbackComponent', () => {
  let component: OauthCallbackComponent;
  let fixture: ComponentFixture<OauthCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OauthCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OauthCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
