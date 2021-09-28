import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartLicensingHelpComponent } from './smart-licensing-help.component';

xdescribe('SmartLicensingHelpComponent', () => {
  let component: SmartLicensingHelpComponent;
  let fixture: ComponentFixture<SmartLicensingHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartLicensingHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartLicensingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
