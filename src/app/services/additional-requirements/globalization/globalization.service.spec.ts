import { TestBed } from '@angular/core/testing';

import { GlobalizationService } from './globalization.service';

describe('GlobalizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalizationService = TestBed.get(GlobalizationService);
    expect(service).toBeTruthy();
  });
});
