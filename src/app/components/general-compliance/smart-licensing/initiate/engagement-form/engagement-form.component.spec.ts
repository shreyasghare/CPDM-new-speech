import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementFormComponent } from './engagement-form.component';

xdescribe('EngagementFormComponent', () => {
  let component: EngagementFormComponent;
  let fixture: ComponentFixture<EngagementFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngagementFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
