import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleReviewListComponent } from './single-review-list.component';

xdescribe('SingleReviewListComponent', () => {
  let component: SingleReviewListComponent;
  let fixture: ComponentFixture<SingleReviewListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleReviewListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
