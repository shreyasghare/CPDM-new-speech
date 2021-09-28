import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageComplianceItemComponent } from './manage-compliance-item.component';

xdescribe('ManageComplianceItemComponent', () => {
  let component: ManageComplianceItemComponent;
  let fixture: ComponentFixture<ManageComplianceItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageComplianceItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageComplianceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
