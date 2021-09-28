import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdlCreateProjectModalComponent } from './csdl-create-project-modal.component';

describe('CsdlCreateProjectModalComponent', () => {
  let component: CsdlCreateProjectModalComponent;
  let fixture: ComponentFixture<CsdlCreateProjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsdlCreateProjectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlCreateProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
