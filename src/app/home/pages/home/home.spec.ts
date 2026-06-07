import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import Home from './home';
import { VaultSecurity } from '../../../shared/security';
import { Authenticator } from '../../../shared/service/authenticator';
import { FileUploadService } from '../../../shared/files';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

class FakeVault {
  openUnlockVaultModal = vi.fn();
}

class FakeAuth {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
  logout = vi.fn().mockResolvedValue(undefined);
}

class FakeUpload {
  upload = vi.fn();
  deleteFile = vi.fn();
  getDownloadUrl = vi.fn();
}

class FakePrefsService {
  preferences = {
    value: () => ({ id: 'singleton' as const }),
    hasValue: () => true,
    reload: vi.fn(),
  };
  resolvedUrl = { value: () => null as string | null, hasValue: () => false };
  hasCustomImage = signal(false);
  customNasaImageUrl = signal(null as string | null);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let vault: FakeVault;
  let auth: FakeAuth;

  beforeEach(async () => {
    vault = new FakeVault();
    auth = new FakeAuth();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VaultSecurity, useValue: vault },
        { provide: Authenticator, useValue: auth },
        { provide: FileUploadService, useValue: new FakeUpload() },
        { provide: PreferencesService, useValue: new FakePrefsService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openVault delegates to vault.openUnlockVaultModal', () => {
    component.openVault();
    expect(vault.openUnlockVaultModal).toHaveBeenCalled();
  });

  it('openConfig sets isConfigOpen to true', () => {
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(false);
    component.openConfig();
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(true);
  });
});
