export interface UnlockKeyI {
    id?:string;
    encryptedMasterKey: Uint8Array;
    salt?: Uint8Array;
    iv: Uint8Array;
    params: any;
}