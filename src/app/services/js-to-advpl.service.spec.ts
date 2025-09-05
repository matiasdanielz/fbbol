import { TestBed } from '@angular/core/testing';

import { JsToAdvplService } from './js-to-advpl.service';

describe('JsToAdvplService', () => {
  let service: JsToAdvplService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsToAdvplService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
