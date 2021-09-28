import { TestBed } from '@angular/core/testing';

import { DocCentralService } from './doc-central.service';

xdescribe('DocCentralService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocCentralService = TestBed.get(DocCentralService);
    expect(service).toBeTruthy();
  });
});
