import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaIncidentes } from './lista-incidentes';

describe('ListaIncidentes', () => {
  let component: ListaIncidentes;
  let fixture: ComponentFixture<ListaIncidentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaIncidentes],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaIncidentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
