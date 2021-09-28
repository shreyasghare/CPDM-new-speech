import { TestBed } from '@angular/core/testing';

import { SmartLicensingService } from './smart-licensing.service';

xdescribe('SmartLicensingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmartLicensingService = TestBed.get(SmartLicensingService);
    expect(service).toBeTruthy();
  });
});
