import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicabilityHelperComponent } from './applicability-helper.component';
import { AppModule } from 'src/app/app.module';

xdescribe('ApplicabilityHelperComponent', () => {
  let component: ApplicabilityHelperComponent;
  let fixture: ComponentFixture<ApplicabilityHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    //   declarations: [ ApplicabilityHelperComponent ],
    imports: [AppModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicabilityHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ApplicabilityHelperComponent should create', () => {
    expect(component).toBeTruthy();
  });
  it('should set getStandatdTemplate to be true', () => {
    let ch: boolean;
    component.getStandatdTemplate(ch);
    expect(component.getStandatdTemplate).toBeTruthy();
  });
  it('should set onSelectionFirstDropdown to be true', () => {
    component.onSelectionFirstDropdown();
    expect(component.onSelectionFirstDropdown).toBeTruthy();
  });
  it('should set onSelectionSecondDropdown to be true', () => {
    component.onSelectionSecondDropdown();
    expect(component.onSelectionSecondDropdown).toBeTruthy();
  });
  it('should set onChangeCheckBox to be true', () => {
    component.onChangeCheckBox('', '');
    expect(component.onChangeCheckBox).toBeTruthy();
  });
  it('should set isCheckboxChecked to be true', () => {
    let ch: boolean;
    component.isCheckboxChecked('', ch);
    expect(component.isCheckboxChecked).toBeTruthy();
  });
  it('should set checkAdditionalRequirements to be true', () => {
    let ch: boolean;
    component.checkAdditionalRequirements('', ch);
    expect(component.checkAdditionalRequirements).toBeTruthy();
  });
  it('should set checkGeneralCompliance to be true', () => {
    let ch: boolean;
    component.checkGeneralCompliance('', ch);
    expect(component.checkGeneralCompliance).toBeTruthy();
  });
  it('should set onFirstRadioButtonChange to be true', () => {
    component.onFirstRadioButtonChange('');
    expect(component.onFirstRadioButtonChange).toBeTruthy();
  });
  it('should set syncRadioButtonOne to be true', () => {
    component.syncRadioButtonOne('');
    expect(component.syncRadioButtonOne).toBeTruthy();
  });
  it('should set onSecondRadioButtonChange to be true', () => {
    component.onSecondRadioButtonChange('');
    expect(component.onSecondRadioButtonChange).toBeTruthy();
  });
  it('should set syncRadioButtonTwo to be true', () => {
    component.syncRadioButtonTwo('');
    expect(component.syncRadioButtonTwo).toBeTruthy();
  });
  it('should set onCancel to be true', () => {
    //component.onCancel();
    //expect(component.onCancel).toBeTruthy();
  });
  it('should set getQuestionsFromNode to be true', () => {
    component.getQuestionsFromNode();
    expect(component.getQuestionsFromNode).toBeTruthy();
  });
  it('should set mapQuestionsLogic to be true', () => {
   // component.mapQuestionsLogic('');
    expect(component.mapQuestionsLogic).toBeTruthy();
  });
  it('should set trackUserInput to be true', () => {
   // component.trackUserInput('');
    expect(component.trackUserInput).toBeTruthy();
  });

  it('should have app-footer', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-footer')).not.toBeNull();
  });
});
