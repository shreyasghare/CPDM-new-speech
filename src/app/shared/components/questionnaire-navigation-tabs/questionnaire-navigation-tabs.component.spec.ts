import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireNavigationTabsComponent } from './questionnaire-navigation-tabs.component';

xdescribe('QuestionnaireNavigationTabsComponent', () => {
  let component: QuestionnaireNavigationTabsComponent;
  let fixture: ComponentFixture<QuestionnaireNavigationTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnaireNavigationTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireNavigationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
