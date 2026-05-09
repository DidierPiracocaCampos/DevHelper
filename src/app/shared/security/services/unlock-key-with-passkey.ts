import { Injectable } from '@angular/core';
import { VAULT_ERRORS } from '../models/vault.model';
import { UnlockKeyI } from '../models/unlock-key.model';

@Injectable({
  providedIn: 'root',
})
export class UnlockKeyWithPasskey {

  async registerPasskeyAttestation(userId: string, userEmail?: string, userDisplayName?: string): Promise<ArrayBuffer> {
    if (!window.PublicKeyCredential) {
      throw new Error(VAULT_ERRORS.WEB_AUTHN_NOT_SUPPORTED);
    }

    try {
      const isSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isSupported) {
        throw new Error(VAULT_ERRORS.WEB_AUTHN_NOT_SUPPORTED);
      }
    } catch (error) {
      throw new Error(VAULT_ERRORS.WEB_AUTHN_NOT_SUPPORTED);
    }

    const createOptions: PublicKeyCredentialCreationOptions = {
      challenge: this.generateChallengeBuffer(),
      user: {
        id: new TextEncoder().encode(userId),
        name: userEmail || userId,
        displayName: userDisplayName || userEmail || userId
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

    try {
      const credential = await navigator.credentials.create({
        publicKey: createOptions
      }) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAttestationResponse;
      return response.clientDataJSON;
    } catch (error) {
      throw new Error(VAULT_ERRORS.PASSKEY_REGISTRATION_FAILED);
    }
  }

  async createUnlockKeyWithPasskey(
    attestation: ArrayBuffer,
    masterKey: ArrayBuffer
  ): Promise<UnlockKeyI> {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', attestation);

      const passkeyKey = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedMasterKey = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        passkeyKey,
        masterKey
      );

      return {
        encryptedMasterKey: new Uint8Array(encryptedMasterKey),
        iv,
        salt: undefined,
        params: {
          type: 'passkey'
        }
      };
    } catch (error) {
      throw new Error(VAULT_ERRORS.PASSKEY_CREATION_FAILED);
    }
  }

  async unlockMasterKeyWithPasskey(
    assertion: ArrayBuffer,
    unlockKey: UnlockKeyI
  ): Promise<ArrayBuffer> {
    if (!unlockKey.iv || !unlockKey.encryptedMasterKey) {
      throw new Error(VAULT_ERRORS.SALT_IS_MISSING);
    }

    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', assertion);
      const passkeyKey = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const rawMasterKey = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(unlockKey.iv)
        },
        passkeyKey,
        new Uint8Array(unlockKey.encryptedMasterKey)
      );

      return rawMasterKey;
    } catch (error) {
      throw new Error(VAULT_ERRORS.PASSKEY_UNLOCK_FAILED);
    }
  }

  async requestAssertion(): Promise<ArrayBuffer> {
    if (!window.PublicKeyCredential) {
      throw new Error(VAULT_ERRORS.WEB_AUTHN_NOT_SUPPORTED);
    }

    try {
      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge: this.generateChallengeBuffer(),
        timeout: 60000,
        userVerification: 'required',
        rpId: this.getRpId(),
      };

      const credential = await navigator.credentials.get({
        publicKey: getOptions
      }) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAssertionResponse;
      return response.clientDataJSON;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error(VAULT_ERRORS.PASSKEY_USER_VERIFICATION);
      }
      throw new Error(VAULT_ERRORS.PASSKEY_UNLOCK_FAILED);
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

}