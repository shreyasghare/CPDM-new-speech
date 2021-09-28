import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcIdentifyPmComponent } from './crc-identify-pm.component';

describe('CrcIdentifyPmComponent', () => {
  let component: CrcIdentifyPmComponent;
  let fixture: ComponentFixture<CrcIdentifyPmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcIdentifyPmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcIdentifyPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
