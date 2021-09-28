import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcSubmitAssignClassifyComponent } from './ec-submit-assign-classify.component';

describe('EcSubmitAssignClassifyComponent', () => {
  let component: EcSubmitAssignClassifyComponent;
  let fixture: ComponentFixture<EcSubmitAssignClassifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcSubmitAssignClassifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcSubmitAssignClassifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
