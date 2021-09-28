import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitConfirmationComponent } from './submit-confirmation.component';

xdescribe('SubmitConfirmationComponent', () => {
  let component: SubmitConfirmationComponent;
  let fixture: ComponentFixture<SubmitConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
