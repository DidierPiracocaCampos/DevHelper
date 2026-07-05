import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { beforeEach, describe, it, expect } from 'vitest';
import { UiModal } from './ui-modal';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

@Component({
  imports: [UiModal],
  template: `
    <ui-modal [(isOpen)]="open" [fullscreen]="fullscreen" title="Test">
      <div body>regular body</div>
    </ui-modal>

    <ui-modal [(isOpen)]="openFs" [fullscreen]="true" title="Fullscreen">
      <nav sectionsNav>nav</nav>
      <div sectionsBody>body</div>
    </ui-modal>
  `,
})
class HostComponent {
  open = false;
  openFs = false;
  fullscreen = false;
}

describe('UiModal · fullscreen + section slots', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('does not apply is-fullscreen by default', () => {
    const box = fixture.nativeElement.querySelector('.modal-box');
    expect(box.classList.contains('is-fullscreen')).toBe(false);
  });

  it('applies is-fullscreen when fullscreen=true', () => {
    const fullscreenModal = fixture.nativeElement.querySelectorAll('ui-modal')[1];
    const box = fullscreenModal.querySelector('.modal-box');
    expect(box.classList.contains('is-fullscreen')).toBe(true);
  });

  it('renders [sectionsNav] and [sectionsBody] slots in fullscreen mode', () => {
    const fullscreenModal = fixture.nativeElement.querySelectorAll('ui-modal')[1];
    const nav = fullscreenModal.querySelector('.config-nav nav');
    const body = fullscreenModal.querySelector('.config-body > div');
    expect(nav?.textContent?.trim()).toBe('nav');
    expect(body?.textContent?.trim()).toBe('body');
  });

  it('does not render section layout when fullscreen=false', () => {
    const regularModal = fixture.nativeElement.querySelectorAll('ui-modal')[0];
    expect(regularModal.querySelector('.config-layout')).toBeNull();
  });
});

describe('UiModal · close button', () => {
  @Component({
    imports: [UiModal],
    selector: 'host-enclosing-form',
    template: `
      <form (submit)="onSubmit($event)">
        <ui-modal [(isOpen)]="open" title="Test">
          <div body>content</div>
        </ui-modal>
      </form>
    `,
  })
  class HostEnclosingForm {
    open = true;
    submitted = false;
    onSubmit(e: Event) {
      e.preventDefault();
      this.submitted = true;
    }
  }

  let fixture: ComponentFixture<HostEnclosingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostEnclosingForm],
    }).compileComponents();
    fixture = TestBed.createComponent(HostEnclosingForm);
    fixture.detectChanges();
  });

  it('X close button has type="button" (does not submit enclosing form)', () => {
    const closeBtn = fixture.nativeElement.querySelector('.modal-box .btn-circle');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute('type')).toBe('button');
  });

  it('clicking the X close button does NOT submit an enclosing form (regression: issue-detail save-on-close)', () => {
    const closeBtn = fixture.nativeElement.querySelector('.modal-box .btn-circle');
    closeBtn.click();
    expect(fixture.componentInstance.submitted).toBe(false);
  });
});
