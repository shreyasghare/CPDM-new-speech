import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdrCommentComponent } from './adr-comment.component';

xdescribe('AdrCommentComponent', () => {
  let component: AdrCommentComponent;
  let fixture: ComponentFixture<AdrCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdrCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdrCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
