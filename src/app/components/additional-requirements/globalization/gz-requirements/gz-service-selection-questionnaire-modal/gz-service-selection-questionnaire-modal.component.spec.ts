import { async, ComponentFixture,TestBed} from '@angular/core/testing';
import { GzServiceSelectionQuestionnaireModalComponenet } from './gz-service-selection-questionnaire-modal.component';

describe('GzServiceSelectionQuestionnaireModalComponenet', () => {
  let component: GzServiceSelectionQuestionnaireModalComponenet;
  let fixture: ComponentFixture<GzServiceSelectionQuestionnaireModalComponenet>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GzServiceSelectionQuestionnaireModalComponenet ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GzServiceSelectionQuestionnaireModalComponenet);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });
});
