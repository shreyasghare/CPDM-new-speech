import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartLicensingComponent } from './smart-licensing.component';

xdescribe('SmartLicensingComponent', () => {
  let component: SmartLicensingComponent;
  let fixture: ComponentFixture<SmartLicensingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartLicensingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartLicensingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
