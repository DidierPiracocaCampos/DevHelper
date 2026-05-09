export interface EncryptedVaultKeyI {
    cipher: number[];
    iv: number[];
    salt: number[];
}

export interface UserVaultI {
    id?: string;
    encryptedVaultKeyWithPin?: EncryptedVaultKeyI;
    encryptedVaultKeyWithPasskey?: EncryptedVaultKeyI;
    createdAt: number;
}