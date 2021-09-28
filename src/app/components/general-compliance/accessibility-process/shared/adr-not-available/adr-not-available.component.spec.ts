import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdrNotAvailableComponent } from './adr-not-available.component';

xdescribe('AdrNotAvailableComponent', () => {
  let component: AdrNotAvailableComponent;
  let fixture: ComponentFixture<AdrNotAvailableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdrNotAvailableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdrNotAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
