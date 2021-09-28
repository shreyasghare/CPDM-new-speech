import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyAdrsConfirmationComponent } from './identify-adrs-confirmation.component';

xdescribe('IdentifyAdrsConfirmationComponent', () => {
  let component: IdentifyAdrsConfirmationComponent;
  let fixture: ComponentFixture<IdentifyAdrsConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyAdrsConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyAdrsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
