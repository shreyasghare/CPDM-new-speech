import { TestBed } from '@angular/core/testing';

import { VoiceRecognitionService } from './voice-recognition.service';

describe('VoiceRecognitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VoiceRecognitionService = TestBed.get(VoiceRecognitionService);
    expect(service).toBeTruthy();
  });
});
