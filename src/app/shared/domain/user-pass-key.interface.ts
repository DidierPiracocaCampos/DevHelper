export interface PasskeyI {
    id: string;
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceName: string;
    createdAt: Date;
}