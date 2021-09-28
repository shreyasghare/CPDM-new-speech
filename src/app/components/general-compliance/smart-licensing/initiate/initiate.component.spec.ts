import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiateComponent } from './initiate.component';

xdescribe('InitiateComponent', () => {
  let component: InitiateComponent;
  let fixture: ComponentFixture<InitiateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitiateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
