import { TestBed } from '@angular/core/testing';

import { AccessibilityProcessService } from './accessibility-process.service';

xdescribe('AccessibilityProcessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccessibilityProcessService = TestBed.get(AccessibilityProcessService);
    expect(service).toBeTruthy();
  });
});
