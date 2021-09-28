import { TestBed } from '@angular/core/testing';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';

xdescribe('RevenueRecognitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RevenueRecognitionService = TestBed.get(RevenueRecognitionService);
    expect(service).toBeTruthy();
  });
});
