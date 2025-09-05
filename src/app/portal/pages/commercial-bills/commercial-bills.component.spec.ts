import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialBillsComponent } from './commercial-bills.component';

describe('CommercialBillsComponent', () => {
  let component: CommercialBillsComponent;
  let fixture: ComponentFixture<CommercialBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialBillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
