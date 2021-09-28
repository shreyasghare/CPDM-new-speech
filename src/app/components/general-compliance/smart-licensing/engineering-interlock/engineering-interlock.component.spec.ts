import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringInterlockComponent } from './engineering-interlock.component';

xdescribe('EngineeringInterlockComponent', () => {
  let component: EngineeringInterlockComponent;
  let fixture: ComponentFixture<EngineeringInterlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngineeringInterlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineeringInterlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
