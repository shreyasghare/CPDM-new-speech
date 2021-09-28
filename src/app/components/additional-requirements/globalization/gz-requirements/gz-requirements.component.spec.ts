import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GzRequirementsComponent } from './gz-requirements.component';

describe('GzRequirementsComponent', () => {
  let component: GzRequirementsComponent;
  let fixture: ComponentFixture<GzRequirementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GzRequirementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GzRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
