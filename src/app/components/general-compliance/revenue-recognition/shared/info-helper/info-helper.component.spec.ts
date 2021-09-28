import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoHelperComponent } from './info-helper.component';

xdescribe('InfoHelperComponent', () => {
  let component: InfoHelperComponent;
  let fixture: ComponentFixture<InfoHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
