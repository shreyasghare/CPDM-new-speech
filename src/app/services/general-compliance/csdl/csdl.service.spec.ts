import { TestBed } from '@angular/core/testing';

import { CsdlService } from './csdl.service';

describe('CsdlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CsdlService = TestBed.get(CsdlService);
    expect(service).toBeTruthy();
  });
});
