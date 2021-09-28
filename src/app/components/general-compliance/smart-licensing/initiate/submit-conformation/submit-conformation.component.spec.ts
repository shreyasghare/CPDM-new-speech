import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitConformationComponent } from './submit-conformation.component';

xdescribe('SubmitConformationComponent', () => {
  let component: SubmitConformationComponent;
  let fixture: ComponentFixture<SubmitConformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitConformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitConformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
