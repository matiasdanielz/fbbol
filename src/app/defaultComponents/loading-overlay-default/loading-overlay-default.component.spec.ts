import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingOverlayDefaultComponent } from './loading-overlay-default.component';

describe('LoadingOverlayDefaultComponent', () => {
  let component: LoadingOverlayDefaultComponent;
  let fixture: ComponentFixture<LoadingOverlayDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingOverlayDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
