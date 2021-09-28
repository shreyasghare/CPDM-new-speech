import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TpsdCreateLinkComponent } from './tpsd-create-link.component';

describe('TpsdCreateLinkComponent', () => {
  let component: TpsdCreateLinkComponent;
  let fixture: ComponentFixture<TpsdCreateLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TpsdCreateLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TpsdCreateLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
