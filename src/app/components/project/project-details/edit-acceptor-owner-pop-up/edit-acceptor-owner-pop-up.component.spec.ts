import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAcceptorOwnerPopUpComponent } from './edit-acceptor-owner-pop-up.component';

xdescribe('EditAcceptorOwnerPopUpComponent', () => {
  let component: EditAcceptorOwnerPopUpComponent;
  let fixture: ComponentFixture<EditAcceptorOwnerPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAcceptorOwnerPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAcceptorOwnerPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
