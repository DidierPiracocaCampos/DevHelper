import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi } from 'vitest';
import { WelcomeAiModal } from './welcome-ai-modal';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

describe('WelcomeAiModal', () => {
  let fixture: ComponentFixture<WelcomeAiModal>;
  let component: WelcomeAiModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeAiModal],
    }).compileComponents();
    fixture = TestBed.createComponent(WelcomeAiModal);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits accept when user clicks Activar', () => {
    const acceptSpy = vi.fn();
    component.accept.subscribe(acceptSpy);
    component.acceptAction();
    expect(acceptSpy).toHaveBeenCalledOnce();
  });

  it('emits dismiss when user clicks Ahora no', () => {
    const dismissSpy = vi.fn();
    component.dismiss.subscribe(dismissSpy);
    component.dismissAction();
    expect(dismissSpy).toHaveBeenCalledOnce();
  });

  it('emits dismiss when UiModal isOpenChange fires with false', () => {
    const dismissSpy = vi.fn();
    component.dismiss.subscribe(dismissSpy);
    component.onOpenChange(false);
    expect(dismissSpy).toHaveBeenCalledOnce();
  });

  it('does not emit dismiss when isOpenChange fires with true (opening)', () => {
    const dismissSpy = vi.fn();
    component.dismiss.subscribe(dismissSpy);
    component.onOpenChange(true);
    expect(dismissSpy).not.toHaveBeenCalled();
  });
});
