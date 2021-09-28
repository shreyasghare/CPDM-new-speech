import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueRecognitionHelpComponent } from './revenue-recognition-help.component';

xdescribe('RevenueRecognitionHelpComponent', () => {
  let component: RevenueRecognitionHelpComponent;
  let fixture: ComponentFixture<RevenueRecognitionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenueRecognitionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueRecognitionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
