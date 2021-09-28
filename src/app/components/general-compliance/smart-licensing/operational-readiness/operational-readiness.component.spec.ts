import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalReadinessComponent } from './operational-readiness.component';

xdescribe('OperationalReadinessComponent', () => {
  let component: OperationalReadinessComponent;
  let fixture: ComponentFixture<OperationalReadinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationalReadinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationalReadinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
