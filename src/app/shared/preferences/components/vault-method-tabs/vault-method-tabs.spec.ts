import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VaultMethodTabs } from './vault-method-tabs';

describe('VaultMethodTabs', () => {
  let fixture: ComponentFixture<VaultMethodTabs>;
  let component: VaultMethodTabs;

  const setup = (mode: 'create' | 'unlock' | 'manage', havePin = false, havePasskey = false) => {
    TestBed.configureTestingModule({
      imports: [VaultMethodTabs],
    });
    fixture = TestBed.createComponent(VaultMethodTabs);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('havePin', havePin);
    fixture.componentRef.setInput('havePasskey', havePasskey);
    fixture.detectChanges();
  };

  describe('create mode', () => {
    beforeEach(() => setup('create'));

    it('renders Passkey and PIN tabs', () => {
      const tabs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      expect(tabs.length).toBe(2);
      expect(tabs[0].value).toBe('PASSKEY');
      expect(tabs[1].value).toBe('PIN');
    });

    it('shows unsupported alert when WebAuthn is not supported', () => {
      fixture.componentRef.setInput('isWebAuthnSupported', false);
      fixture.detectChanges();
      const alert = fixture.nativeElement.querySelector('ui-alert');
      expect(alert).toBeTruthy();
    });

    it('emits registerPasskey when passkey button is pressed', () => {
      const spy = vi.fn();
      component.registerPasskey.subscribe(spy);
      fixture.componentRef.setInput('isWebAuthnSupported', true);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('ui-button');
      buttons[0].querySelector('button').click();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('unlock mode', () => {
    it('shows only passkey button when only passkey is available', () => {
      setup('unlock', false, true);
      const passkeyButton = fixture.nativeElement.querySelector('ui-button');
      expect(passkeyButton).toBeTruthy();
    });

    it('shows only PIN form when only PIN is available', () => {
      setup('unlock', true, false);
      const pinField = fixture.nativeElement.querySelector('ui-pin-field');
      expect(pinField).toBeTruthy();
    });

    it('shows both tabs when both methods are available', () => {
      setup('unlock', true, true);
      const tabs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      expect(tabs.length).toBe(2);
    });

    it('emits unlockWithPasskey when passkey button is pressed', () => {
      setup('unlock', true, true);
      const spy = vi.fn();
      component.unlockWithPasskey.subscribe(spy);
      const passkeyButton = fixture.nativeElement.querySelector('ui-button');
      passkeyButton.querySelector('button').click();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('manage mode', () => {
    it('always renders both tabs regardless of method presence', () => {
      setup('manage', false, false);
      const tabs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      expect(tabs.length).toBe(2);
      expect(tabs[0].value).toBe('PASSKEY');
      expect(tabs[1].value).toBe('PIN');
    });

    describe('passkey tab', () => {
      it('shows "add passkey" button when no passkey exists', () => {
        setup('manage', false, false);
        const btn = fixture.nativeElement.querySelector('[data-testid="btn-add-passkey"]');
        expect(btn).toBeTruthy();
      });

      it('emits addPasskey when "add passkey" is pressed', () => {
        setup('manage', false, false);
        const spy = vi.fn();
        component.addPasskey.subscribe(spy);
        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
          '[data-testid="btn-add-passkey"] button',
        );
        expect(btn).toBeTruthy();
        btn?.click();
        expect(spy).toHaveBeenCalled();
      });

      it('shows "replace" and "remove" buttons when passkey exists', () => {
        setup('manage', false, true);
        expect(
          fixture.nativeElement.querySelector('[data-testid="btn-replace-passkey"]'),
        ).toBeTruthy();
        expect(
          fixture.nativeElement.querySelector('[data-testid="btn-remove-passkey"]'),
        ).toBeTruthy();
      });

      it('emits replacePasskey when "replace" is pressed', () => {
        setup('manage', false, true);
        const spy = vi.fn();
        component.replacePasskey.subscribe(spy);
        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
          '[data-testid="btn-replace-passkey"] button',
        );
        btn?.click();
        expect(spy).toHaveBeenCalled();
      });

      it('emits removePasskey when "remove" is pressed', () => {
        setup('manage', false, true);
        const spy = vi.fn();
        component.removePasskey.subscribe(spy);
        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
          '[data-testid="btn-remove-passkey"] button',
        );
        btn?.click();
        expect(spy).toHaveBeenCalled();
      });

      it('shows unsupported alert when WebAuthn is not supported', () => {
        setup('manage', false, false);
        fixture.componentRef.setInput('isWebAuthnSupported', false);
        fixture.detectChanges();
        const alert = fixture.nativeElement.querySelector('ui-alert');
        expect(alert).toBeTruthy();
      });
    });

    describe('pin tab', () => {
      it('shows the "add PIN" form when no PIN exists', () => {
        setup('manage', false, false);
        const btn = fixture.nativeElement.querySelector('[data-testid="btn-add-pin"]');
        expect(btn).toBeTruthy();
      });

      it('emits addPin with the new pin when submitted', () => {
        setup('manage', false, false);
        const spy = vi.fn();
        component.addPin.subscribe(spy);
        const pinFields = fixture.nativeElement.querySelectorAll('ui-pin-field');
        const setAll = (field: Element, val: string) => {
          const inputs = field.querySelectorAll('input');
          let v = val;
          for (const i of inputs) {
            i.value = v[0] ?? '';
            i.dispatchEvent(new Event('input', { bubbles: true }));
            v = v.slice(1);
          }
        };
        setAll(pinFields[0], '11111');
        setAll(pinFields[1], '11111');
        fixture.detectChanges();
        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
          '[data-testid="btn-add-pin"] button',
        );
        expect(btn).toBeTruthy();
        btn?.click();
        expect(spy).toHaveBeenCalled();
      });

      it('shows the change form with "remove" button when PIN exists', () => {
        setup('manage', true, false);
        expect(fixture.nativeElement.querySelector('[data-testid="btn-remove-pin"]')).toBeTruthy();
        const pinFields = fixture.nativeElement.querySelectorAll('ui-pin-field');
        expect(pinFields.length).toBe(3);
      });

      it('emits removePin when "remove" is pressed', () => {
        setup('manage', true, false);
        const spy = vi.fn();
        component.removePin.subscribe(spy);
        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
          '[data-testid="btn-remove-pin"] button',
        );
        btn?.click();
        expect(spy).toHaveBeenCalled();
      });

      it('emits changePin with current+new when change form is submitted', () => {
        setup('manage', true, false);
        const spy = vi.fn();
        component.changePin.subscribe(spy);
        const pinFields = fixture.nativeElement.querySelectorAll('ui-pin-field');
        const setAll = (field: Element, val: string) => {
          const inputs = field.querySelectorAll('input');
          for (const i of inputs) {
            i.value = val[0] ?? '';
            i.dispatchEvent(new Event('input', { bubbles: true }));
            val = val.slice(1);
          }
        };
        setAll(pinFields[0], '11111');
        setAll(pinFields[1], '22222');
        setAll(pinFields[2], '22222');
        fixture.detectChanges();
        const buttons = Array.from(
          fixture.nativeElement.querySelectorAll('ui-button'),
        ) as Element[];
        const submit = buttons.find((b) => b.textContent?.includes('Cambiar PIN'));
        expect(submit).toBeTruthy();
        (submit as HTMLElement).querySelector('button')?.click();
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
