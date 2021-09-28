import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TpsdCompleteComponent } from './tpsd-complete.component';

describe('TpsdCompleteComponent', () => {
  let component: TpsdCompleteComponent;
  let fixture: ComponentFixture<TpsdCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TpsdCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TpsdCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
