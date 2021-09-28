import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcIdentifyComponent } from './crc-identify.component';

describe('CrcIdentifyComponent', () => {
  let component: CrcIdentifyComponent;
  let fixture: ComponentFixture<CrcIdentifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcIdentifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
