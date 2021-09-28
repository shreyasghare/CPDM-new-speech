import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDropzoneComponent } from './custom-dropzone.component';

xdescribe('CustomDropzoneComponent', () => {
  let component: CustomDropzoneComponent;
  let fixture: ComponentFixture<CustomDropzoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDropzoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
