import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TelemetryCompleteComponent } from './telemetry-complete.component';

xdescribe('TelemetryCompleteComponent', () => {
  let component: TelemetryCompleteComponent;
  let fixture: ComponentFixture<TelemetryCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelemetryCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelemetryCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
