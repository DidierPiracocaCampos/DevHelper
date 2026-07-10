import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { VaultSection } from './vault-section';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';

function createFakeVault(status: VAULT_STATUS) {
  return {
    vaultStatus: signal(status),
    haveUnlockKeyWithPin: signal(true),
    haveUnlockKeyWithPasskey: signal(false),
    isWebAuthnSupported: signal(true),
    isPinLockedOut: signal(false),
    pinLockoutRemainingMs: signal(0),
    pinAttemptsRemaining: signal(3),
    createVault: vi.fn().mockResolvedValue(true),
    createVaultWithPasskey: vi.fn().mockResolvedValue(true),
    unlockWithPin: vi.fn().mockResolvedValue(true),
    unlockWithPasskey: vi.fn().mockResolvedValue(true),
    lockVault: vi.fn(),
    changePin: vi.fn().mockResolvedValue(true),
  };
}

describe('VaultSection', () => {
  function setup(status: VAULT_STATUS) {
    const fake = createFakeVault(status);
    TestBed.configureTestingModule({
      imports: [VaultSection],
      providers: [{ provide: VaultSecurity, useValue: fake }],
    });
    const fixture = TestBed.createComponent(VaultSection);
    fixture.detectChanges();
    return { fixture, fake };
  }

  it('renders create panel when NO_CREATE', () => {
    const { fixture } = setup(VAULT_STATUS.NO_CREATE);
    expect(fixture.nativeElement.querySelector('vault-create-panel')).toBeTruthy();
  });

  it('renders unlock panel when ENCRYPTED', () => {
    const { fixture } = setup(VAULT_STATUS.ENCRYPTED);
    expect(fixture.nativeElement.querySelector('vault-unlock-panel')).toBeTruthy();
  });

  it('renders manage panel when DESENCRYPTED', () => {
    const { fixture } = setup(VAULT_STATUS.DESENCRYPTED);
    expect(fixture.nativeElement.querySelector('vault-manage-panel')).toBeTruthy();
  });
});
