import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcImplementPmComponent } from './crc-implement-pm.component';

describe('CrcImplementPmComponent', () => {
  let component: CrcImplementPmComponent;
  let fixture: ComponentFixture<CrcImplementPmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcImplementPmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcImplementPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
