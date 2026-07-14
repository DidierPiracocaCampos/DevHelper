import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { HomeActionsMenu } from './home-actions-menu';

describe('HomeActionsMenu', () => {
  let fixture: ComponentFixture<HomeActionsMenu>;
  let component: HomeActionsMenu;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeActionsMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeActionsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the hamburger trigger and two items (vault is desktop-only)', () => {
    const trigger = fixture.nativeElement.querySelector(
      '[aria-label="Menú de acciones"]',
    ) as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-label')).toBe('Menú de acciones');

    component.isOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('ul li button') as NodeListOf<HTMLElement>;
    expect(items.length).toBe(2);
    expect(items[0].textContent?.trim()).toContain('Configuración');
    expect(items[1].textContent?.trim()).toContain('Cerrar sesión');
  });

  it('emits config on click', () => {
    const spy = vi.fn();
    component.config.subscribe(spy);
    component.isOpen.set(true);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul li button') as NodeListOf<HTMLElement>;
    items[0].click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('emits logout on click', () => {
    const spy = vi.fn();
    component.logout.subscribe(spy);
    component.isOpen.set(true);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul li button') as NodeListOf<HTMLElement>;
    items[1].click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('closes the menu when an item is clicked', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul li button') as NodeListOf<HTMLElement>;
    items[0].click();
    expect(component.isOpen()).toBe(false);
  });
});
