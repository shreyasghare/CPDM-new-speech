import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RclPidApproveComponent } from './rcl-pid-approve.component';

xdescribe('RclPidApproveComponent', () => {
  let component: RclPidApproveComponent;
  let fixture: ComponentFixture<RclPidApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RclPidApproveComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RclPidApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
