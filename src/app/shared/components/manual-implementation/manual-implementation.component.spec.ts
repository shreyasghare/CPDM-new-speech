import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualImplementationComponent } from './manual-implementation.component';

xdescribe('ManualImplementationComponent', () => {
  let component: ManualImplementationComponent;
  let fixture: ComponentFixture<ManualImplementationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualImplementationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualImplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
