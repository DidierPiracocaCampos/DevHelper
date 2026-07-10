import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VaultSection } from './vault-section';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';
import { ConfirmService } from '../../../service/confirm.service';
import { ToastService } from '../../../service/toast';

function createFakeVault(
  status: VAULT_STATUS,
  overrides: Partial<{
    haveUnlockKeyWithPin: boolean;
    haveUnlockKeyWithPasskey: boolean;
  }> = {},
) {
  return {
    vaultStatus: signal(status),
    haveUnlockKeyWithPin: signal(overrides.haveUnlockKeyWithPin ?? true),
    haveUnlockKeyWithPasskey: signal(overrides.haveUnlockKeyWithPasskey ?? false),
    isWebAuthnSupported: signal(true),
    isPinLockedOut: signal(false),
    pinLockoutRemainingMs: signal(0),
    pinAttemptsRemaining: signal(3),
    createVault: vi.fn().mockResolvedValue(true),
    addPin: vi.fn().mockResolvedValue(true),
    addPasskey: vi.fn().mockResolvedValue(true),
    removePin: vi.fn().mockResolvedValue(true),
    removePasskey: vi.fn().mockResolvedValue(true),
    replacePasskey: vi.fn().mockResolvedValue(true),
    unlockWithPin: vi.fn().mockResolvedValue(true),
    unlockWithPasskey: vi.fn().mockResolvedValue(true),
    lockVault: vi.fn(),
    changePin: vi.fn().mockResolvedValue(true),
  };
}

class FakeConfirm {
  delete = vi.fn().mockResolvedValue(true);
  warning = vi.fn().mockResolvedValue(true);
  hardConfirm = vi.fn().mockResolvedValue(true);
  confirm = vi.fn().mockResolvedValue(true);
  info = vi.fn().mockResolvedValue(true);
}

class FakeToast {
  success = vi.fn();
  error = vi.fn();
  warning = vi.fn();
  info = vi.fn();
  show = vi.fn();
  dismiss = vi.fn();
  closeWithAnimation = vi.fn();
}

