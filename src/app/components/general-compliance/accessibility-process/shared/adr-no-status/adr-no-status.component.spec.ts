import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdrNoStatusComponent } from './adr-no-status.component';

xdescribe('AdrNoStatusComponent', () => {
  let component: AdrNoStatusComponent;
  let fixture: ComponentFixture<AdrNoStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdrNoStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdrNoStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
