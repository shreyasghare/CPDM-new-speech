import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcImplementComponent } from './crc-implement.component';

describe('CrcImplementComponent', () => {
  let component: CrcImplementComponent;
  let fixture: ComponentFixture<CrcImplementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcImplementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
