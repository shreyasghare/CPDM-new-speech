import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringResponseComponent } from './engineering-response.component';

xdescribe('EngineeringResponseComponent', () => {
  let component: EngineeringResponseComponent;
  let fixture: ComponentFixture<EngineeringResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngineeringResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineeringResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
