import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GzCompleteComponent } from './gz-complete.component';

describe('GzCompleteComponent', () => {
  let component: GzCompleteComponent;
  let fixture: ComponentFixture<GzCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GzCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GzCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
