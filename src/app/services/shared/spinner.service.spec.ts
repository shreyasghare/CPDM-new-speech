import { TestBed } from '@angular/core/testing';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';

xdescribe('SpinnerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpinnerService = TestBed.get(SpinnerService);
    expect(service).toBeTruthy();
  });
});
