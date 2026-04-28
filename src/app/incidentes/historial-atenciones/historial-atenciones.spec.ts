import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialAtenciones } from './historial-atenciones';

describe('HistorialAtenciones', () => {
  let component: HistorialAtenciones;
  let fixture: ComponentFixture<HistorialAtenciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialAtenciones],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialAtenciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
