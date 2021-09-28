import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdlCreateComponent } from './csdl-create.component';

describe('CsdlCreateComponent', () => {
  let component: CsdlCreateComponent;
  let fixture: ComponentFixture<CsdlCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsdlCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdlCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
