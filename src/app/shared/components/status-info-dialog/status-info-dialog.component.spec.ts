import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusInfoDialogComponent } from './status-info-dialog.component';

xdescribe('CommonDialogComponent', () => {
  let component: StatusInfoDialogComponent;
  let fixture: ComponentFixture<StatusInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
