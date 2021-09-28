import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CuiSpinnerModule } from '@cisco-ngx/cui-components';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';

import { CsdlProjectModalComponent } from './csdl-project-modal.component';
import { CuiSpinnerComponent } from '@cisco-ngx/cui-components';
import { of } from 'rxjs';

const confirmProjectDetailsStub = {
  confirmProjectDetails() {
    const response = { success: Boolean, data: {} };
    return of( response );
  },
  CsdlID() {
    const csdlID = '1234';
    return of(csdlID);
  }
};

const dialogMock = {
  close: () => {}
};

describe('CsdlProjectModalComponent', () => {
  let component: CsdlProjectModalComponent;
  let fixture: ComponentFixture<CsdlProjectModalComponent>;
  let cuiSpinnerComponent: ComponentFixture<CuiSpinnerComponent>;
  let data = { projectDetails: { project_id: String }, isDetailsConfirmed: Boolean }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        CuiSpinnerModule
      ],
      declarations: [ CsdlProjectModalComponent ],
      providers: [
        { 
          provide: CsdlService,
          useValue: confirmProjectDetailsStub
        },
        {
          provide: MatDialogRef,
          useValue: dialogMock
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlProjectModalComponent);
    cuiSpinnerComponent = TestBed.createComponent(CuiSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(cuiSpinnerComponent).toBeTruthy();
  });

  it('should confirm details', (async() => {
    component.confirmDetails();
    expect(component.showLoader).toBeFalsy();
  }));
  
  it('should close modal', () => {
    component.closeModal();
  });
});
