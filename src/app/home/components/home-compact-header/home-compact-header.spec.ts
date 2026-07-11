import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HomeCompactHeader } from './home-compact-header';
import { HomeActionsMenu } from '../home-actions-menu/home-actions-menu';
import { Authenticator } from '../../../shared/service/authenticator';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
  logout = vi.fn().mockResolvedValue(undefined);
}

describe('HomeCompactHeader', () => {
  let fixture: ComponentFixture<HomeCompactHeader>;
  let component: HomeCompactHeader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCompactHeader],
      providers: [{ provide: Authenticator, useValue: new FakeAuth() }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCompactHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the actions menu and the ai-assistant', () => {
    const actionsMenu = fixture.nativeElement.querySelector('home-actions-menu');
    const aiAssistant = fixture.nativeElement.querySelector('ai-assistant');
    expect(actionsMenu).toBeTruthy();
    expect(aiAssistant).toBeTruthy();
  });

  it('propagates vault, config and logout events from the actions menu', () => {
    const vaultSpy = vi.fn();
    const configSpy = vi.fn();
    const logoutSpy = vi.fn();
    component.vault.subscribe(vaultSpy);
    component.config.subscribe(configSpy);
    component.logout.subscribe(logoutSpy);

    const actionsMenu = fixture.debugElement.query(By.directive(HomeActionsMenu))
      .componentInstance as HomeActionsMenu;
    actionsMenu.isOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      'home-actions-menu ul li button',
    ) as NodeListOf<HTMLElement>;
    items[0].click();
    items[1].click();
    items[2].click();

    expect(vaultSpy).toHaveBeenCalledOnce();
    expect(configSpy).toHaveBeenCalledOnce();
    expect(logoutSpy).toHaveBeenCalledOnce();
  });
});
