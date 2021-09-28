import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcIdentifyPoComponent } from './crc-identify-po.component';

describe('CrcIdentifyPoComponent', () => {
  let component: CrcIdentifyPoComponent;
  let fixture: ComponentFixture<CrcIdentifyPoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcIdentifyPoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcIdentifyPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
