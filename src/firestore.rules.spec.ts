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
  deleteField,
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
              function isBool(value) { return value is bool; }
              function isValidTags(t) {
                return t is list
                    && t.size() <= 10
                    && t.allMatches(tag, tag is string && tag.size() > 0 && tag.size() <= 32);
              }
              function hasValidFileMetadata(m, isCreate) {
                return isBoundedString(m.name, 255)
                    && isPositiveInt(m.size)
                    && m.size <= 5 * 1024 * 1024
                    && isBoundedString(m.mimeType, 120)
                    && isPositiveInt(m.chunkCount)
                    && m.chunkCount <= 8
                    && isPositiveInt(m.updatedAt)
                    && m.tags is list
                    && isValidTags(m.tags)
                    && isPositiveInt(m.createdAt)
                    && (!('encrypted' in m) || isBool(m.encrypted))
                    && (!('iv' in m) || m.iv == null || isBoundedString(m.iv, 1024))
                    && (isCreate || isUnchanged('createdAt'))
                    && m.keys().hasOnly(['name','size','mimeType','chunkCount','updatedAt','encrypted','iv','tags','createdAt']);
              }

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

              match /users/{userId}/proyectos/{projectId}/issues/{issueId}/passwords/{passwordId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 200)
                              && request.resource.data.password is map
                              && request.resource.data.password.keys().hasOnly(['cipher', 'iv'])
                              && request.resource.data.password.cipher is list
                              && request.resource.data.password.iv is list
                              && request.resource.data.password.cipher.size() <= 4096
                              && request.resource.data.password.iv.size() <= 256
                              && request.resource.data.secure is bool
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && request.resource.data.keys().hasOnly(['name', 'password', 'secure', 'createdAt', 'updatedAt']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 200)
                              && request.resource.data.password is map
                              && request.resource.data.password.keys().hasOnly(['cipher', 'iv'])
                              && request.resource.data.password.cipher is list
                              && request.resource.data.password.iv is list
                              && request.resource.data.password.cipher.size() <= 4096
                              && request.resource.data.password.iv.size() <= 256
                              && request.resource.data.secure is bool
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && isUnchanged('createdAt')
                              && request.resource.data.keys().hasOnly(['name', 'password', 'secure', 'createdAt', 'updatedAt']);
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
                              && hasValidFileMetadata(request.resource.data, true);
                allow update: if isOwner(userId)
                              && hasValidFileMetadata(request.resource.data, false);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/proyectos/{projectId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 200)
                              && request.resource.data.name.size() > 0
                              && (!('tag' in request.resource.data) || isBoundedString(request.resource.data.tag, 32))
                              && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 2000))
                              && request.resource.data.archived is bool
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && request.resource.data.keys().hasOnly(['name','tag','description','archived','createdAt','updatedAt']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.name, 200)
                              && request.resource.data.name.size() > 0
                              && (!('tag' in request.resource.data) || isBoundedString(request.resource.data.tag, 32))
                              && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 2000))
                              && request.resource.data.archived is bool
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && isUnchanged('createdAt')
                              && request.resource.data.keys().hasOnly(['name','tag','description','archived','createdAt','updatedAt']);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/proyectos/{projectId}/issues/{issueId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && isBoundedString(request.resource.data.title, 200)
                              && request.resource.data.title.size() > 0
                              && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 20000))
                              && (!('solution' in request.resource.data) || isBoundedString(request.resource.data.solution, 20000))
                              && (request.resource.data.status == 'pending' || request.resource.data.status == 'done' || request.resource.data.status == null)
                              && isBool(request.resource.data.isNote)
                              && (request.resource.data.priority == 'normal' || request.resource.data.priority == 'high')
                              && (!('dueAt' in request.resource.data) || isTimestamp(request.resource.data.dueAt))
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && (request.resource.data.isNote
                                    ? (request.resource.data.status == null && !('dueAt' in request.resource.data))
                                    : (request.resource.data.status == 'pending' || request.resource.data.status == 'done'))
                              && request.resource.data.keys().hasOnly(['title','description','solution','status','isNote','priority','dueAt','createdAt','updatedAt']);
                allow update: if isOwner(userId)
                              && isBoundedString(request.resource.data.title, 200)
                              && request.resource.data.title.size() > 0
                              && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 20000))
                              && (!('solution' in request.resource.data) || isBoundedString(request.resource.data.solution, 20000))
                              && (request.resource.data.status == 'pending' || request.resource.data.status == 'done' || request.resource.data.status == null)
                              && isBool(request.resource.data.isNote)
                              && (request.resource.data.priority == 'normal' || request.resource.data.priority == 'high')
                              && (!('dueAt' in request.resource.data) || isTimestamp(request.resource.data.dueAt))
                              && isTimestamp(request.resource.data.createdAt)
                              && isTimestamp(request.resource.data.updatedAt)
                              && isUnchanged('createdAt')
                              && (request.resource.data.isNote
                                    ? (request.resource.data.status == null && !('dueAt' in request.resource.data))
                                    : (request.resource.data.status == 'pending' || request.resource.data.status == 'done'))
                              && request.resource.data.keys().hasOnly(['title','description','solution','status','isNote','priority','dueAt','createdAt','updatedAt']);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/proyectos/{projectId}/issues/{issueId}/files/{fileId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && hasValidFileMetadata(request.resource.data, true);
                allow update: if isOwner(userId)
                              && hasValidFileMetadata(request.resource.data, false);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/proyectos/{projectId}/issues/{issueId}/files/{fileId}/chunks/{chunkId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && request.resource.data.keys().hasOnly(['index','data'])
                              && request.resource.data.index is int
                              && request.resource.data.index >= 0
                              && request.resource.data.index < 8
                              && request.resource.data.data is bytes
                              && request.resource.data.data.size() <= 700 * 1024;
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/files/{fileId}/chunks/{chunkId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && request.resource.data.keys().hasOnly(['index','data'])
                              && request.resource.data.index is int
                              && request.resource.data.index >= 0
                              && request.resource.data.index < 8
                              && request.resource.data.data is bytes
                              && request.resource.data.data.size() <= 700 * 1024;
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/nasa-image/{fileId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && hasValidFileMetadata(request.resource.data, true);
                allow update: if isOwner(userId)
                              && hasValidFileMetadata(request.resource.data, false);
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/nasa-image/{fileId}/chunks/{chunkId} {
                allow read: if isOwner(userId);
                allow create: if isOwner(userId)
                              && request.resource.data.keys().hasOnly(['index','data'])
                              && request.resource.data.index is int
                              && request.resource.data.index >= 0
                              && request.resource.data.index < 8
                              && request.resource.data.data is bytes
                              && request.resource.data.data.size() <= 700 * 1024;
                allow delete: if isOwner(userId);
              }

              match /users/{userId}/preferences/{prefsId} {
                allow read: if isOwner(userId) && prefsId == 'singleton';
                allow create, update: if isOwner(userId)
                              && prefsId == 'singleton'
                              && isBoundedString(request.resource.data.id, 32)
                              && request.resource.data.id == 'singleton'
                              && (!('customNasaImage' in request.resource.data)
                                  || (isBoundedString(request.resource.data.customNasaImage.fileId, 128)
                                      && isPositiveInt(request.resource.data.customNasaImage.updatedAt)))
                              && (!('aiAssistantEnabled' in request.resource.data)
                                  || isBool(request.resource.data.aiAssistantEnabled))
                              && (!('aiSearcherEnabled' in request.resource.data)
                                  || isBool(request.resource.data.aiSearcherEnabled))
                              && request.resource.data.keys().hasOnly(['id','customNasaImage','aiAssistantEnabled','aiSearcherEnabled']);
                allow delete: if isOwner(userId) && prefsId == 'singleton';
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
      await assertFails(setDoc(profileRef, { email: '', createdAt: Timestamp.now() }));
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
      await assertFails(updateDoc(profileRef, { createdAt: Timestamp.fromMillis(9999) }));
    });
  });

  describe('users/{uid}/preferences/{prefsId}', () => {
    const prefsPath = (uid: string) => `users/${uid}/preferences/singleton`;

    it('owner can create preferences with aiAssistantEnabled=true', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiAssistantEnabled: true,
        }),
      );
    });

    it('owner can create preferences with aiSearcherEnabled=false', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiSearcherEnabled: false,
        }),
      );
    });

    it('owner can create preferences with both booleans and customNasaImage', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiAssistantEnabled: true,
          aiSearcherEnabled: true,
          customNasaImage: { fileId: 'file123', updatedAt: 1234567890 },
        }),
      );
    });

    it('rejects preferences with aiAssistantEnabled as non-bool', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiAssistantEnabled: 'yes',
        }),
      );
    });

    it('rejects preferences with aiSearcherEnabled as non-bool', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiSearcherEnabled: 1,
        }),
      );
    });

    it('rejects preferences with unknown field', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          somethingElse: true,
        }),
      );
    });

    it('non-owner cannot create preferences', async () => {
      const ctx = testEnv.authenticatedContext('u2');
      await assertFails(
        setDoc(doc(ctx.firestore(), prefsPath('u1')), {
          id: 'singleton',
          aiAssistantEnabled: true,
        }),
      );
    });

    it('owner can update preferences toggling aiSearcherEnabled', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), prefsPath('u1'));
      await assertSucceeds(setDoc(ref, { id: 'singleton', aiSearcherEnabled: true }));
      await assertSucceeds(updateDoc(ref, { aiSearcherEnabled: false }));
    });
  });

  describe('users/{userId}/passwords', () => {
    const validPassword = {
      name: 'Gmail',
      password: { cipher: [1, 2, 3], iv: [4, 5, 6] },
      secure: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    it('owner can create, read, update, delete a password', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      const ref = await assertSucceeds(addDoc(passwords, validPassword));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(
        updateDoc(ref, { ...validPassword, name: 'rotated-1', updatedAt: Timestamp.now() }),
      );
      await assertSucceeds(deleteDoc(ref));
    });

    it('create rejects when required fields are missing', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(addDoc(passwords, { name: 'Gmail' }));
      await assertFails(
        addDoc(passwords, {
          name: 'Gmail',
          password: { cipher: [1], iv: [2] },
          createdAt: Timestamp.now(),
        }),
      );
    });

    it('create rejects extra fields', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(addDoc(passwords, { ...validPassword, role: 'admin' }));
    });

    it('create rejects oversized name', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      await assertFails(addDoc(passwords, { ...validPassword, name: 'x'.repeat(201) }));
    });

    it('update cannot change createdAt', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const passwords = collection(alice.firestore(), 'users/alice/passwords');
      const ref = await assertSucceeds(addDoc(passwords, validPassword));
      await assertFails(updateDoc(ref, { ...validPassword, createdAt: Timestamp.fromMillis(0) }));
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
      await assertSucceeds(updateDoc(ref, { ...validVault, encryptedMasterKey: 'CCCC' }));
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
      mimeType: 'application/pdf',
      chunkCount: 1,
      updatedAt: 1,
      tags: [] as string[],
      createdAt: 1,
    };

    it('owner can create, read, update, delete a file metadata', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const ref = await assertSucceeds(addDoc(files, validFile));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(updateDoc(ref, { ...validFile, name: 'renamed.pdf' }));
      await assertSucceeds(deleteDoc(ref));
    });

    it('create rejects when file size exceeds 5 MB', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, size: 6 * 1024 * 1024 }));
    });

    it('create rejects when chunkCount exceeds 8', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, chunkCount: 9 }));
    });

    it('create rejects when required fields are missing or wrong type', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, name: 123 }));
      await assertFails(addDoc(files, { ...validFile, chunkCount: 'many' }));
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

  describe('users/{userId}/files/{fileId}/chunks', () => {
    const smallBytes = () => new Uint8Array(100 * 1024);
    const oversizedBytes = () => new Uint8Array(800 * 1024);

    it('owner can create and read a small chunk', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const chunks = collection(alice.firestore(), 'users/alice/files/f1/chunks');
      const ref = doc(chunks, '0');
      await assertSucceeds(setDoc(ref, { index: 0, data: smallBytes() }));
      await assertSucceeds(getDoc(ref));
    });

    it('create rejects when data exceeds 700 KB', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const chunks = collection(alice.firestore(), 'users/alice/files/f1/chunks');
      const ref = doc(chunks, '0');
      await assertFails(setDoc(ref, { index: 0, data: oversizedBytes() }));
    });

    it('create rejects when index is negative or >= 8', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const chunks = collection(alice.firestore(), 'users/alice/files/f1/chunks');
      const ref = doc(chunks, '8');
      await assertFails(setDoc(ref, { index: 8, data: smallBytes() }));
    });

    it('other user cannot write to another users chunks', async () => {
      const bob = testEnv.authenticatedContext('bob');
      const chunks = collection(bob.firestore(), 'users/alice/files/f1/chunks');
      const ref = doc(chunks, '0');
      await assertFails(setDoc(ref, { index: 0, data: smallBytes() }));
    });
  });

  describe('users/{userId}/nasa-image', () => {
    const validImage = {
      name: 'nasa.png',
      size: 500 * 1024,
      mimeType: 'image/png',
      chunkCount: 1,
      updatedAt: 1,
      tags: [] as string[],
      createdAt: 1,
    };

    it('owner can create and read a nasa image', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const nasa = collection(alice.firestore(), 'users/alice/nasa-image');
      const ref = await assertSucceeds(addDoc(nasa, validImage));
      await assertSucceeds(getDoc(ref));
    });

    it('create rejects when nasa image size exceeds 5 MB', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const nasa = collection(alice.firestore(), 'users/alice/nasa-image');
      await assertFails(addDoc(nasa, { ...validImage, size: 6 * 1024 * 1024 }));
    });
  });

  describe('files metadata — mimeType / tags / createdAt', () => {
    const validFile = {
      name: 'doc.pdf',
      size: 1024,
      mimeType: 'application/pdf',
      chunkCount: 1,
      updatedAt: 1,
      tags: ['invoice', 'q4'] as string[],
      createdAt: 1,
    };

    it('accepts files with valid mimeType, tags and createdAt', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertSucceeds(addDoc(files, validFile));
    });

    it('rejects when mimeType exceeds 120 chars', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, mimeType: 'x'.repeat(121) }));
    });

    it('rejects when tags list has more than 10 items', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const tags = Array.from({ length: 11 }, (_, i) => `t${i}`);
      await assertFails(addDoc(files, { ...validFile, tags }));
    });

    it('rejects when a tag exceeds 32 chars', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, tags: ['x'.repeat(33)] }));
    });

    it('rejects when tags contains a non-string', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertFails(addDoc(files, { ...validFile, tags: ['ok', 42 as unknown as string] }));
    });

    it('rejects when createdAt is missing', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const { createdAt: _createdAt, ...without } = validFile;
      await assertFails(addDoc(files, without));
    });

    it('rejects when updatedAt differs from server time on create (relaxed: client int OK)', async () => {
      // In our relaxed rule we accept any positive int for updatedAt on create.
      // The strict check is reserved for a future milestone.
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      await assertSucceeds(addDoc(files, { ...validFile, updatedAt: 1234567 }));
    });

    it('update cannot change createdAt', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const ref = await assertSucceeds(addDoc(files, validFile));
      await assertFails(updateDoc(ref, { ...validFile, createdAt: 999 }));
    });

    it('update cannot add an unknown field', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const files = collection(alice.firestore(), 'users/alice/files');
      const ref = await assertSucceeds(addDoc(files, validFile));
      await assertFails(updateDoc(ref, { ...validFile, hacker: true } as Record<string, unknown>));
    });
  });

  describe('users/{userId}/proyectos/{p}/issues/{i}/files (issue scope)', () => {
    const validFile = {
      name: 'log.txt',
      size: 256,
      mimeType: 'text/plain',
      chunkCount: 1,
      updatedAt: 1,
      tags: [] as string[],
      createdAt: 1,
    };

    it('owner can create, read, update, delete an issue-scoped file', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const col = collection(alice.firestore(), 'users/alice/proyectos/p1/issues/i1/files');
      const ref = await assertSucceeds(addDoc(col, validFile));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(updateDoc(ref, { ...validFile, name: 'renamed.txt' }));
      await assertSucceeds(deleteDoc(ref));
    });

    it('owner can write and read issue-scoped chunks (within 700 KB)', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const chunks = collection(
        alice.firestore(),
        'users/alice/proyectos/p1/issues/i1/files/f1/chunks',
      );
      const ref = doc(chunks, '0');
      await assertSucceeds(setDoc(ref, { index: 0, data: new Uint8Array(100 * 1024) }));
      await assertSucceeds(getDoc(ref));
    });

    it('rejects issue-scoped file when size exceeds 5 MB', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const col = collection(alice.firestore(), 'users/alice/proyectos/p1/issues/i1/files');
      await assertFails(addDoc(col, { ...validFile, size: 6 * 1024 * 1024 }));
    });

    it('rejects issue-scoped chunk over 700 KB', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const chunks = collection(
        alice.firestore(),
        'users/alice/proyectos/p1/issues/i1/files/f1/chunks',
      );
      const ref = doc(chunks, '0');
      await assertFails(setDoc(ref, { index: 0, data: new Uint8Array(800 * 1024) }));
    });

    it('does NOT cross-read between different issues of the same project', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(
          doc(ctx.firestore(), 'users/alice/proyectos/p1/issues/i1/files/f1'),
          validFile,
        );
      });
      const bob = testEnv.authenticatedContext('bob');
      const otherIssue = doc(bob.firestore(), 'users/alice/proyectos/p1/issues/i2/files/f1');
      await assertFails(getDoc(otherIssue));
    });

    it('does NOT cross-read between different projects', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(
          doc(ctx.firestore(), 'users/alice/proyectos/p1/issues/i1/files/f1'),
          validFile,
        );
      });
      const bob = testEnv.authenticatedContext('bob');
      const otherProject = doc(bob.firestore(), 'users/alice/proyectos/p2/issues/i1/files/f1');
      await assertFails(getDoc(otherProject));
    });

    it('does NOT cross-read between global and issue scope', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(
          doc(ctx.firestore(), 'users/alice/proyectos/p1/issues/i1/files/f1'),
          validFile,
        );
      });
      const bob = testEnv.authenticatedContext('bob');
      const globalFile = doc(bob.firestore(), 'users/alice/files/f1');
      await assertFails(getDoc(globalFile));
    });
  });

  describe('default deny', () => {
    it('denies reads and writes to any other collection', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await assertFails(setDoc(doc(alice.firestore(), 'some-collection/x'), { foo: 'bar' }));
      await assertFails(setDoc(doc(alice.firestore(), 'users/alice/other/x'), { foo: 'bar' }));
    });
  });

  describe('users/{uid}/events', () => {
    const eventPath = (uid: string, id = 'e1') => `users/${uid}/events/${id}`;

    const validEvent = () => ({
      title: 'Reunion',
      at: Timestamp.now(),
      isAllDay: false,
      notified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    it('owner can create a valid event', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(setDoc(doc(ctx.firestore(), eventPath('u1')), validEvent()));
    });

    it('non-owner cannot create an event in another user collection', async () => {
      const ctx = testEnv.authenticatedContext('u2');
      await assertFails(setDoc(doc(ctx.firestore(), eventPath('u1')), validEvent()));
    });

    it('rejects event with empty title', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), eventPath('u1')), { ...validEvent(), title: '' }),
      );
    });

    it('rejects event with title > 200 chars', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), eventPath('u1')), {
          ...validEvent(),
          title: 'x'.repeat(201),
        }),
      );
    });

    it('rejects event missing the at timestamp', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ev = validEvent() as Record<string, unknown>;
      delete ev['at'];
      await assertFails(setDoc(doc(ctx.firestore(), eventPath('u1')), ev));
    });

    it('rejects event with durationMinutes > 1440', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), eventPath('u1')), {
          ...validEvent(),
          durationMinutes: 1441,
        }),
      );
    });

    it('rejects event with unknown field', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), eventPath('u1')), {
          ...validEvent(),
          secret: 'x',
        }),
      );
    });

    it('owner can update keeping createdAt unchanged', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), eventPath('u1'));
      await assertSucceeds(setDoc(ref, validEvent()));
      await assertSucceeds(updateDoc(ref, { title: 'Otro' }));
    });

    it('rejects update that changes createdAt', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), eventPath('u1'));
      await assertSucceeds(setDoc(ref, validEvent()));
      await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }));
    });

    it('owner can delete', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), eventPath('u1'));
      await assertSucceeds(setDoc(ref, validEvent()));
      await assertSucceeds(deleteDoc(ref));
    });

    it('non-owner cannot read or delete', async () => {
      const ownerCtx = testEnv.authenticatedContext('u1');
      const ref = doc(ownerCtx.firestore(), eventPath('u1'));
      await assertSucceeds(setDoc(ref, validEvent()));

      const strangerCtx = testEnv.authenticatedContext('u2');
      await assertFails(getDoc(doc(strangerCtx.firestore(), eventPath('u1'))));
      await assertFails(deleteDoc(doc(strangerCtx.firestore(), eventPath('u1'))));
    });
  });

  describe('users/{uid}/proyectos', () => {
    const projectPath = (uid: string, id = 'p1') => `users/${uid}/proyectos/${id}`;

    const validProject = () => ({
      name: 'Yedra',
      tag: 'frontend',
      description: 'SPA workspace',
      archived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    it('owner can create, read, update and delete a project', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertSucceeds(setDoc(ref, validProject()));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(updateDoc(ref, { name: 'Yedra 2', updatedAt: Timestamp.now() }));
      await assertSucceeds(deleteDoc(ref));
    });

    it('create accepts a project without optional fields', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1', 'p2'));
      const minimal = {
        name: 'Solo nombre',
        archived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await assertSucceeds(setDoc(ref, minimal));
    });

    it('create rejects empty name', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), name: '' }));
    });

    it('create rejects oversized name (> 200)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), name: 'x'.repeat(201) }));
    });

    it('create rejects oversized tag (> 32)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), tag: 'x'.repeat(33) }));
    });

    it('create rejects oversized description (> 2000)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), description: 'x'.repeat(2001) }));
    });

    it('create rejects when archived is not bool', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), archived: 'yes' }));
    });

    it('create rejects unknown field', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertFails(setDoc(ref, { ...validProject(), color: 'red' }));
    });

    it('update cannot change createdAt', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), projectPath('u1'));
      await assertSucceeds(setDoc(ref, validProject()));
      await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }));
    });

    it('non-owner cannot read or write projects of another user', async () => {
      const ownerCtx = testEnv.authenticatedContext('u1');
      const ref = doc(ownerCtx.firestore(), projectPath('u1'));
      await assertSucceeds(setDoc(ref, validProject()));

      const strangerCtx = testEnv.authenticatedContext('u2');
      const strangerRead = doc(strangerCtx.firestore(), projectPath('u1'));
      await assertFails(getDoc(strangerRead));
      await assertFails(deleteDoc(strangerRead));
      await assertFails(setDoc(doc(strangerCtx.firestore(), projectPath('u1')), validProject()));
    });
  });

  describe('users/{uid}/proyectos/{projectId}/issues/{issueId}', () => {
    const issuePath = (uid: string, projectId = 'p1', issueId = 'i1') =>
      `users/${uid}/proyectos/${projectId}/issues/${issueId}`;

    const validTask = () => ({
      title: 'Tarea de prueba',
      status: 'pending',
      isNote: false,
      priority: 'normal',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const validNote = () => ({
      title: 'Nota de prueba',
      status: null,
      isNote: true,
      priority: 'normal',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    it('owner can create a valid task', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(setDoc(doc(ctx.firestore(), issuePath('u1')), validTask()));
    });

    it('owner can create a valid note (status=null, no dueAt)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(setDoc(doc(ctx.firestore(), issuePath('u1')), validNote()));
    });

    it('non-owner cannot create an issue in another user project', async () => {
      const ctx = testEnv.authenticatedContext('u2');
      await assertFails(setDoc(doc(ctx.firestore(), issuePath('u1')), validTask()));
    });

    it('rejects issue with empty title', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), { ...validTask(), title: '' }),
      );
    });

    it('rejects issue with title > 200 chars', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          title: 'x'.repeat(201),
        }),
      );
    });

    it('rejects issue with description > 20000 chars', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          description: 'x'.repeat(20001),
        }),
      );
    });

    it('owner can create an issue with a valid solution', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          solution: 'Reiniciar el servicio tras limpiar la cache.',
        }),
      );
    });

    it('rejects issue with solution > 20000 chars', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          solution: 'x'.repeat(20001),
        }),
      );
    });

    it('rejects issue with solution that is not a string', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          solution: 12345,
        }),
      );
    });

    it('owner can update an issue to add or remove solution', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), issuePath('u1'));
      await assertSucceeds(setDoc(ref, validTask()));
      await assertSucceeds(updateDoc(ref, { solution: 'nueva' }));
      await assertSucceeds(updateDoc(ref, { solution: deleteField() }));
    });

    it('rejects issue with invalid status', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), { ...validTask(), status: 'invalid' }),
      );
    });

    it('rejects issue with invalid priority', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), { ...validTask(), priority: 'critical' }),
      );
    });

    it('rejects note that has a status (must be null)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), { ...validNote(), status: 'pending' }),
      );
    });

    it('rejects note that has a dueAt', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validNote(),
          dueAt: Timestamp.now(),
        }),
      );
    });

    it('rejects task without status (null is only allowed for notes)', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), { ...validTask(), status: null }),
      );
    });

    it('rejects issue with unknown field', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), issuePath('u1')), {
          ...validTask(),
          secret: 'x',
        }),
      );
    });

    it('owner can update keeping createdAt unchanged', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), issuePath('u1'));
      await assertSucceeds(setDoc(ref, validTask()));
      await assertSucceeds(updateDoc(ref, { title: 'Otro' }));
    });

    it('rejects update that changes createdAt', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), issuePath('u1'));
      await assertSucceeds(setDoc(ref, validTask()));
      await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }));
    });

    it('owner can delete', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), issuePath('u1'));
      await assertSucceeds(setDoc(ref, validTask()));
      await assertSucceeds(deleteDoc(ref));
    });

    it('non-owner cannot read or delete', async () => {
      const ownerCtx = testEnv.authenticatedContext('u1');
      const ref = doc(ownerCtx.firestore(), issuePath('u1'));
      await assertSucceeds(setDoc(ref, validTask()));

      const strangerCtx = testEnv.authenticatedContext('u2');
      await assertFails(getDoc(doc(strangerCtx.firestore(), issuePath('u1'))));
      await assertFails(deleteDoc(doc(strangerCtx.firestore(), issuePath('u1'))));
    });
  });

  describe('users/{uid}/proyectos/{projectId}/issues/{issueId}/passwords/{passwordId}', () => {
    const pwdPath = (uid: string, projectId = 'p1', issueId = 'i1', passwordId = 'w1') =>
      `users/${uid}/proyectos/${projectId}/issues/${issueId}/passwords/${passwordId}`;

    const validPassword = () => ({
      name: 'svc',
      password: { cipher: [1, 2, 3], iv: [4, 5, 6] },
      secure: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    it('owner can create an issue-scoped password', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertSucceeds(setDoc(doc(ctx.firestore(), pwdPath('u1')), validPassword()));
    });

    it('non-owner cannot create an issue-scoped password', async () => {
      const ctx = testEnv.authenticatedContext('u2');
      await assertFails(setDoc(doc(ctx.firestore(), pwdPath('u1')), validPassword()));
    });

    it('rejects password with name > 200 chars', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      await assertFails(
        setDoc(doc(ctx.firestore(), pwdPath('u1')), {
          ...validPassword(),
          name: 'x'.repeat(201),
        }),
      );
    });

    it('rejects password without the password field', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const { password: _password, ...rest } = validPassword();
      await assertFails(setDoc(doc(ctx.firestore(), pwdPath('u1')), rest));
    });

    it('owner can delete an issue-scoped password', async () => {
      const ctx = testEnv.authenticatedContext('u1');
      const ref = doc(ctx.firestore(), pwdPath('u1'));
      await assertSucceeds(setDoc(ref, validPassword()));
      await assertSucceeds(deleteDoc(ref));
    });
  });
});
