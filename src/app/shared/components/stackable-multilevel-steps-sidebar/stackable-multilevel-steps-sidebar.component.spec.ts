import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackableMultilevelStepsSidebarComponent } from './stackable-multilevel-steps-sidebar.component';

xdescribe('StackableMultilevelStepsSidebarComponent', () => {
  let component: StackableMultilevelStepsSidebarComponent;
  let fixture: ComponentFixture<StackableMultilevelStepsSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackableMultilevelStepsSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackableMultilevelStepsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
