import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentQuestionnairePopupComponent } from './assessment-questionnaire-popup.component';

xdescribe('AssessmentQuestionnairePopupComponent', () => {
  let component: AssessmentQuestionnairePopupComponent;
  let fixture: ComponentFixture<AssessmentQuestionnairePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentQuestionnairePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentQuestionnairePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
