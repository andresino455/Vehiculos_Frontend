import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionesPagos } from './calificaciones-pagos';

describe('CalificacionesPagos', () => {
  let component: CalificacionesPagos;
  let fixture: ComponentFixture<CalificacionesPagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionesPagos],
    }).compileComponents();

    fixture = TestBed.createComponent(CalificacionesPagos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
