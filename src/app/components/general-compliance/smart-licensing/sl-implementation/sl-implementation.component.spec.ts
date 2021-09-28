import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlImplementationComponent } from './sl-implementation.component';

xdescribe('SlImplementationComponent', () => {
  let component: SlImplementationComponent;
  let fixture: ComponentFixture<SlImplementationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlImplementationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlImplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
