import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TpsdComponent } from './tpsd.component';

describe('TpsdComponent', () => {
  let component: TpsdComponent;
  let fixture: ComponentFixture<TpsdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TpsdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TpsdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
