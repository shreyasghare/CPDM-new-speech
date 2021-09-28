import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommunicationsRegulatoryService } from './communications-regulatory.service';

describe('CommunicationsRegulatoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [CommunicationsRegulatoryService]
  }));

  it('should be created', () => {
    const service: CommunicationsRegulatoryService = TestBed.get(CommunicationsRegulatoryService);
    expect(service).toBeTruthy();
  });
});
