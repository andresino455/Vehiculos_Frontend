import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleIncidente } from './detalle-incidente';

describe('DetalleIncidente', () => {
  let component: DetalleIncidente;
  let fixture: ComponentFixture<DetalleIncidente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleIncidente],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleIncidente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
