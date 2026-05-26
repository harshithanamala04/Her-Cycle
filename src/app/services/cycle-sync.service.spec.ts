import { TestBed } from '@angular/core/testing';

import { CycleSyncService } from './cycle-sync.service';

describe('CycleSyncService', () => {
  let service: CycleSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CycleSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
