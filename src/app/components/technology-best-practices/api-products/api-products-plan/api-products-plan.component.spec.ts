import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiProductsPlanComponent } from './api-products-plan.component';

xdescribe('ApiProductsPlanComponent', () => {
  let component: ApiProductsPlanComponent;
  let fixture: ComponentFixture<ApiProductsPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiProductsPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiProductsPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
