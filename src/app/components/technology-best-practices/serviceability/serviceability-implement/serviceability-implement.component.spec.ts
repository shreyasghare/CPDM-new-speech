import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceabilityImplementComponent } from './serviceability-implement.component';

describe('ServiceabilityImplementComponent', () => {
  let component: ServiceabilityImplementComponent;
  let fixture: ComponentFixture<ServiceabilityImplementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceabilityImplementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceabilityImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

 
});
