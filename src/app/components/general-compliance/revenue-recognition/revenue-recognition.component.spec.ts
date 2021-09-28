import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueRecognitionComponent } from './revenue-recognition.component';

xdescribe('RevenueRecognitionComponent', () => {
  let component: RevenueRecognitionComponent;
  let fixture: ComponentFixture<RevenueRecognitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenueRecognitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
