import { TestBed } from '@angular/core/testing';
import { UtilsService } from '@cpdm-service/shared/utils.service';

xdescribe('UtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UtilsService = TestBed.get(UtilsService);
    expect(service).toBeTruthy();
  });
});
