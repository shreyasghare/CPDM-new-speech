import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalizationComponent } from './globalization.component';

describe('GlobalizationComponent', () => {
  let component: GlobalizationComponent;
  let fixture: ComponentFixture<GlobalizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
