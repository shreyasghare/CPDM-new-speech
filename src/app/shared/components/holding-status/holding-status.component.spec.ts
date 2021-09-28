import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingStatusComponent } from './holding-status.component';

xdescribe('HoldingStatusComponent', () => {
  let component: HoldingStatusComponent;
  let fixture: ComponentFixture<HoldingStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
