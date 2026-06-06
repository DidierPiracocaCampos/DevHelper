/**
 * Firestore rules integration tests.
 *
 * These tests require the Firestore emulator to be running.
 * Run them with:
 *   pnpm test:rules:firestore
 *
 * When the emulator is not available, the suite is skipped (no failures in CI).
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';

const FIRESTORE_EMULATOR_HOST = process.env['FIRESTORE_EMULATOR_HOST'];

const skip = !FIRESTORE_EMULATOR_HOST;

(skip ? describe.skip : describe)('firestore.rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-devhelper-rules-test',
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              function isAuthenticated() { return request.auth != null; }
              function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
              function isNonEmptyString(value) { return value is string && value.size() > 0; }
              function isBoundedString(value, maxLen) { return value is string && value.size() <= maxLen; }
              function isTimestamp(value) { return value is timestamp; }
              function isPositiveInt(value) { return value is int && value >= 0; }
              function isUnchanged(field) { return request.resource.data[field] == resource.data[field]; }

              match /users/{userId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isNonEmptyString(request.resource.data.email)
                              && isBoundedString(request.resource.data.email, 320)
                              && isTimestamp(request.resource.data.createdAt)
                              && request.resource.data.keys().hasOnly(['email','createdAt','displayName','photoURL']);
                allow update: if isOwner(userId)
                              && isUnchanged('createdAt')
                              && isBoundedString(request.resource.data.email, 320)
                              && isTimestamp(request.resource.data.createdAt)
                              && request.resource.data.keys().hasOnly(['email','createdAt','displayName','photoURL']);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/passwords/{passwordId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.title, 200)
                              && isBoundedString(request.resource.data.password, 1024)
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && request.resource.data.keys().hasOnly(['title','username','password','url','notes','createdAt','updatedAt']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.title, 200)
                              && isBoundedString(request.resource.data.password, 1024)
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && isUnchanged('createdAt')
                              && request.resource.data.keys().hasOnly(['title','username','password','url','notes','createdAt','updatedAt']);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/vault/{vaultDocId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.encryptedMasterKey, 4096)
                              && isBoundedString(request.resource.data.iv, 256)
                              && request.resource.data.keys().hasOnly(['encryptedMasterKey','iv','salt','params']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.encryptedMasterKey, 4096)
                              && isBoundedString(request.resource.data.iv, 256)
                              && isUnchanged('iv')
                              && request.resource.data.keys().hasOnly(['encryptedMasterKey','iv','salt','params']);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/files/{fileId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 255)
                              && isPositiveInt(request.resource.data.size)
                              && isBoundedString(request.resource.data.type, 100)
                              && isBoundedString(request.resource.data.storagePath, 512)
                              && isPositiveInt(request.resource.data.uploadedAt)
                              && request.resource.data.storagePath.matches('^users/' + userId + '/files/.+')
                              && request.resource.data.keys().hasOnly(['name','size','type','storagePath','uploadedAt']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 255)
                              && isPositiveInt(request.resource.data.size)
                              && isBoundedString(request.resource.data.type, 100)
                              && isUnchanged('storagePath')
                              && isUnchanged('uploadedAt')
                              && isUnchanged('size')
                              && request.resource.data.storagePath.matches('^users/' + userId + '/files/.+')
                              && request.resource.data.keys().hasOnly(['name','size','type','storagePath','uploadedAt']);
                allow delete: if isOwner(userId);
              }

              match /{document=**} {
                allow read, write: if false;
              }
            }
          }
        `,
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  afterEach(async () => {
    await testEnv?.clearFirestore();
  });

  describe('users/{userId} (profile)', () => {
    it('owner can read, create, update, delete their own profile', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const profileRef = doc(alice.firestore(), 'users/alice');

      await assertSucceeds(
        setDoc(profileRef, { email: 'alice@example.com', createdAt: Timestamp.now() }),
      );
      await assertSucceeds(getDoc(profileRef));
      await assertSucceeds(
        updateDoc(profileRef, { email: 'alice2@example.com', displayName: 'Alice' }),
      );
      await assertSucceeds(deleteDoc(profileRef));
    });

    it('other user cannot read or write the profile', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users/alice', 'profile'), {
          email: 'alice@example.com',
          createdAt: Timestamp.now(),
        });
      });

      const bob = testEnv.authenticatedContext('bob');
      const bobProfile = doc(bob.firestore(), 'users/alice');
      const aliceProfile = doc(bob.firestore(), 'users/bob');

      await assertFails(getDoc(bobProfile));
      await assertFails(
        setDoc(aliceProfile, { email: 'bob@example.com', createdAt: Timestamp.now() }),
      );
    });

    it('create rejects when email is missing or wrong type', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const profileRef = doc(alice.firestore(), 'users/alice');

      await assertFails(setDoc(profileRef, { createdAt: Timestamp.now() }));
      await assertFails(setDoc(profileRef, { email: 123, createdAt: Timestamp.now() }));
      await assertFails(
        setDoc(profileRef, { email: '', createdAt: Timestamp.now() }),
      );
    });

    it('create rejects extra fields', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const profileRef = doc(alice.firestore(), 'users/alice');

      await assertFails(
        setDoc(profileRef, {
          email: 'alice@example.com',
          createdAt: Timestamp.now(),
          isAdmin: true,
        }),
      );
    });

    it('update cannot change createdAt', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const profileRef = doc(alice.firestore(), 'users/alice');
      const original = Timestamp.fromMillis(1000);

      await assertSucceeds(setDoc(profileRef, { email: 'a@b.c', createdAt: original }));
      await assertFails(
        updateDoc(profileRef, { createdAt: Timestamp.fromMillis(9999) }),
      );
    });
  });

  describe('users/{userId}/passwords', () => {
    const validPassword = {
      title: 'Gmail',
      password: 'super-secret',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    it('owner can create, read, update, delete a password', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      const ref = await assertSucceeds(addDoc(passwords, validPassword));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(
        updateDoc(ref, { ...validPassword, password: 'rotated-1', updatedAt: Timestamp.now() }),
      );
      await assertSucceeds(deleteDoc(ref));
    });

    it('create rejects when required fields are missing', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(addDoc(passwords, { title: 'Gmail' }));
      await assertFails(
        addDoc(passwords, { title: 'Gmail', password: 'x', createdAt: Timestamp.now() }),
      );
    });

    it('create rejects extra fields', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(
        addDoc(passwords, { ...validPassword, role: 'admin' }),
      );
    });

    it('create rejects oversized title or password', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(
        addDoc(passwords, { ...validPassword, title: 'x'.repeat(201) }),
      );
      await assertFails(
        addDoc(passwords, { ...validPassword, password: 'x'.repeat(1025) }),
      );
    });

    it('update cannot change createdAt', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      const ref = await assertSucceeds(addDoc(passwords, validPassword));
      await assertFails(
        updateDoc(ref, { ...validPassword, createdAt: Timestamp.fromMillis(0) }),
      );
    });

    it('other user cannot read or write another users passwords', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users/alice/passwords/p1'), validPassword);
      });
      const bob = testEnv.authenticatedContext('bob');
      const ref = doc(bob.firestore(), 'users/alice/passwords/p1');
      await assertFails(getDoc(ref));
      await assertFails(updateDoc(ref, { ...validPassword, title: 'hacked' }));
    });
  });

  describe('users/{userId}/vault', () => {
    const validVault = {
      encryptedMasterKey: 'AAAA',
      iv: 'BBBB',
    };

    it('owner can create, read, update, delete a vault entry', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const vault = collection(alice.firestore(), 'users/alice/vault');
      const ref = await assertSucceeds(addDoc(vault, validVault));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(
        updateDoc(ref, { ...validVault, encryptedMasterKey: 'CCCC' }),
      );
      await assertSucceeds(deleteDoc(ref));
    });

    it('create rejects when encryptedMasterKey or iv missing', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const vault = collection(alice.firestore(), 'users/alice/vault');
      await assertFails(addDoc(vault, { iv: 'BBBB' }));
      await assertFails(addDoc(vault, { encryptedMasterKey: 'AAAA' }));
    });

    it('update cannot change iv (would break decryption)', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const vault = collection(alice.firestore(), 'users/alice/vault');
      const ref = await assertSucceeds(addDoc(vault, validVault));
      await assertFails(updateDoc(ref, { ...validVault, iv: 'NEWIV' }));
    });
  });

  describe('users/{userId}/files', () => {
    const validFile = {
      name: 'doc.pdf',
      size: 1024,
      type: 'application/pdf',
      storagePath: 'users/alice/files/abc/doc.pdf',
      uploadedAt: 1,
    };

    it('owner can create, read, update, delete a file metadata', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const ref = await assertSucceeds(addDoc(files, validFile));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(updateDoc(ref, { ...validFile, name: 'renamed.pdf' }));
      await assertSucceeds(deleteDoc(ref));
    });

    it('create rejects when storagePath does not match the user namespace', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(
        addDoc(files, { ...validFile, storagePath: 'users/bob/files/abc/doc.pdf' }),
      );
      await assertFails(
        addDoc(files, { ...validFile, storagePath: 'public/doc.pdf' }),
      );
    });

    it('create rejects when required fields are missing or wrong type', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(
        addDoc(files, { ...validFile, size: -1 }),
      );
      await assertFails(
        addDoc(files, { ...validFile, uploadedAt: 'yesterday' }),
      );
      await assertFails(
        addDoc(files, { ...validFile, name: 123 }),
      );
    });

    it('update cannot change storagePath, uploadedAt, or size', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const ref = await assertSucceeds(addDoc(files, validFile));

      await assertFails(
        updateDoc(ref, { ...validFile, storagePath: 'users/alice/files/xyz/other.pdf' }),
      );
      await assertFails(
        updateDoc(ref, { ...validFile, uploadedAt: 999 }),
      );
      await assertFails(
        updateDoc(ref, { ...validFile, size: 9999 }),
      );
    });

    it('other user cannot read or write another users file metadata', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users/alice/files/f1'), validFile);
      });
      const bob = testEnv.authenticatedContext('bob');
      const ref = doc(bob.firestore(), 'users/alice/files/f1');
      await assertFails(getDoc(ref));
      await assertFails(deleteDoc(ref));
    });
  });

  describe('default deny', () => {
    it('denies reads and writes to any other collection', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await assertFails(
        setDoc(doc(alice.firestore(), 'some-collection/x'), { foo: 'bar' }),
      );
      await assertFails(
        setDoc(doc(alice.firestore(), 'users/alice/other/x'), { foo: 'bar' }),
      );
    });
  });
});
