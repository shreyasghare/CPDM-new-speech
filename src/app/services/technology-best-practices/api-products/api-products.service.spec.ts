import { TestBed } from '@angular/core/testing';

import { ApiProductsService } from './api-products.service';

xdescribe('ApiProductsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiProductsService = TestBed.get(ApiProductsService);
    expect(service).toBeTruthy();
  });
});
