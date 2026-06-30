import { Timestamp } from '@angular/fire/firestore';

export interface EncryptedData {
  cipher: number[];
  iv: number[];
}

export interface PasswordI {
  id?: string;
  name: string;
  password: EncryptedData;
  secure: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
