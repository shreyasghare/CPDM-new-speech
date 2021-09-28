import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from '@cpdm-service/interceptor/global-error-handler.service';

xdescribe('GlobalErrorHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalErrorHandler = TestBed.get(GlobalErrorHandler);
    expect(service).toBeTruthy();
  });
});