describe('VaultSection', () => {
  function setup(
    status: VAULT_STATUS,
    overrides: Partial<{
      haveUnlockKeyWithPin: boolean;
      haveUnlockKeyWithPasskey: boolean;
    }> = {},
  ) {
    const fake = createFakeVault(status, overrides);
    const confirm = new FakeConfirm();
    const toast = new FakeToast();
    TestBed.configureTestingModule({
      imports: [VaultSection],
      providers: [
        { provide: VaultSecurity, useValue: fake },
        { provide: ConfirmService, useValue: confirm },
        { provide: ToastService, useValue: toast },
      ],
    });
    const fixture = TestBed.createComponent(VaultSection);
    fixture.detectChanges();
    return { fixture, fake, confirm, toast };
  }

  describe('NO_CREATE state', () => {
    let fixture: ReturnType<typeof setup>['fixture'];

    beforeEach(() => {
      ({ fixture } = setup(VAULT_STATUS.NO_CREATE, {
        haveUnlockKeyWithPin: false,
        haveUnlockKeyWithPasskey: false,
      }));
    });

    it('renders the method tabs in create mode', () => {
      expect(fixture.nativeElement.querySelector('vault-method-tabs')).toBeTruthy();
    });

    it('shows a short description', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Protege tu Vault');
    });
  });

  describe('ENCRYPTED state', () => {
    let fixture: ReturnType<typeof setup>['fixture'];

    beforeEach(() => {
      ({ fixture } = setup(VAULT_STATUS.ENCRYPTED));
    });

    it('renders the method tabs in unlock mode', () => {
      expect(fixture.nativeElement.querySelector('vault-method-tabs')).toBeTruthy();
    });

    it('shows an unlock description', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Desbloquea tu Vault');
    });
  });

  describe('DESENCRYPTED state — single method (PIN only)', () => {
    let fixture: ReturnType<typeof setup>['fixture'];
    let fake: ReturnType<typeof setup>['fake'];
    let confirm: ReturnType<typeof setup>['confirm'];

    beforeEach(() => {
      ({ fixture, fake, confirm } = setup(VAULT_STATUS.DESENCRYPTED, {
        haveUnlockKeyWithPin: true,
        haveUnlockKeyWithPasskey: false,
      }));
    });

    it('renders the status card with Unlocked badge', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Desbloqueado');
    });

    it('renders the manage mode tabs', () => {
      const tabs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      expect(tabs.length).toBe(2);
    });

    it('shows the add passkey button in passkey tab', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="btn-add-passkey"]');
      expect(btn).toBeTruthy();
    });

    it('shows the change PIN form and remove button in PIN tab', () => {
      const remove = fixture.nativeElement.querySelector('[data-testid="btn-remove-pin"]');
      expect(remove).toBeTruthy();
    });

    it('renders the lock button', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="btn-lock"]');
      expect(btn).toBeTruthy();
    });

    it('calls lockVault on the service when the lock button is pressed', () => {
      const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
        '[data-testid="btn-lock"] button',
      );
      expect(btn).toBeTruthy();
      btn?.click();
      expect(fake.lockVault).toHaveBeenCalled();
    });

    it('uses a soft warning confirm when removing PIN while a passkey exists', async () => {
      fake.haveUnlockKeyWithPasskey.set(true);
      fixture.detectChanges();
      const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
        '[data-testid="btn-remove-pin"] button',
      );
      expect(btn).toBeTruthy();
      btn?.click();
      await fixture.whenStable();
      expect(confirm.warning).toHaveBeenCalled();
      expect(confirm.hardConfirm).not.toHaveBeenCalled();
      expect(fake.removePin).toHaveBeenCalled();
    });
  });

  describe('DESENCRYPTED state — both methods', () => {
    let fixture: ReturnType<typeof setup>['fixture'];
    let fake: ReturnType<typeof setup>['fake'];
    let confirm: ReturnType<typeof setup>['confirm'];

    beforeEach(() => {
      ({ fixture, fake, confirm } = setup(VAULT_STATUS.DESENCRYPTED, {
        haveUnlockKeyWithPin: true,
        haveUnlockKeyWithPasskey: true,
      }));
    });

    it('shows the replace passkey button', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="btn-replace-passkey"]');
      expect(btn).toBeTruthy();
    });

    it('uses a soft warning confirm when removing the passkey', async () => {
      const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
        '[data-testid="btn-remove-passkey"] button',
      );
      expect(btn).toBeTruthy();
      btn?.click();
      await fixture.whenStable();
      expect(confirm.warning).toHaveBeenCalled();
      expect(confirm.hardConfirm).not.toHaveBeenCalled();
      expect(fake.removePasskey).toHaveBeenCalled();
    });

    it('uses a soft warning confirm when replacing the passkey', async () => {
      const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
        '[data-testid="btn-replace-passkey"] button',
      );
      expect(btn).toBeTruthy();
      btn?.click();
      await fixture.whenStable();
      expect(confirm.warning).toHaveBeenCalled();
      expect(fake.replacePasskey).toHaveBeenCalled();
    });

    it('does not show the add passkey button when passkey exists', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="btn-add-passkey"]');
      expect(btn).toBeFalsy();
    });

    it('does not show the add PIN button when PIN exists', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="btn-add-pin"]');
      expect(btn).toBeFalsy();
    });
  });

  describe('DESENCRYPTED state — last method (passkey only)', () => {
    let fixture: ReturnType<typeof setup>['fixture'];
    let fake: ReturnType<typeof setup>['fake'];
    let confirm: ReturnType<typeof setup>['confirm'];

    beforeEach(() => {
      ({ fixture, fake, confirm } = setup(VAULT_STATUS.DESENCRYPTED, {
        haveUnlockKeyWithPin: false,
        haveUnlockKeyWithPasskey: true,
      }));
    });

    it('uses a hard confirm with phrase when removing the last method', async () => {
      const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
        '[data-testid="btn-remove-passkey"] button',
      );
      expect(btn).toBeTruthy();
      btn?.click();
      await fixture.whenStable();
      expect(confirm.hardConfirm).toHaveBeenCalled();
      expect(confirm.warning).not.toHaveBeenCalled();
      expect(fake.removePasskey).toHaveBeenCalled();
    });
  });

  describe('LOADING state', () => {
    it('renders a loading spinner', () => {
      const { fixture } = setup(VAULT_STATUS.LOADING);
      expect(fixture.nativeElement.querySelector('.loading-spinner')).toBeTruthy();
    });
  });
});
