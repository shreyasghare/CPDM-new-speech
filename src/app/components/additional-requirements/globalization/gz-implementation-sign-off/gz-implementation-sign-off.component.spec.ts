import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GzImplementationSignOffComponent } from './gz-implementation-sign-off.component';

describe('GzImplementationSignOffComponent', () => {
  let component: GzImplementationSignOffComponent;
  let fixture: ComponentFixture<GzImplementationSignOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GzImplementationSignOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GzImplementationSignOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
