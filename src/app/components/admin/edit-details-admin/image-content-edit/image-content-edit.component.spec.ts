import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageContentEditComponent } from './image-content-edit.component';

xdescribe('ImageContentEditComponent', () => {
  let component: ImageContentEditComponent;
  let fixture: ComponentFixture<ImageContentEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageContentEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageContentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
