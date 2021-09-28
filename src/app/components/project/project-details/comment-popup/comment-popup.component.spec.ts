import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPopupComponent } from './comment-popup.component';

xdescribe('CommentPopupComponent', () => {
  let component: CommentPopupComponent;
  let fixture: ComponentFixture<CommentPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
