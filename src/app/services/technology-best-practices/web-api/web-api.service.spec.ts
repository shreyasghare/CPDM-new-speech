import { TestBed } from '@angular/core/testing';

import { WebApiService } from './web-api.service';

xdescribe('WebApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebApiService = TestBed.get(WebApiService);
    expect(service).toBeTruthy();
  });
});
