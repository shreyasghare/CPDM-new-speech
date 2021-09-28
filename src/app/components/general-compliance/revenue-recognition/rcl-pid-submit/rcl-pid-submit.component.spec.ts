import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RclPidSubmitComponent } from './rcl-pid-submit.component';

xdescribe('RclPidSubmitComponent', () => {
  let component: RclPidSubmitComponent;
  let fixture: ComponentFixture<RclPidSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RclPidSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RclPidSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
