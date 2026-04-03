import { TestBed } from '@angular/core/testing';

import { Authenticator } from './authenticator';

describe('Authenticator', () => {
  let service: Authenticator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authenticator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
