import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IPv6PlanComponent } from './ipv6-plan.component';

xdescribe('IPv6PlanComponent', () => {
  let component: IPv6PlanComponent;
  let fixture: ComponentFixture<IPv6PlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IPv6PlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IPv6PlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
