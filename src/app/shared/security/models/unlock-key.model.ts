export type UnlockKeyParams = { iterations: number; type: 'pin' } | { type: 'passkey' };

export interface UnlockKeyI {
  id?: string;
  encryptedMasterKey: Uint8Array;
  salt?: Uint8Array;
  iv: Uint8Array;
  params: UnlockKeyParams;
  credentialId?: string;
}
