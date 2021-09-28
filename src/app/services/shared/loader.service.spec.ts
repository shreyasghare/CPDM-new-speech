import { TestBed } from '@angular/core/testing';
import { LoaderService } from '@cpdm-service/shared/loader.service';

xdescribe('LoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoaderService = TestBed.get(LoaderService);
    expect(service).toBeTruthy();
  });
});
