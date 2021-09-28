import { TestBed } from '@angular/core/testing';

import { ExportComplianceService } from './export-compliance.service';

describe('ExportComplianceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExportComplianceService = TestBed.get(ExportComplianceService);
    expect(service).toBeTruthy();
  });
});
