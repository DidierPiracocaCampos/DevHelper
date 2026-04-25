export interface UnlockKeyI {
    id?:string;
    encryptedMasterKey: ArrayBuffer;
    salt?: Uint8Array;
    iv: Uint8Array;
    params: any;
}