import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiProductsCompleteComponent } from './api-products-complete.component';

xdescribe('ApiProductsCompleteComponent', () => {
  let component: ApiProductsCompleteComponent;
  let fixture: ComponentFixture<ApiProductsCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiProductsCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiProductsCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
