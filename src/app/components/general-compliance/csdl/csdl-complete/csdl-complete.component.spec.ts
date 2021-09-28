import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { CsdlCompleteComponent } from './csdl-complete.component';

describe('CsdlCompleteComponent', () => {
  let component: CsdlCompleteComponent;
  let fixture: ComponentFixture<CsdlCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      declarations: [ CsdlCompleteComponent ],
      providers: [
        CsdlService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                params: {
                  id: '1234'
                }
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    expect(component.csdlId).toEqual('1234');
  });

  it('should switch to sidebar step', () => {
    component.switchToSideBarStep('plan_execute');
  });
});
