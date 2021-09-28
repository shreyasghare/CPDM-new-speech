import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TelemetryImplementComponent } from './telemetry-implement.component';

xdescribe('TelemetryImplementComponent', () => {
  let component: TelemetryImplementComponent;
  let fixture: ComponentFixture<TelemetryImplementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelemetryImplementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelemetryImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
