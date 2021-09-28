import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcLinkGenerateComponent } from './ec-link-generate.component';

describe('EcLinkGenerateComponent', () => {
  let component: EcLinkGenerateComponent;
  let fixture: ComponentFixture<EcLinkGenerateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcLinkGenerateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcLinkGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
