import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcImplementPoComponent } from './crc-implement-po.component';

describe('CrcImplementPoComponent', () => {
  let component: CrcImplementPoComponent;
  let fixture: ComponentFixture<CrcImplementPoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcImplementPoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcImplementPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
