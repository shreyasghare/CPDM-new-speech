import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdlComponent } from './csdl.component';

describe('CsdlComponent', () => {
  let component: CsdlComponent;
  let fixture: ComponentFixture<CsdlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsdlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
