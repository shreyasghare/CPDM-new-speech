import { TestBed } from '@angular/core/testing';
import { ToastService } from '@cpdm-service/shared/toast.service';

xdescribe('ToastService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToastService = TestBed.get(ToastService);
    expect(service).toBeTruthy();
  });
});
