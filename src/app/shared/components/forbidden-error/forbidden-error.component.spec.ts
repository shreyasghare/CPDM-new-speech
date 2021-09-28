import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForbiddenErrorComponent } from './forbidden-error.component';

xdescribe('ForbiddenErrorComponent', () => {
  let component: ForbiddenErrorComponent;
  let fixture: ComponentFixture<ForbiddenErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForbiddenErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForbiddenErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
