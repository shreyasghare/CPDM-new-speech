import { async, ComponentFixture,TestBed, inject} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { CrcAssessmentQuestionaireModalComponent } from './crc-assessment-questionaire-modal.component';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CrcAssessmentQuestionaireModalComponent', () => {
  let component: CrcAssessmentQuestionaireModalComponent;
  let fixture: ComponentFixture<CrcAssessmentQuestionaireModalComponent>;
  const dialogMock = {
    close: () => { }
  };

  const mockQuestion = {
    questionNumber: 1,
    question: {
        text: 'Question 1',
        html: '<p>Question 1</p>',
    },
    options: [],
    comment: [],
    answer:{
        value: 'Yes',
        comment:[{
            text:'Sample text'
        }],
        isQuestionAnswered:true
    },
    isRequired: true,
  }
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcAssessmentQuestionaireModalComponent ],
      imports: [ HttpClientTestingModule,ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [ CommunicationsRegulatoryService, UserDetailsService,{ provide: MatDialogRef, useValue: dialogMock }, { provide: MAT_DIALOG_DATA, useValue: {} }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcAssessmentQuestionaireModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCrcDetails() on init method',()=>{
    spyOn(component,'getCrcDetails').and.callThrough();
    component.ngOnInit();
    expect(component.getCrcDetails).toHaveBeenCalled()
  })

  it('should get questionnaire data from the service', async(inject( [CommunicationsRegulatoryService], ( CommunicationsRegulatoryService ) => {
    return CommunicationsRegulatoryService.getCrcQuestionnaire().toPromise().then( (result) => {         
      expect(result.length).toBeGreaterThan(0);
    });
  })));

  it('should get updated questionnaire data from the service', async(inject( [CommunicationsRegulatoryService], ( CommunicationsRegulatoryService ) => {
    return CommunicationsRegulatoryService.getUpdatedCrcQuestionnaire().toPromise().then( (result) => {         
      expect(result.length).toBeGreaterThan(0);
    });
  })));

  it('update questionnaire object to the service', async(inject( [CommunicationsRegulatoryService], ( CommunicationsRegulatoryService ) => {
    return CommunicationsRegulatoryService.updateQuestionnaireObject().toPromise().then( (result) => {         
      expect(result.length).toBeGreaterThan(0);
    });
  })));

  it('should call the updateCrcQuestionnaireYes() method',() => {
    spyOn(component, 'updateCrcQuestionnaireYes');
    component.updateCrcQuestionnaireYes();
    expect(component.updateCrcQuestionnaireYes).toHaveBeenCalled();  
  });

  it('should call the updateCrcQuestionnaireNo() method',() => {
    spyOn(component, 'updateCrcQuestionnaireNo');
    component.updateCrcQuestionnaireNo();
    expect(component.updateCrcQuestionnaireNo).toHaveBeenCalled();  
  });

  it('should call the setQuestionnaireData() method',() => {
    spyOn(component, 'setQuestionnaireData');
    const mockRadioValue = 'Yes'
    component.setQuestionnaireData(mockQuestion,mockRadioValue);
    expect(component.setQuestionnaireData).toHaveBeenCalled();  
  });

  it('should call the onChangeComment() method',() => {
    spyOn(component, 'onChangeComment');
    const event = { target: { value: 'input text' }};
    component.onChangeComment(mockQuestion,event);
    expect(component.onChangeComment).toHaveBeenCalled();  
  });

  it('should call the updateAnswerInArray() method',() => {
    spyOn(component, 'updateAnswerInArray');
    const mockAnswerObj = { 
      questionId: '123',
      questionNumber: 1,
      answer: {
        value: 'Yes',
        comment: [{
            text: 'input value'
        }],
        isQuestionAnswered: true,
        isRadioButton: false
      },
    }
    component.updateAnswerInArray(mockAnswerObj);
    expect(component.updateAnswerInArray).toHaveBeenCalled();  
  });

  it('should call the getRemainingQuestionCount() method',() => {
    spyOn(component, 'getRemainingQuestionCount');
    component.getRemainingQuestionCount();
    expect(component.getRemainingQuestionCount).toHaveBeenCalled();  
  });

  it('should bind the crcQuestionnaireStatus',() => {
    const testValue = 'All 8 questions are answered';
    expect(component.crcQuestionnaireStatus).toBeDefined(testValue);  
  });

  it('should call saveQuationnaireList function', async(() => {
    spyOn(component, 'saveQuationnaireList');
    fixture.detectChanges();
    let button = fixture.debugElement.nativeElement.querySelector('#onSave');
    button.click();
    fixture.detectChanges();
    expect(component.saveQuationnaireList).toHaveBeenCalled();
  }));

  it('should call closeModal function', async(() => {
    spyOn(component, 'closeModal');
    fixture.detectChanges();
    let button = fixture.debugElement.nativeElement.querySelector('#onCancel');
    button.click();
    fixture.detectChanges();
    expect(component.closeModal).toHaveBeenCalled();
  }));

  it('should call the closeModal() method',() => {
    spyOn(component, 'closeModal');
    component.closeModal();
    expect(component.closeModal).toHaveBeenCalled();  
  });

});
