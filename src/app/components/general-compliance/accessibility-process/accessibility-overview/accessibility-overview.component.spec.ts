import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityOverviewComponent } from './accessibility-overview.component';

xdescribe('AccessibilityOverviewComponent', () => {
  let component: AccessibilityOverviewComponent;
  let fixture: ComponentFixture<AccessibilityOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessibilityOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
