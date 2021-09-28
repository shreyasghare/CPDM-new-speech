import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceItemsTableComponent } from './compliance-items-table.component';

xdescribe('ComplianceItemsTableComponent', () => {
  let component: ComplianceItemsTableComponent;
  let fixture: ComponentFixture<ComplianceItemsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceItemsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceItemsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
