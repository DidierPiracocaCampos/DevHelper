/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { VaultCreatePanel } from './vault-create-panel';
import { VaultSecurity } from '../../../security/vault-security';

describe('VaultCreatePanel', () => {
  let fixture: ComponentFixture<VaultCreatePanel>;
  let component: VaultCreatePanel;
  let fakeVault: any;

  beforeEach(async () => {
    fakeVault = {
      isWebAuthnSupported: signal(true),
      createVault: vi.fn().mockResolvedValue(true),
      createVaultWithPasskey: vi.fn().mockResolvedValue(true),
    };
    await TestBed.configureTestingModule({
      imports: [VaultCreatePanel],
      providers: [{ provide: VaultSecurity, useValue: fakeVault }],
    }).compileComponents();
    fixture = TestBed.createComponent(VaultCreatePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders tabs with Passkey and PIN labels', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('Passkey');
    expect(html).toContain('PIN');
  });

  it('shows WebAuthn unsupported alert when passkey not supported', () => {
    fakeVault.isWebAuthnSupported.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('no soporta');
  });

  it('calls createVaultWithPasskey on passkey button press', async () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="btn-passkey"]');
    btn.dispatchEvent(new Event('press'));
    expect(fakeVault.createVaultWithPasskey).toHaveBeenCalled();
  });

  it('calls createVault with PIN on form submit', async () => {
    // switch to PIN tab
    const pinRadio = fixture.nativeElement.querySelector('input[value="PIN"]');
    pinRadio.checked = true;
    pinRadio.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    // fill form
    (component as any).pinForm.controls.pin.setValue('12345');
    (component as any).pinForm.controls.verifyPin.setValue('12345');
    fixture.detectChanges();
    // submit
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('ngSubmit'));
    await fixture.whenStable();
    expect(fakeVault.createVault).toHaveBeenCalledWith('pin', '12345');
  });
});
