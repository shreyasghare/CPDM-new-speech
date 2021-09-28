import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdlPlanExecuteComponent } from './csdl-plan-execute.component';

describe('CsdlPlanExecuteComponent', () => {
  let component: CsdlPlanExecuteComponent;
  let fixture: ComponentFixture<CsdlPlanExecuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsdlPlanExecuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlPlanExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
