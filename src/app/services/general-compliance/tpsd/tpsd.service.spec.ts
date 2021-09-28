import { TestBed } from '@angular/core/testing';

import { TpsdService } from './tpsd.service';

describe('TpsdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TpsdService = TestBed.get(TpsdService);
    expect(service).toBeTruthy();
  });
});
