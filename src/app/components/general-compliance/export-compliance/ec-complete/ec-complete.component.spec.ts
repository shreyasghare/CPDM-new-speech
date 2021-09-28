import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcCompleteComponent } from './ec-complete.component';

describe('EcCompleteComponent', () => {
  let component: EcCompleteComponent;
  let fixture: ComponentFixture<EcCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
