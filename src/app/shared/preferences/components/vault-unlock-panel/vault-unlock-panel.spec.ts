import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { VaultUnlockPanel } from './vault-unlock-panel';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';

function createFakeVault(opts: { havePin?: boolean; havePasskey?: boolean; locked?: boolean }) {
  return {
    vaultStatus: signal(VAULT_STATUS.ENCRYPTED),
    haveUnlockKeyWithPin: signal(opts.havePin ?? true),
    haveUnlockKeyWithPasskey: signal(opts.havePasskey ?? false),
    isWebAuthnSupported: signal(true),
    isPinLockedOut: signal(opts.locked ?? false),
    pinLockoutRemainingMs: signal(0),
    pinAttemptsRemaining: signal(3),
    unlockWithPin: vi.fn().mockResolvedValue(true),
    unlockWithPasskey: vi.fn().mockResolvedValue(true),
    lockVault: vi.fn(),
    createVault: vi.fn(),
    createVaultWithPasskey: vi.fn(),
    changePin: vi.fn(),
  };
}

describe('VaultUnlockPanel', () => {
  async function setup(opts: { havePin?: boolean; havePasskey?: boolean; locked?: boolean }) {
    const fake = createFakeVault(opts);
    await TestBed.configureTestingModule({
      imports: [VaultUnlockPanel],
      providers: [{ provide: VaultSecurity, useValue: fake }],
    }).compileComponents();
    const fixture = TestBed.createComponent(VaultUnlockPanel);
    fixture.detectChanges();
    return { fixture, fake };
  }

  it('shows only passkey button when only passkey', async () => {
    const { fixture } = await setup({ havePin: false, havePasskey: true });
    const html = fixture.nativeElement.textContent;
    expect(html).toContain('Desbloquear con Passkey');
  });

  it('shows only PIN input when only pin', async () => {
    const { fixture } = await setup({ havePin: true, havePasskey: false });
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Ingresa tu PIN');
  });

  it('shows tabs when both available', async () => {
    const { fixture } = await setup({ havePin: true, havePasskey: true });
    expect(fixture.nativeElement.querySelector('.tabs')).toBeTruthy();
  });

  it('shows lockout alert when locked', async () => {
    const { fixture } = await setup({ havePin: true, locked: true });
    expect(fixture.nativeElement.textContent).toContain('Demasiados intentos');
  });

  it('calls unlockWithPin on form submit', async () => {
    const { fixture, fake } = await setup({ havePin: true, havePasskey: false });
    const component = fixture.componentInstance;
    component['pinForm'].controls.pin.setValue('12345');
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('ngSubmit'));
    await fixture.whenStable();
    expect(fake.unlockWithPin).toHaveBeenCalledWith('12345');
  });

  it('auto-submits PIN at 5 digits', async () => {
    const { fixture, fake } = await setup({ havePin: true, havePasskey: false });
    const component = fixture.componentInstance;
    component['pinForm'].controls.pin.setValue('12345');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fake.unlockWithPin).toHaveBeenCalledWith('12345');
  });
});
