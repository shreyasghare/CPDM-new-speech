import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomToastComponent } from './custom-toast.component';

xdescribe('CustomToastComponent', () => {
  let component: CustomToastComponent;
  let fixture: ComponentFixture<CustomToastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomToastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
