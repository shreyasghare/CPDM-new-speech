import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoHelperNewComponent } from './info-helper-new.component';

xdescribe('InfoHelperNewComponent', () => {
  let component: InfoHelperNewComponent;
  let fixture: ComponentFixture<InfoHelperNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoHelperNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoHelperNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
