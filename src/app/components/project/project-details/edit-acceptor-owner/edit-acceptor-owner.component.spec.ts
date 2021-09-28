import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAcceptorOwnerComponent } from './edit-acceptor-owner.component';

xdescribe('EditAcceptorOwnerComponent', () => {
  let component: EditAcceptorOwnerComponent;
  let fixture: ComponentFixture<EditAcceptorOwnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAcceptorOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAcceptorOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
