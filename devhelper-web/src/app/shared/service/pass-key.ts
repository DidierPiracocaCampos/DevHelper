import { Injectable, signal } from '@angular/core';
import { FirestoreDataConverter } from 'firebase/firestore';
import { BaseRepository } from './repository-base';
import { PasskeyI } from '../domain/user-pass-key.interface';
import { firstValueFrom } from 'rxjs';

/*TODO: 
refactor simplificando y 
obtener todo lo replicable de aqui y agregarlo al sistema de security
*/
@Injectable({
  providedIn: 'root',
})
export class PassKeyService extends BaseRepository<PasskeyI> {

  private readonly VAULT_KEY = 'vault_session';
  private readonly VAULT_DURATION_MS = 1 * 60 * 1000;
  private vaultTimeout?: ReturnType<typeof setTimeout>;
  protected override path: [string, ...string[]] = ['passkey'];
  private mapper = {
    toFirestore: (data: PasskeyI) => {
      const { id, ...rest } = data;
      return {
        ...rest,
        createdAt: data.createdAt || new Date()
      };
    },

    fromFirestore: (snap: any): PasskeyI => {
      const data = snap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate()
      };
    },

    toServerCredential: (cred: PublicKeyCredential) => {
      const response = cred.response as AuthenticatorAttestationResponse;

      return {
        id: cred.id,
        rawId: this.bufferToBase64(cred.rawId),
        type: cred.type,
        response: {
          attestationObject: this.bufferToBase64(response.attestationObject),
          clientDataJSON: this.bufferToBase64(response.clientDataJSON)
        }
      };
    },

    toServerAssertion: (assertion: PublicKeyCredential) => {
      const response = assertion.response as AuthenticatorAssertionResponse;

      return {
        id: assertion.id,
        rawId: this.bufferToBase64(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: this.bufferToBase64(response.authenticatorData),
          clientDataJSON: this.bufferToBase64(response.clientDataJSON),
          signature: this.bufferToBase64(response.signature),
          userHandle: response.userHandle
            ? this.bufferToBase64(response.userHandle)
            : null
        }
      };
    }
  };

  protected override converter: FirestoreDataConverter<PasskeyI> = {
    toFirestore: this.mapper.toFirestore,
    fromFirestore: this.mapper.fromFirestore
  };

  isUnlocked = signal(this.isVaultUnlocked());

  async registerPasskey() {
    const supported = await this.isWebAuthnSupported();
    if (!supported) {
      throw new Error('WebAuthn not supported in this browser');
    }

    const user = await this._auth.userPromise();
    if (!user) {
      return;
    }
    const createOptions: PublicKeyCredentialCreationOptions = {
      challenge: this.generateChallengeBuffer(),
      user: {
        id: new TextEncoder().encode(user.uid),
        name: user.email || user.uid || '',
        displayName: user.displayName || user.email || 'Usuario'
      },
      rp: {
        name: "DevHelper",
        id: this.getRpId()
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform'
      }
    };

    const credential = await navigator.credentials.create({
      publicKey: createOptions
    }) as PublicKeyCredential;

    const passkey = this.mapper.toServerCredential(credential);

    const entity: PasskeyI = {
      id: '', // lo genera Firestore
      credentialId: credential.id,
      publicKey: passkey.rawId,
      counter: 0,
      deviceName: navigator.userAgent,
      createdAt: new Date()
    };
    return await firstValueFrom(this.create(entity));
  }

  async authenticate() {
    if (this.isVaultUnlocked()) {
      return {
        verified: true,
        passkey: null,
        assertion: null,
        cached: true
      };
    }
    const stored = await firstValueFrom(this.getAll());
    const getOptions: PublicKeyCredentialRequestOptions = {
      challenge: this.generateChallengeBuffer(),
      timeout: 60000,
      userVerification: 'required',
      rpId: this.getRpId(),
      allowCredentials: stored.map(cred => ({
        id: this.base64ToBuffer(this.normalizeBase64(cred.credentialId)),
        type: 'public-key'
      }))
    };
    const assertion = await navigator.credentials.get({
      publicKey: getOptions
    }) as PublicKeyCredential;
    const result = this.mapper.toServerAssertion(assertion);
    const match = stored.find(p => p.credentialId === result.id);
    if (!match) {
      throw new Error('Unauthorized device');
    }
    this.unlockVault();
    return {
      verified: true,
      passkey: match,
      assertion: result,
      cached: false
    };
  }

  private async hasPasskeys(): Promise<boolean> {
    const stored = await firstValueFrom(this.getAll());
    return !!stored && stored.length > 0;
  }

  private async isPlatformAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  async shouldRegisterPasskey(): Promise<boolean> {
    const hasServerPasskeys = await this.hasPasskeys();
    const hasPlatform = await this.isPlatformAvailable();
    return hasPlatform && !hasServerPasskeys;
  }

  async isWebAuthnSupported(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    try {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  private unlockVault() {
    const expiresAt = Date.now() + this.VAULT_DURATION_MS;
    const session = {
      unlocked: true,
      expiresAt
    };

    sessionStorage.setItem(this.VAULT_KEY, JSON.stringify(session));
    this.isUnlocked.set(true);
    this.scheduleAutoLock(expiresAt);
  }

  lockVault() {
    this.isUnlocked.set(false);
    sessionStorage.removeItem(this.VAULT_KEY);
    if (this.vaultTimeout) {
      clearTimeout(this.vaultTimeout);
    }
  }

  private scheduleAutoLock(expiresAt: number) {
    if (this.vaultTimeout) {
      clearTimeout(this.vaultTimeout);
    }

    const remainingTime = expiresAt - Date.now();

    if (remainingTime <= 0) {
      this.lockVault();
      return;
    }

    this.vaultTimeout = setTimeout(() => {
      this.lockVault();
    }, remainingTime);
  }

  private isVaultUnlocked(): boolean {
    const raw = sessionStorage.getItem(this.VAULT_KEY);
    if (!raw) return false;

    try {
      const session = JSON.parse(raw);

      if (Date.now() > session.expiresAt) {
        this.lockVault();
        return false;
      }

      return session.unlocked === true;
    } catch {
      return false;
    }
  }

  private generateChallengeBuffer(): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(32)).buffer;
  }

  private getRpId(): string {
    return window.location.hostname.includes('localhost')
      ? 'localhost'
      : window.location.hostname;
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private normalizeBase64(base64: string): string {
    return base64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  }

}