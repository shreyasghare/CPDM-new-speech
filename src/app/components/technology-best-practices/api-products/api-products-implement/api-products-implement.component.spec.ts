import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiProductsImplementComponent } from './api-products-implement.component';

xdescribe('ApiProductsImplementComponent', () => {
  let component: ApiProductsImplementComponent;
  let fixture: ComponentFixture<ApiProductsImplementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiProductsImplementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiProductsImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
