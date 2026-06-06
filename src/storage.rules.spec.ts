/**
 * Storage rules integration tests.
 *
 * These tests require the Firebase Storage emulator to be running.
 * Run them with:
 *   pnpm test:rules
 *
 * When the emulator is not available, the suite is skipped (no failures in CI).
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage';

const STORAGE_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/files/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{path=**} {
      allow read, write: if false;
    }
  }
}
`;

const STORAGE_EMULATOR_HOST = process.env['FIREBASE_STORAGE_EMULATOR_HOST'];

const skip = !STORAGE_EMULATOR_HOST;

(skip ? describe.skip : describe)('storage.rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-devhelper-rules-test',
      storage: { rules: STORAGE_RULES },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  afterEach(async () => {
    await testEnv?.clearStorage();
  });

  const fileBlob = (): Blob => new Blob(['hello'], { type: 'text/plain' });

  it('allows the owner to read and write their own files', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const storage = alice.storage();
    const fileRef = ref(storage, 'users/alice/files/abc/note.txt');

    await assertSucceeds(uploadBytes(fileRef, fileBlob()));
    const downloaded = await getBytes(fileRef);
    expect(new TextDecoder().decode(downloaded)).toBe('hello');
  });

  it('allows the owner to delete their own files', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const storage = alice.storage();
    const fileRef = ref(storage, 'users/alice/files/abc/note.txt');
    await uploadBytes(fileRef, fileBlob());

    await assertSucceeds(deleteObject(fileRef));
  });

  it('denies read access to other users files', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const storage = ctx.storage();
      const fileRef = ref(storage, 'users/alice/files/abc/note.txt');
      await uploadBytes(fileRef, fileBlob());
    });

    const bob = testEnv.authenticatedContext('bob');
    const storage = bob.storage();
    const fileRef = ref(storage, 'users/alice/files/abc/note.txt');

    await assertFails(getBytes(fileRef));
  });

  it('denies write access to other users files', async () => {
    const bob = testEnv.authenticatedContext('bob');
    const storage = bob.storage();
    const fileRef = ref(storage, 'users/alice/files/abc/note.txt');

    await assertFails(uploadBytes(fileRef, fileBlob()));
  });

  it('denies read and write to unauthenticated users', async () => {
    const anon = testEnv.unauthenticatedContext();
    const storage = anon.storage();
    const fileRef = ref(storage, 'users/alice/files/abc/note.txt');

    await assertFails(uploadBytes(fileRef, fileBlob()));
    await assertFails(getBytes(fileRef));
  });

  it('denies access to paths outside users/{uid}/files/**', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const storage = alice.storage();
    const fileRef = ref(storage, 'public/note.txt');

    await assertFails(uploadBytes(fileRef, fileBlob()));
  });
});
