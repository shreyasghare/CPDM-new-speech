import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemetryTableModalComponent } from './telemetry-table-modal.component';


xdescribe('TableModalComponent', () => {
  let component: TelemetryTableModalComponent;
  let fixture: ComponentFixture<TelemetryTableModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelemetryTableModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelemetryTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
