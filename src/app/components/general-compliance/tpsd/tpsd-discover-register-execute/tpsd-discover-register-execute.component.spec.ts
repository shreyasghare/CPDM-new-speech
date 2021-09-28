import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TpsdDiscoverRegisterExecuteComponent } from './tpsd-discover-register-execute.component';

describe('TpsdDiscoverRegisterExecuteComponent', () => {
  let component: TpsdDiscoverRegisterExecuteComponent;
  let fixture: ComponentFixture<TpsdDiscoverRegisterExecuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TpsdDiscoverRegisterExecuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TpsdDiscoverRegisterExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
