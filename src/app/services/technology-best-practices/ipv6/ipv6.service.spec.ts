import { TestBed } from '@angular/core/testing';

import { IPv6Service } from './ipv6.service';

xdescribe('IPv6Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IPv6Service = TestBed.get(IPv6Service);
    expect(service).toBeTruthy();
  });
});
