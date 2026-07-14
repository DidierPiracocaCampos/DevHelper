import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { UiConfigModal } from './ui-config-modal';
import { PreferencesService } from '../../services/preferences.service';
import { ConfirmService } from '../../../service/confirm.service';
import { NasaPictureResource } from '../../../../home/service/nasa-picture';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

class FakePrefs {
  resolvedUrl = { value: () => null as string | null, hasValue: () => false };
  hasCustomImage = signal(false);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
  aiSearcherEnabled = signal(false);
  setAiSearcherEnabled = vi.fn();
}

class FakeNasa {
  getPicture = () => ({ value: () => null, isLoading: () => false });
}

class FakeConfirm {
  delete = vi.fn().mockResolvedValue(true);
}

const fakeVault = {
  vaultStatus: () => VAULT_STATUS.ENCRYPTED,
  haveUnlockKeyWithPin: () => true,
  haveUnlockKeyWithPasskey: () => false,
  isWebAuthnSupported: () => true,
  isPinLockedOut: () => false,
  pinLockoutRemainingMs: () => 0,
  pinAttemptsRemaining: () => 3,
  unlockWithPin: vi.fn().mockResolvedValue(true),
  unlockWithPasskey: vi.fn().mockResolvedValue(true),
  lockVault: vi.fn(),
  createVault: vi.fn().mockResolvedValue(true),
  createVaultWithPasskey: vi.fn().mockResolvedValue(true),
  changePin: vi.fn().mockResolvedValue(true),
};

describe('UiConfigModal', () => {
  let fixture: ComponentFixture<UiConfigModal>;
  let component: UiConfigModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiConfigModal],
      providers: [
        { provide: PreferencesService, useClass: FakePrefs },
        { provide: ConfirmService, useClass: FakeConfirm },
        { provide: NasaPictureResource, useClass: FakeNasa },
        { provide: VaultSecurity, useValue: fakeVault },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UiConfigModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders fullscreen modal', () => {
    const box = fixture.nativeElement.querySelector('.modal-box');
    expect(box?.classList.contains('is-fullscreen')).toBe(true);
  });

  it('renders a nav with three section buttons', () => {
    const items = fixture.nativeElement.querySelectorAll('.config-nav li');
    expect(items.length).toBe(3);
  });

  it('defaults activeSection to vault', () => {
    expect(component['activeSection']()).toBe('vault');
  });

  it('renders vault-section panel by default', () => {
    expect(fixture.nativeElement.querySelector('vault-section')).toBeTruthy();
  });

  it('renders nasa-image-section when activeSection is nasa', () => {
    (component as unknown as { select: (id: string) => void }).select('nasa');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nasa-image-section')).toBeTruthy();
  });

  it('renders ai-searcher-section when activeSection is ai', () => {
    (component as unknown as { select: (id: string) => void }).select('ai');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ai-searcher-section')).toBeTruthy();
  });

  it('marks the active nav button with is-active class', () => {
    (component as unknown as { select: (id: string) => void }).select('ai');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.config-nav button');
    const aiButton = buttons[2];
    expect(aiButton.classList.contains('is-active')).toBe(true);
  });

  it('renders three tab buttons in the mobile nav', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
  });

  it('marks the active tab with tab-active class', () => {
    (component as unknown as { select: (id: string) => void }).select('nasa');
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    const nasaTab = tabs[1];
    expect(nasaTab.classList.contains('tab-active')).toBe(true);
  });

  it('switches active section when a mobile tab is clicked', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    (tabs[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component['activeSection']()).toBe('ai');
  });

  it('sets activeSection from initialSection on open', () => {
    fixture.componentRef.setInput('initialSection', 'nasa');
    component.isOpen.set(true);
    fixture.detectChanges();
    expect(component['activeSection']()).toBe('nasa');
  });

  it('isOpen is two-way bindable', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });

  it('captures and restores focus on open/close cycle', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const initial = document.activeElement;
    expect(initial).toBe(trigger);

    (component as unknown as { _captureFocus: () => void })._captureFocus();
    component.isOpen.set(true);
    fixture.detectChanges();

    (component as unknown as { _onOpenChange: (v: boolean) => void })._onOpenChange(false);
    await new Promise<void>((r) => queueMicrotask(() => r()));
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
