import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyADRsComponent } from './identify-adrs.component';

xdescribe('IdentifyADRsComponent', () => {
  let component: IdentifyADRsComponent;
  let fixture: ComponentFixture<IdentifyADRsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyADRsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyADRsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
