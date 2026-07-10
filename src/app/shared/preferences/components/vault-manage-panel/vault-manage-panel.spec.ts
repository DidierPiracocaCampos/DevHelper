/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { VaultManagePanel } from './vault-manage-panel';
import { VaultSecurity } from '../../../security/vault-security';

describe('VaultManagePanel', () => {
  let fixture: ComponentFixture<VaultManagePanel>;
  let component: VaultManagePanel;
  let fakeVault: any;

  beforeEach(async () => {
    fakeVault = {
      haveUnlockKeyWithPin: signal(true),
      haveUnlockKeyWithPasskey: signal(false),
      isWebAuthnSupported: signal(true),
      vaultStatus: signal(3),
      isPinLockedOut: signal(false),
      pinLockoutRemainingMs: signal(0),
      pinAttemptsRemaining: signal(3),
      changePin: vi.fn().mockResolvedValue(true),
      lockVault: vi.fn(),
      unlockWithPin: vi.fn(),
      unlockWithPasskey: vi.fn(),
      createVault: vi.fn(),
      createVaultWithPasskey: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [VaultManagePanel],
      providers: [{ provide: VaultSecurity, useValue: fakeVault }],
    }).compileComponents();
    fixture = TestBed.createComponent(VaultManagePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows unlocked status badge', () => {
    expect(fixture.nativeElement.textContent).toContain('desbloqueada');
  });

  it('lists configured unlock methods', () => {
    expect(fixture.nativeElement.textContent).toContain('PIN');
  });

  it('shows change PIN form when PIN configured', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('hides change PIN form when no PIN', () => {
    fakeVault.haveUnlockKeyWithPin.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeFalsy();
  });

  it('calls changePin on form submit', async () => {
    component['changePinForm'].controls.currentPin.setValue('11111');
    component['changePinForm'].controls.newPin.setValue('22222');
    component['changePinForm'].controls.confirmPin.setValue('22222');
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('ngSubmit'));
    await fixture.whenStable();
    expect(fakeVault.changePin).toHaveBeenCalledWith('11111', '22222');
  });

  it('calls lockVault on lock button press', () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="btn-lock"]');
    btn.dispatchEvent(new Event('press'));
    expect(fakeVault.lockVault).toHaveBeenCalled();
  });

  it('shows success alert after successful PIN change', async () => {
    component['changePinForm'].controls.currentPin.setValue('11111');
    component['changePinForm'].controls.newPin.setValue('22222');
    component['changePinForm'].controls.confirmPin.setValue('22222');
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('ngSubmit'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component['pinChanged']()).toBe(true);
  });
});
