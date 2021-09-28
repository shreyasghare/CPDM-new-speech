import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceabilityTableModalComponent } from './serviceability-table-modal.component';

describe('ServiceabilityTableModalComponent', () => {
  let component: ServiceabilityTableModalComponent;
  let fixture: ComponentFixture<ServiceabilityTableModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceabilityTableModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceabilityTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  
});
