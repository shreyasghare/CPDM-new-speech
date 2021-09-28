import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTestingComponent } from './policy-testing.component';

xdescribe('PolicyTestingComponent', () => {
  let component: PolicyTestingComponent;
  let fixture: ComponentFixture<PolicyTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyTestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
