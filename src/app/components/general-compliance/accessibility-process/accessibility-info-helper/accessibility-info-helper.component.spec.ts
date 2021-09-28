import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityInfoHelperComponent } from './accessibility-info-helper.component';

xdescribe('AccessibilityInfoHelperComponent', () => {
  let component: AccessibilityInfoHelperComponent;
  let fixture: ComponentFixture<AccessibilityInfoHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessibilityInfoHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityInfoHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
