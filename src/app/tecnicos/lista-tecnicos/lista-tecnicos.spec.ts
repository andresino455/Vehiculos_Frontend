import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTecnicos } from './lista-tecnicos';

describe('ListaTecnicos', () => {
  let component: ListaTecnicos;
  let fixture: ComponentFixture<ListaTecnicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTecnicos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaTecnicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
