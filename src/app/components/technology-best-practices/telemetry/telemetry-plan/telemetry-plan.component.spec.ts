import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemetryPlanComponent } from './telemetry-plan.component';


xdescribe('PlanComponent', () => {
  let component: TelemetryPlanComponent;
  let fixture: ComponentFixture<TelemetryPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelemetryPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelemetryPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
