import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpicErrorComponent } from './epic-error.component';

xdescribe('EpicErrorComponent', () => {
  let component: EpicErrorComponent;
  let fixture: ComponentFixture<EpicErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpicErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpicErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
