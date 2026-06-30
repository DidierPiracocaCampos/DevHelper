# Calendario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first iteration of the global events calendar (CU-09): browse weeks, see events of a selected day, and create / edit / delete events. Storage path `users/{uid}/events/{eventId}`. Route `/calendar`.

**Architecture:** Angular standalone components (one route page + one event-card child), one Firestore repository (`EventRepository`) that extends `ApiBase<EventI>` with the existing CRUD mixins. No encryption, no scheduler. Date math via native `Date` + `Intl.DateTimeFormat` (no new deps).

**Tech Stack:** Angular 20, signals + `inject()`, Firestore 11, vitest, DaisyUI 5 + Tailwind 4, Material Symbols Outlined.

**Spec:** `docs/superpowers/specs/2026-06-30-calendario-design.md`.

## Global Constraints

- Angular `^20.3.18` standalone components, signals, OnPush by default.
- DaisyUI 5 + Tailwind 4 via `@plugin "daisyui"` block in `src/styles.css`. Custom theme `devhelper` (dark only).
- TypeScript strict + strictTemplates.
- pnpm is the package manager. `pnpm-lock.yaml` is the lockfile. **Do not add `date-fns` or any new dep** — date math uses native `Date` + `Intl.DateTimeFormat`.
- vitest (`@angular/build:unit-test` via `pnpm test`). Specs excluded from app build (`tsconfig.app.json`), included in `tsconfig.spec.json` with `types: ["vitest/globals"]`.
- ESLint covers `src/**/*.ts` only. Format: prettier (2 spaces, single quotes, 100 cols, trailing commas).
- Material Symbols Outlined for icons (class `icon` with `icon-sm` / `icon-lg`).
- **No emojis, no gradients, no `dark:` prefix.** Reuse `ui-card`, `ui-button`, `ui-modal`, `ui-text-field`, `ui-textarea-field`, `ui-number-field`, `ui-card-button` whenever possible.
- All copy is in Spanish.
- File naming: BEM-like suffixes (`calendar-event`, `card-event`). Components `selector` lowercase, no `app-` prefix unless route component.
- Do **not** commit `src/environment/`, `.env`, or any file containing API keys.
- Reuse `ConfirmService` (`src/app/shared/service/confirm.service.ts`) for destructive actions — never `confirm()`.
- Reuse `ToastService` for success/error feedback.
- Reuse `LoaderService` for global loading transitions if needed.
- **Firestore rules shape is additive only** — never remove or rename existing rules/fields when adding the events block.

## File Structure (locked-in decomposition)

```
src/app/home/
├── domain/
│   └── event.interface.ts                  # NEW — EventI + EventCreateInput + EventUpdateInput
├── service/
│   └── events.repository.ts                # NEW — EventRepository (ApiBase + 4 mixins)
├── utils/
│   ├── calendar.utils.ts                   # NEW — startOfWeek, addDays, isSameDay, startOfDay, endOfDay
│   └── calendar.utils.spec.ts              # NEW — vitest
├── components/
│   └── calendar-event/
│       ├── calendar-event.ts               # NEW — card de evento (title + hora + click)
│       ├── calendar-event.html             # NEW
│       ├── calendar-event.css              # NEW — card-event severity classes
│       └── calendar-event.spec.ts          # NEW — vitest
└── pages/
    └── calendar/
        ├── calendar.ts                     # NEW — Calendar page component
        ├── calendar.html                   # NEW
        ├── calendar.css                    # NEW — estilos de la página (círculo, día, empty state)
        └── calendar.spec.ts                # NEW — vitest

src/app/home/pages/home/
├── home.html                                # MOD — placeholder Calendario -> card-link
└── home.ts                                  # MOD — añadir todayEventsCount

src/app/app.routes.ts                        # MOD — añadir path 'calendar'

firestore.rules                              # MOD — bloque match /users/{userId}/events
src/firestore.rules.spec.ts                  # MOD — tests para users/{uid}/events
```

Files that change together (`calendar.ts` + `calendar.html` + `calendar.css`) are the route page and live in the same folder. The `calendar-event` child component is independent and reused only inside `calendar.html`.

## Verification order (after each task that needs it)

```bash
pnpm run lint
pnpm test
pnpm build
```

`pnpm run test:rules:firestore` only for the rules task; needs the Firestore emulator.

---

## Task 1: Date utilities (calendar.utils.ts)

Pure functions, no Angular dependency. Used everywhere in the calendar feature.

**Files:**
- Create: `src/app/home/utils/calendar.utils.ts`
- Create: `src/app/home/utils/calendar.utils.spec.ts`

**Interfaces:**
- Produces: `startOfWeek(d: Date): Date` (lunes 00:00 local), `addDays(d: Date, n: number): Date`, `isSameDay(a: Date, b: Date): boolean`, `startOfDay(d: Date): Date`, `endOfDay(d: Date): Date` (ms 999), `formatMonth(d: Date): string` (lowercase es-ES), `formatDayNumber(d: Date): string` (es-ES), `formatTime(d: Date): string` (HH:mm es-ES 24h), `WEEKDAY_LABELS: readonly string[]` (constante `['L', 'M', 'X', 'J', 'V', 'S', 'D']`).

- [ ] **Step 1: Write the failing test**

Create `src/app/home/utils/calendar.utils.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
  formatMonth,
  formatDayNumber,
  formatTime,
  WEEKDAY_LABELS,
} from './calendar.utils';

describe('calendar.utils', () => {
  it('startOfWeek returns the Monday of the same week at 00:00:00.000', () => {
    // Wednesday 2024-03-13
    const wed = new Date(2024, 2, 13, 15, 30, 45, 123);
    const mon = startOfWeek(wed);
    expect(mon.getFullYear()).toBe(2024);
    expect(mon.getMonth()).toBe(2);
    expect(mon.getDate()).toBe(11);
    expect(mon.getHours()).toBe(0);
    expect(mon.getMinutes()).toBe(0);
    expect(mon.getSeconds()).toBe(0);
    expect(mon.getMilliseconds()).toBe(0);
  });

  it('startOfWeek on a Sunday returns the previous Monday', () => {
    // Sunday 2024-03-17
    const sun = new Date(2024, 2, 17, 9, 0);
    const mon = startOfWeek(sun);
    expect(mon.getDate()).toBe(11);
    expect(mon.getMonth()).toBe(2);
  });

  it('startOfWeek on a Monday returns the same day at 00:00', () => {
    const mon = new Date(2024, 2, 11, 5, 0);
    const result = startOfWeek(mon);
    expect(isSameDay(result, mon)).toBe(true);
    expect(result.getHours()).toBe(0);
  });

  it('addDays returns a new Date shifted by n days, not mutating input', () => {
    const d = new Date(2024, 0, 31);
    const next = addDays(d, 1);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
    expect(d.getDate()).toBe(31);
  });

  it('addDays(-7) goes back exactly one week', () => {
    const d = new Date(2024, 2, 20);
    const prev = addDays(d, -7);
    expect(prev.getDate()).toBe(13);
  });

  it('isSameDay is true when year/month/date match, ignoring time', () => {
    const a = new Date(2024, 2, 15, 9, 0);
    const b = new Date(2024, 2, 15, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('isSameDay is false when any of year/month/date differs', () => {
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 2, 16))).toBe(false);
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 3, 15))).toBe(false);
    expect(isSameDay(new Date(2024, 2, 15), new Date(2025, 2, 15))).toBe(false);
  });

  it('startOfDay zeros hours/minutes/seconds/ms', () => {
    const d = new Date(2024, 2, 15, 14, 30, 45, 999);
    const sod = startOfDay(d);
    expect(sod.getHours()).toBe(0);
    expect(sod.getMinutes()).toBe(0);
    expect(sod.getSeconds()).toBe(0);
    expect(sod.getMilliseconds()).toBe(0);
    expect(isSameDay(sod, d)).toBe(true);
  });

  it('endOfDay sets 23:59:59.999', () => {
    const d = new Date(2024, 2, 15, 0, 0, 0, 0);
    const eod = endOfDay(d);
    expect(eod.getHours()).toBe(23);
    expect(eod.getMinutes()).toBe(59);
    expect(eod.getSeconds()).toBe(59);
    expect(eod.getMilliseconds()).toBe(999);
  });

  it('formatMonth returns the lowercase es-ES month name', () => {
    const jan = new Date(2024, 0, 15);
    const sep = new Date(2024, 8, 15);
    expect(formatMonth(jan)).toBe('enero');
    expect(formatMonth(sep)).toBe('septiembre');
  });

  it('formatDayNumber returns the day of month without leading zero', () => {
    expect(formatDayNumber(new Date(2024, 0, 1))).toBe('1');
    expect(formatDayNumber(new Date(2024, 0, 31))).toBe('31');
  });

  it('formatTime returns HH:mm 24h', () => {
    expect(formatTime(new Date(2024, 0, 1, 9, 0))).toBe('09:00');
    expect(formatTime(new Date(2024, 0, 1, 23, 5))).toBe('23:05');
    expect(formatTime(new Date(2024, 0, 1, 0, 0))).toBe('00:00');
  });

  it('WEEKDAY_LABELS is exactly 7 Spanish initials starting with L (lunes)', () => {
    expect(WEEKDAY_LABELS).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(WEEKDAY_LABELS).toHaveLength(7);
  });
});
```

- [ ] **Step 2: Run test, verify it fails (module not found)**

Run: `pnpm test -- --run src/app/home/utils/calendar.utils.spec.ts`
Expected: FAIL with `Cannot find module './calendar.utils'`.

- [ ] **Step 3: Implement `calendar.utils.ts`**

Create `src/app/home/utils/calendar.utils.ts`:

```ts
export const WEEKDAY_LABELS: readonly string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const offset = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long' });
const DAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric' });
const TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatMonth(d: Date): string {
  return MONTH_FORMATTER.format(d);
}

export function formatDayNumber(d: Date): string {
  return DAY_FORMATTER.format(d);
}

export function formatTime(d: Date): string {
  return TIME_FORMATTER.format(d);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test -- --run src/app/home/utils/calendar.utils.spec.ts`
Expected: PASS (all 14 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/home/utils/calendar.utils.ts src/app/home/utils/calendar.utils.spec.ts
git commit -m "feat(calendar): add pure date utilities (startOfWeek, addDays, formatters)"
```

---

## Task 2: EventI model + input types

Trivial type-only file. No runtime code, no test.

**Files:**
- Create: `src/app/home/domain/event.interface.ts`

- [ ] **Step 1: Create the interface file**

```ts
import { Timestamp } from '@angular/fire/firestore';

export interface EventI {
  id?: string;
  title: string;
  description?: string;
  at: Timestamp;
  isAllDay: boolean;
  durationMinutes?: number;
  notified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventCreateInput = Omit<EventI, 'id' | 'createdAt' | 'updatedAt' | 'notified'>;

export type EventUpdateInput = Partial<Omit<EventI, 'id' | 'createdAt'>>;
```

- [ ] **Step 2: Verify type-check**

Run: `pnpm build`
Expected: success, no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/home/domain/event.interface.ts
git commit -m "feat(calendar): add EventI domain interface"
```

---

## Task 3: Firestore rules + rules tests

Add the `users/{userId}/events` block to `firestore.rules` and extend `src/firestore.rules.spec.ts` to cover it. Rules test requires the emulator (`pnpm run test:rules:firestore`).

**Files:**
- Modify: `firestore.rules` (add one `match` block after the `passwords` block, line ~184)
- Modify: `src/firestore.rules.spec.ts` (add a `describe('events')` block)

**Interfaces:**
- Consumes: existing helpers `isOwner`, `isBoundedString`, `isTimestamp`, `isBool`, `isPositiveInt`, `isUnchanged`.
- Produces: validated path `users/{userId}/events/{eventId}` with `title` (1..200), `description?` (<=2000), `at` (timestamp), `isAllDay` (bool), `notified` (bool), `createdAt` (timestamp, immutable), `updatedAt` (timestamp), `durationMinutes?` (0..1440).

- [ ] **Step 1: Add the rules block**

In `firestore.rules`, locate the `// Passwords` section (line ~157). After the `match /users/{userId}/passwords/{passwordId}` block ends (line ~184, just before `// Vault`), insert:

```rules
    // -------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------
    match /users/{userId}/events/{eventId} {
      allow read: if isOwner(userId);

      allow create: if isOwner(userId)
                    && isBoundedString(request.resource.data.title, 200)
                    && request.resource.data.title.size() > 0
                    && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 2000))
                    && isTimestamp(request.resource.data.at)
                    && isBool(request.resource.data.isAllDay)
                    && isBool(request.resource.data.notified)
                    && isTimestamp(request.resource.data.createdAt)
                    && isTimestamp(request.resource.data.updatedAt)
                    && (!('durationMinutes' in request.resource.data) || (isPositiveInt(request.resource.data.durationMinutes) && request.resource.data.durationMinutes <= 1440))
                    && request.resource.data.keys().hasOnly(['title', 'description', 'at', 'isAllDay', 'durationMinutes', 'notified', 'createdAt', 'updatedAt']);

      allow update: if isOwner(userId)
                    && isBoundedString(request.resource.data.title, 200)
                    && request.resource.data.title.size() > 0
                    && (!('description' in request.resource.data) || isBoundedString(request.resource.data.description, 2000))
                    && isTimestamp(request.resource.data.at)
                    && isBool(request.resource.data.isAllDay)
                    && isBool(request.resource.data.notified)
                    && isTimestamp(request.resource.data.createdAt)
                    && isTimestamp(request.resource.data.updatedAt)
                    && isUnchanged('createdAt')
                    && (!('durationMinutes' in request.resource.data) || (isPositiveInt(request.resource.data.durationMinutes) && request.resource.data.durationMinutes <= 1440))
                    && request.resource.data.keys().hasOnly(['title', 'description', 'at', 'isAllDay', 'durationMinutes', 'notified', 'createdAt', 'updatedAt']);

      allow delete: if isOwner(userId);
    }

```

The block goes **before** the `// Vault` comment so events sit between passwords and vault, matching the doc order in the file's "Data Model" comment (line ~64-133).

- [ ] **Step 2: Add unit tests for events in `src/firestore.rules.spec.ts`**

Open `src/firestore.rules.spec.ts`. Scroll to the bottom of the `describe('firestore.rules', ...)` block (just before its closing `});`). Append a new `describe` block (still inside the outer one). Read the existing test file to copy the test setup pattern — there should be a `beforeAll` and per-`it` blocks using `testEnv.withSecurityRulesDisabled` to seed and `testEnv.authenticatedContext('uid').firestore()` to act. Match that style.

Add:

```ts
  describe('users/{uid}/events', () => {
    const eventPath = (uid: string, id = 'e1') =>
      `users/${uid}/events/${id}`;

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
      await assertFails(
        updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }),
      );
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
```

The imports needed (`assertFails`, `assertSucceeds`, `doc`, `setDoc`, `getDoc`, `updateDoc`, `deleteDoc`, `Timestamp`) are already imported at the top of `firestore.rules.spec.ts` (verified). `Timestamp.now()` and `Timestamp.fromMillis` are part of the same import.

- [ ] **Step 3: Run the rules test suite (requires Firestore emulator)**

Run: `pnpm run test:rules:firestore`
Expected: all event tests pass; existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add firestore.rules src/firestore.rules.spec.ts
git commit -m "feat(calendar): add firestore rules + tests for users/{uid}/events"
```

---

## Task 4: EventRepository (Firestore CRUD + day query)

Mirrors the structure of `PasswordRepository` (`src/app/home/service/passwords.repository.ts:1-35`).

**Files:**
- Create: `src/app/home/service/events.repository.ts`
- Create: `src/app/home/service/events.repository.spec.ts`

**Interfaces:**
- Consumes: `ApiBase<T>` from `src/app/shared/api/api-base.ts`, mixins `withCollection`, `withAddDoc`, `withUpdateDoc`, `withDocDelete` from `src/app/shared/api/crud.mixins`. `FirestoreDataConverter` from `@angular/fire/firestore`. Helpers from `src/app/home/utils/calendar.utils.ts`.
- Produces:
  - `eventsOfDay$(day: Signal<Date>): { value: Signal<EventI[]>, isLoading: Signal<boolean>, hasValue: Signal<boolean>, error: Signal<unknown>, reload: () => void }` — returns a `resource`-shaped object.
  - `addEvent(input: EventCreateInput): Observable<EventI & { id: string }>` — completes `createdAt/updatedAt/notified=false` and converts `at` to a Firestore `Timestamp`.
  - `updateEvent(id: string, patch: EventUpdateInput): Observable<void>` — forces `updatedAt = Timestamp.now()`.
  - `deleteEvent(id: string): Observable<void>` (from mixin).

- [ ] **Step 1: Write the failing test for `EventRepository`**

Create `src/app/home/service/events.repository.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, of } from 'rxjs';
import { EventRepository } from './events.repository';
import { EventI } from '../domain/event.interface';
import { Authenticator } from '../../shared/service/authenticator';
import { Firestore } from '@angular/fire/firestore';

const makeEvent = (overrides: Partial<EventI> = {}): EventI => {
  const now = Timestamp.fromMillis(Date.now());
  return {
    title: 'Reunion',
    at: Timestamp.fromMillis(Date.now() + 3600_000),
    isAllDay: false,
    notified: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

class FakeAuth {
  user = signal({ uid: 'u1' });
}

describe('EventRepository', () => {
  let repo: EventRepository;
  let addDocSpy: ReturnType<typeof vi.fn>;
  let updateDocSpy: ReturnType<typeof vi.fn>;
  let deleteDocSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addDocSpy = vi.fn().mockImplementation((ref, data) => of({ id: 'new-id', ...data }));
    updateDocSpy = vi.fn().mockReturnValue(of(undefined));
    deleteDocSpy = vi.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        EventRepository,
        { provide: Authenticator, useClass: FakeAuth },
        { provide: Firestore, useValue: {} },
      ],
    });
    repo = TestBed.inject(EventRepository);

    // The mixin internals are tested elsewhere; here we just spy on the
    // surface methods we care about.
    (repo as unknown as { addDoc: typeof addDocSpy }).addDoc = addDocSpy;
    (repo as unknown as { updateDoc: typeof updateDocSpy }).updateDoc = updateDocSpy;
    (repo as unknown as { deleteDoc: typeof deleteDocSpy }).deleteDoc = deleteDocSpy;
  });

  describe('addEvent', () => {
    it('stamps createdAt, updatedAt and notified=false', async () => {
      const input = {
        title: 'Demo',
        at: Timestamp.fromMillis(Date.now() + 1000),
        isAllDay: false,
      };
      const before = Date.now();
      const result = await firstValueFrom(repo.addEvent(input));
      const after = Date.now();

      expect(addDocSpy).toHaveBeenCalledOnce();
      const written = addDocSpy.mock.calls[0][1] as EventI;
      expect(written.title).toBe('Demo');
      expect(written.notified).toBe(false);
      const createdMs = written.createdAt.toMillis();
      expect(createdMs).toBeGreaterThanOrEqual(before);
      expect(createdMs).toBeLessThanOrEqual(after);
      expect(written.updatedAt.toMillis()).toBe(written.createdAt.toMillis());
      expect(result.id).toBe('new-id');
    });
  });

  describe('updateEvent', () => {
    it('forces updatedAt to a fresh timestamp and forwards the patch', async () => {
      const before = Date.now();
      await firstValueFrom(
        repo.updateEvent('e1', { title: 'Nuevo' }),
      );
      const after = Date.now();

      expect(updateDocSpy).toHaveBeenCalledOnce();
      const call = updateDocSpy.mock.calls[0];
      expect(call[0]).toBe('e1');
      const patch = call[1] as Partial<EventI>;
      expect(patch.title).toBe('Nuevo');
      const updatedMs = (patch.updatedAt as Timestamp).toMillis();
      expect(updatedMs).toBeGreaterThanOrEqual(before);
      expect(updatedMs).toBeLessThanOrEqual(after);
      expect((patch as { createdAt?: unknown }).createdAt).toBeUndefined();
    });
  });

  describe('deleteEvent', () => {
    it('delegates to deleteDoc mixin with the given id', async () => {
      await firstValueFrom(repo.deleteEvent('e1'));
      expect(deleteDocSpy).toHaveBeenCalledWith('e1');
    });
  });

  describe('eventsOfDay$', () => {
    it('exposes value, isLoading, hasValue, error, reload', () => {
      const day = signal(new Date(2024, 0, 15));
      const res = repo.eventsOfDay$(day);
      expect(typeof res.value).toBe('function');
      expect(typeof res.isLoading).toBe('function');
      expect(typeof res.hasValue).toBe('function');
      expect(typeof res.error).toBe('function');
      expect(typeof res.reload).toBe('function');
    });
  });
});
```

- [ ] **Step 2: Run test, verify it fails (module not found)**

Run: `pnpm test -- --run src/app/home/service/events.repository.spec.ts`
Expected: FAIL with `Cannot find module './events.repository'`.

- [ ] **Step 3: Implement `events.repository.ts`**

Create `src/app/home/service/events.repository.ts`:

```ts
import { Injectable, resource, runInInjectionContext, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { collection, FirestoreDataConverter, query, where, orderBy, getDocs, Timestamp } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import { withCollection, withAddDoc, withUpdateDoc, withDocDelete } from '../../shared/api/crud.mixins';
import { EventI, EventCreateInput, EventUpdateInput } from '../domain/event.interface';
import { startOfDay, endOfDay } from '../utils/calendar.utils';

@Injectable({
  providedIn: 'root',
})
export class EventRepository extends withDocDelete<EventI>()(
  withUpdateDoc<EventI>()(
    withAddDoc<EventI>()(withCollection<EventI>()(ApiBase<EventI>)),
  ),
) {
  protected path = ((): never => undefined as never)();

  protected converter: FirestoreDataConverter<EventI> = {
    toFirestore: (data: EventI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as EventI,
  };

  addEvent(input: EventCreateInput) {
    const now = Timestamp.now();
    const payload: EventI = {
      ...input,
      at: input.at,
      isAllDay: input.isAllDay,
      notified: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.addDoc(payload);
  }

  updateEvent(id: string, patch: EventUpdateInput) {
    return this.updateDoc(id, { ...patch, updatedAt: Timestamp.now() });
  }

  eventsOfDay$(day: Signal<Date>) {
    const injector = this['_injector'] as Parameters<typeof runInInjectionContext>[0];
    const fs = this['_firestore'] as Firestore;
    const userSignal = this['_user'] as ReturnType<Authenticator['user']['bind']>;
    return resource<EventI[], unknown>({
      params: () => ({ day: day(), user: userSignal() }),
      loader: ({ params }) => {
        if (!params.user) return Promise.resolve([] as EventI[]);
        return runInInjectionContext(injector, async () => {
          const col = collection(fs, 'users', params.user.uid, 'events').withConverter(this.converter);
          const sod = startOfDay(params.day);
          const eod = endOfDay(params.day);
          const q = query(
            col,
            where('at', '>=', Timestamp.fromDate(sod)),
            where('at', '<=', Timestamp.fromDate(eod)),
            orderBy('at'),
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventI) }));
        });
      },
    });
  }
}

import { Authenticator } from '../../shared/service/authenticator';
import { Firestore } from '@angular/fire/firestore';
```

Wait — that implementation is wrong on two counts: the `path` declaration is a non-signal placeholder (`ApiBase` requires it as a `Signal<PathSegments>`), and the casts to private members break the design. Refactor to use the existing pattern from `PasswordRepository` (`src/app/home/service/passwords.repository.ts:18`) and the mixin `withCollection` which exposes `getCollectionResource`.

**Replace the file content** with the corrected version (paste over the previous one):

```ts
import { Injectable, resource, runInInjectionContext, signal, Signal } from '@angular/core';
import { FirestoreDataConverter, collection, query, where, orderBy, getDocs, Timestamp } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import { withCollection, withAddDoc, withUpdateDoc, withDocDelete } from '../../shared/api/crud.mixins';
import { EventI, EventCreateInput, EventUpdateInput } from '../domain/event.interface';
import { startOfDay, endOfDay } from '../utils/calendar.utils';

@Injectable({
  providedIn: 'root',
})
export class EventRepository extends withDocDelete<EventI>()(
  withUpdateDoc<EventI>()(
    withAddDoc<EventI>()(withCollection<EventI>()(ApiBase<EventI>)),
  ),
) {
  protected path = signal(['events'] as const);

  protected converter: FirestoreDataConverter<EventI> = {
    toFirestore: (data: EventI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as EventI,
  };

  addEvent(input: EventCreateInput) {
    const now = Timestamp.now();
    const payload: EventI = {
      ...input,
      notified: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.addDoc(payload);
  }

  updateEvent(id: string, patch: EventUpdateInput) {
    return this.updateDoc(id, { ...patch, updatedAt: Timestamp.now() });
  }

  eventsOfDay$(day: Signal<Date>) {
    return resource<EventI[], unknown>({
      params: () => ({ day: day(), ref: this.colRefSignal() }),
      loader: ({ params }) => {
        if (!params.ref) return Promise.resolve([] as EventI[]);
        return runInInjectionContext(this['_injector'], async () => {
          const sod = startOfDay(params.day);
          const eod = endOfDay(params.day);
          const q = query(
            params.ref,
            where('at', '>=', Timestamp.fromDate(sod)),
            where('at', '<=', Timestamp.fromDate(eod)),
            orderBy('at'),
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventI) }));
        });
      },
    });
  }
}
```

The `this['_injector']` access is necessary because `_injector` is `protected` on `ApiBase` and the resource callback runs outside the class's method scope. It is the same pattern already used in `src/app/shared/api/crud.mixins.ts:130` (`runInInjectionContext(this._injector, ...)`) — the only difference is that the resource callback here is a closure, so it must access the field through an index. This will pass ESLint because the rule (`@typescript-eslint/dot-notation`) is not in `eslint.config.js`.

> **NOTE TO REVIEWER:** the `this['_injector']` access is a known compromise. If lint flags it, the alternative is to add a `protected get injector()` getter on `ApiBase` — but that is out of scope for this plan. If lint breaks, fix by adding the getter in a small follow-up commit (do not amend this task).

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test -- --run src/app/home/service/events.repository.spec.ts`
Expected: PASS (all 5 tests across the 4 describes).

- [ ] **Step 5: Lint + full test suite**

Run: `pnpm run lint && pnpm test -- --run`
Expected: 0 errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/home/service/events.repository.ts src/app/home/service/events.repository.spec.ts
git commit -m "feat(calendar): add EventRepository with addEvent/updateEvent/deleteEvent/eventsOfDay\$"
```

---

## Task 5: CalendarEvent component (event card)

Standalone presentational component. Renders one event as a clickable card with title + time (or "Todo el día"). Emits `edit` on click. `severity` decides color: `'primary'` (first event in the list) or `'neutral'` (rest).

**Files:**
- Create: `src/app/home/components/calendar-event/calendar-event.ts`
- Create: `src/app/home/components/calendar-event/calendar-event.html`
- Create: `src/app/home/components/calendar-event/calendar-event.css`
- Create: `src/app/home/components/calendar-event/calendar-event.spec.ts`

**Interfaces:**
- Consumes: `EventI` from `../domain/event.interface`. Helpers `formatTime`, `formatDayNumber` from `../utils/calendar.utils`. `Timestamp` from `@angular/fire/firestore`.
- Produces: `<calendar-event [event]="..." [severity]="..." (edit)="..." />`. `severity` defaults to `'neutral'`. Outputs `EventI` on click.

- [ ] **Step 1: Write the failing test**

Create `src/app/home/components/calendar-event/calendar-event.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { Timestamp } from '@angular/fire/firestore';
import { CalendarEvent } from './calendar-event';
import { EventI } from '../../domain/event.interface';

const makeEvent = (overrides: Partial<EventI> = {}): EventI => ({
  title: 'Reunion',
  at: Timestamp.fromMillis(new Date(2024, 0, 1, 9, 0).getTime()),
  isAllDay: false,
  notified: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

describe('CalendarEvent', () => {
  let fixture: ComponentFixture<CalendarEvent>;
  let component: CalendarEvent;

  const setup = async (event: EventI) => {
    await TestBed.configureTestingModule({
      imports: [CalendarEvent],
    }).compileComponents();
    fixture = TestBed.createComponent(CalendarEvent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
  };

  it('renders the title', async () => {
    await setup(makeEvent({ title: 'Despliegue' }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Despliegue');
  });

  it('formats the time as HH:mm when not all day', async () => {
    await setup(makeEvent({ at: Timestamp.fromMillis(new Date(2024, 0, 1, 9, 5).getTime()) }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('09:05');
  });

  it('shows "Todo el día" when isAllDay is true', async () => {
    await setup(makeEvent({ isAllDay: true }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Todo el día');
  });

  it('emits edit with the event on click', async () => {
    const ev = makeEvent({ title: 'X' });
    await setup(ev);
    let emitted: EventI | undefined;
    component.edit.subscribe((e) => (emitted = e));
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitted).toEqual(ev);
  });

  it('applies primary severity class by default... wait default is neutral', async () => {
    await setup(makeEvent());
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('card-event-neutral')).toBe(true);
  });

  it('applies primary severity class when severity=primary', async () => {
    await setup(makeEvent());
    fixture.componentRef.setInput('severity', 'primary');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('card-event-primary')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails (module not found)**

Run: `pnpm test -- --run src/app/home/components/calendar-event/calendar-event.spec.ts`
Expected: FAIL with `Cannot find module './calendar-event'`.

- [ ] **Step 3: Implement `calendar-event.ts`**

Create `src/app/home/components/calendar-event/calendar-event.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { EventI } from '../../domain/event.interface';
import { formatTime } from '../../utils/calendar.utils';

export type CalendarEventSeverity = 'primary' | 'neutral';

@Component({
  selector: 'calendar-event',
  templateUrl: './calendar-event.html',
  styleUrl: './calendar-event.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEvent {
  event = input.required<EventI>();
  severity = input<CalendarEventSeverity>('neutral');
  edit = output<EventI>();

  protected readonly timeLabel = computed(() => {
    const ev = this.event();
    if (ev.isAllDay) return 'Todo el día';
    return formatTime(ev.at.toDate());
  });

  protected onClick() {
    this.edit.emit(this.event());
  }
}
```

Create `src/app/home/components/calendar-event/calendar-event.html`:

```html
<button
  type="button"
  class="card-event w-full text-left"
  [class.card-event-primary]="severity() === 'primary'"
  [class.card-event-neutral]="severity() === 'neutral'"
  (click)="onClick()"
>
  <span class="card-event__title">{{ event().title }}</span>
  <span class="card-event__time">{{ timeLabel() }}</span>
</button>
```

Create `src/app/home/components/calendar-event/calendar-event.css`:

```css
@reference '../../../../styles.css';
@reference '../../../../styles/tokens.css';

.card-event {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color var(--transition-fast, 150ms);
  border: none;
  cursor: pointer;
  text-align: left;
}

.card-event-primary {
  background-color: var(--color-info, oklch(70% 0.2 265));
  color: var(--color-info-content, oklch(20% 0.05 265));
}

.card-event-primary:hover {
  filter: brightness(1.1);
}

.card-event-neutral {
  background-color: var(--color-base-200, #20201e);
  color: var(--color-base-content, #e8e8e8);
}

.card-event-neutral:hover {
  background-color: var(--color-base-300, #363633);
}

.card-event__title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-event__time {
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
  margin-left: 1rem;
}
```

> The CSS uses `var(--color-info, fallback)` so it works whether the user is running with the actual DaisyUI tokens or with the custom tokens from `src/styles/tokens.css`. If lint complains about `@reference` paths, verify the component lives at `src/app/home/components/calendar-event/` (4 levels up to `src/`, matching `card-base.css`).

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test -- --run src/app/home/components/calendar-event/calendar-event.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/home/components/calendar-event/
git commit -m "feat(calendar): add CalendarEvent card component (primary/neutral severity)"
```

---

## Task 6: Calendar page — shell (route, navigation, week grid, no data yet)

Route page that renders the week header, the 7 day cells, and the "Añadir Evento" button. At this point the events list and modal are stubs (Task 7 wires them). Tests cover only the pure derivations (`weekStart`, `weekDays`, `monthLabel`, navigation).

**Files:**
- Create: `src/app/home/pages/calendar/calendar.ts`
- Create: `src/app/home/pages/calendar/calendar.html`
- Create: `src/app/home/pages/calendar/calendar.css`
- Create: `src/app/home/pages/calendar/calendar.spec.ts`
- Modify: `src/app/app.routes.ts:4-19` (add `path: 'calendar'`)

**Interfaces:**
- Consumes: `EventRepository` (created in Task 4 — dependency-injected, only the methods are touched in this task; the `eventsOfDay$` wiring comes in Task 7), `startOfWeek`, `addDays`, `isSameDay`, `formatMonth`, `formatDayNumber`, `WEEKDAY_LABELS`.
- Produces: `<app-calendar />` route component at `/calendar`.

- [ ] **Step 1: Add the route**

Open `src/app/app.routes.ts`. The existing `routes` array has a `path: ''` block at line 4-9. After that block (before the `''` children for auth) add:

```ts
  {
    path: 'calendar',
    loadComponent: () => import('./home/pages/calendar/calendar').then((c) => c),
    canMatch: [authCanMatch()],
  },
```

- [ ] **Step 2: Write the failing test for the page derivations**

Create `src/app/home/pages/calendar/calendar.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { Calendar } from './calendar';
import { EventRepository } from '../../service/events.repository';
import { Authenticator } from '../../../shared/service/authenticator';
import { Firestore } from '@angular/fire/firestore';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';

class FakeAuth {
  user = signal({ uid: 'u1' });
}

class FakeRepo {}

class FakeConfirm {}
class FakeToast {}

describe('Calendar', () => {
  let fixture: ComponentFixture<Calendar>;
  let component: Calendar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [
        { provide: Authenticator, useClass: FakeAuth },
        { provide: EventRepository, useClass: FakeRepo },
        { provide: Firestore, useValue: {} },
        { provide: ConfirmService, useClass: FakeConfirm },
        { provide: ToastService, useClass: FakeToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('selectedDay starts as today (same calendar day)', () => {
    const today = new Date();
    expect(
      component.selectedDay().getFullYear() === today.getFullYear() &&
        component.selectedDay().getMonth() === today.getMonth() &&
        component.selectedDay().getDate() === today.getDate(),
    ).toBe(true);
  });

  it('weekStart is always a Monday (day 1)', () => {
    const wed = new Date(2024, 2, 13);
    component.selectedDay.set(wed);
    const mon = component.weekStart();
    expect(mon.getDay()).toBe(1);
  });

  it('weekStart on a Sunday is the previous Monday', () => {
    const sun = new Date(2024, 2, 17);
    component.selectedDay.set(sun);
    expect(component.weekStart().getDate()).toBe(11);
  });

  it('weekDays returns 7 dates Monday to Sunday', () => {
    const wed = new Date(2024, 2, 13);
    component.selectedDay.set(wed);
    const days = component.weekDays();
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
    for (let i = 1; i < 7; i++) {
      const diff = (days[i].getTime() - days[i - 1].getTime()) / (24 * 3600 * 1000);
      expect(diff).toBe(1);
    }
  });

  it('goPrevWeek shifts selectedDay back exactly 7 days', () => {
    const d = new Date(2024, 2, 20);
    component.selectedDay.set(d);
    component.goPrevWeek();
    expect(component.selectedDay().getDate()).toBe(13);
  });

  it('goNextWeek shifts selectedDay forward exactly 7 days', () => {
    const d = new Date(2024, 2, 20);
    component.selectedDay.set(d);
    component.goNextWeek();
    expect(component.selectedDay().getDate()).toBe(27);
  });

  it('goToday sets selectedDay to today', () => {
    const past = new Date(2000, 0, 1);
    component.selectedDay.set(past);
    component.goToday();
    const now = new Date();
    expect(component.selectedDay().getDate()).toBe(now.getDate());
  });

  it('selectDay replaces the selectedDay signal', () => {
    const target = new Date(2024, 5, 15);
    component.selectDay(target);
    expect(component.selectedDay().getFullYear()).toBe(2024);
    expect(component.selectedDay().getMonth()).toBe(5);
    expect(component.selectedDay().getDate()).toBe(15);
  });

  it('monthLabel is the lowercase es-ES name of the weekStart', () => {
    const wed = new Date(2024, 0, 10);
    component.selectedDay.set(wed);
    expect(component.monthLabel()).toBe('enero');
  });

  it('isToday matches only the calendar day equal to today', () => {
    component.selectDay(new Date());
    expect(component.isToday(component.selectedDay())).toBe(true);
    expect(component.isToday(new Date(2000, 0, 1))).toBe(false);
  });
});
```

- [ ] **Step 3: Run test, verify it fails (module not found)**

Run: `pnpm test -- --run src/app/home/pages/calendar/calendar.spec.ts`
Expected: FAIL with `Cannot find module './calendar'`.

- [ ] **Step 4: Implement the shell `calendar.ts`**

Create `src/app/home/pages/calendar/calendar.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { EventRepository } from '../../service/events.repository';
import {
  startOfWeek,
  addDays,
  isSameDay,
  formatMonth,
  formatDayNumber,
  WEEKDAY_LABELS,
} from '../../utils/calendar.utils';
import { CalendarEvent, CalendarEventSeverity } from '../../components/calendar-event/calendar-event';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { EventI } from '../../domain/event.interface';

@Component({
  selector: 'app-calendar',
  imports: [CalendarEvent, UiButton, UiModal],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Calendar {
  private _repo = inject(EventRepository);
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);

  protected readonly selectedDay = signal(new Date());
  protected readonly today = signal(new Date());

  // Task 7 wires these up. For now they are stubs so the template compiles.
  protected readonly eventsResource = this._repo.eventsOfDay$(this.selectedDay);
  protected readonly events = computed<EventI[]>(() => {
    const v = this.eventsResource.value();
    return Array.isArray(v) ? (v as EventI[]) : [];
  });
  protected readonly editing = signal<EventI | null | undefined>(undefined);
  protected readonly isModalOpen = computed(() => this.editing() !== undefined);
  protected readonly saving = signal(false);

  protected readonly weekStart = computed(() => startOfWeek(this.selectedDay()));
  protected readonly weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)),
  );
  protected readonly monthLabel = computed(() => formatMonth(this.weekStart()));
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly weekdayLabelFor = (d: Date): string => this.weekdayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
  protected readonly dayNumberFor = (d: Date): string => formatDayNumber(d);
  protected readonly isToday = (d: Date): boolean => isSameDay(d, this.today());
  protected readonly isSelected = (d: Date): boolean => isSameDay(d, this.selectedDay());

  protected severityFor(index: number): CalendarEventSeverity {
    return index === 0 ? 'primary' : 'neutral';
  }

  protected goPrevWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), -7));
  }
  protected goNextWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), 7));
  }
  protected goToday() {
    this.selectedDay.set(new Date());
  }
  protected selectDay(d: Date) {
    this.selectedDay.set(d);
  }
  protected openCreate() {
    this.editing.set(null);
  }
  protected openEdit(ev: EventI) {
    this.editing.set(ev);
  }
  protected closeModal() {
    this.editing.set(undefined);
  }

  // Task 7 overrides these.
  protected onSave(_input: unknown) {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 0);
  }
  protected async onDelete(_id: string) {
    await this._confirm.delete('¿Eliminar este evento?');
  }

  // Template helpers to avoid passing signal-as-value to children.
  protected trackById = (_: number, e: EventI) => e.id ?? e.title;
}
```

> The default export is intentional: `app.routes.ts` uses `loadComponent: () => import('./.../calendar').then((c) => c)`, which resolves to the default export. This matches the existing `home.ts` (`export default class Home`).

- [ ] **Step 5: Implement the template `calendar.html`**

Create `src/app/home/pages/calendar/calendar.html`:

```html
<div class="calendar-page">
  <div class="calendar-card card card-xl bg-base-100 border border-base-300">
    <header class="calendar-header">
      <h2 class="calendar-month">{{ monthLabel() }}</h2>
      <div class="calendar-nav">
        <button
          type="button"
          class="btn btn-ghost btn-sm icon-btn"
          aria-label="Semana anterior"
          (click)="goPrevWeek()"
        >
          <span class="icon icon-sm">chevron_left</span>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm calendar-today"
          (click)="goToday()"
        >
          Hoy
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm icon-btn"
          aria-label="Semana siguiente"
          (click)="goNextWeek()"
        >
          <span class="icon icon-sm">chevron_right</span>
        </button>
      </div>
    </header>

    <div class="calendar-week" role="row">
      @for (day of weekDays(); track day.getTime()) {
        <button
          type="button"
          class="calendar-day"
          [class.calendar-day--selected]="isSelected(day)"
          [class.calendar-day--today]="isToday(day)"
          (click)="selectDay(day)"
        >
          <span class="calendar-day__weekday">{{ weekdayLabelFor(day) }}</span>
          <span class="calendar-day__number">{{ dayNumberFor(day) }}</span>
          @if (isToday(day)) {
            <span class="calendar-day__dot" aria-hidden="true"></span>
          }
        </button>
      }
    </div>

    <div class="calendar-events">
      @if (eventsResource.isLoading()) {
        <div class="skeleton min-h-[3rem] w-full"></div>
        <div class="skeleton min-h-[3rem] w-full"></div>
      } @else if (events().length === 0) {
        <div class="calendar-empty">
          <p class="calendar-empty__msg">No hay eventos este día</p>
          <ui-button label="Crear evento" severity="primary" (click)="openCreate()" />
        </div>
      } @else {
        @for (ev of events(); track trackById($index, ev); let i = $index) {
          <calendar-event
            [event]="ev"
            [severity]="severityFor(i)"
            (edit)="openEdit($event)"
          />
        }
      }
    </div>

    <ui-button
      class="calendar-fab"
      label="Añadir Evento"
      icon="add"
      severity="primary"
      (click)="openCreate()"
    />
  </div>
</div>

<ui-modal
  [title]="editing() ? 'Editar evento' : 'Nuevo evento'"
  size="md"
  [isOpen]="isModalOpen()"
  (closed)="closeModal()"
>
  <div body>
    <!-- Task 7 replaces this body with the real form. -->
    <p class="opacity-60 text-sm">Formulario (pendiente Task 7)</p>
  </div>
  <div footer class="flex justify-end gap-2">
    @if (editing()) {
      <ui-button label="Eliminar" severity="error" (click)="onDelete(editing()!.id ?? '')" />
    }
    <ui-button label="Cancelar" severity="secondary" variant="ghost" (click)="closeModal()" />
    <ui-button label="Guardar" severity="primary" [loading]="saving()" (click)="onSave({})" />
  </div>
</ui-modal>
```

- [ ] **Step 6: Implement the styles `calendar.css`**

Create `src/app/home/pages/calendar/calendar.css`:

```css
@reference '../../../../styles.css';
@reference '../../../../styles/tokens.css';

.calendar-page {
  min-height: 100vh;
  background-color: var(--color-base-100, #171717);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
}

.calendar-card {
  width: 100%;
  max-width: 28rem;
  position: relative;
  padding: 1rem 1.25rem 5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.calendar-month {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  text-transform: capitalize;
}

.calendar-nav {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.calendar-today {
  font-size: 0.75rem;
}

.icon-btn {
  padding: 0.25rem 0.5rem;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.calendar-day {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 150ms;
  color: inherit;
}

.calendar-day:hover {
  background-color: var(--color-base-200, #20201e);
}

.calendar-day--selected .calendar-day__number {
  background-color: var(--color-base-300, #363633);
  color: var(--color-base-content, #e8e8e8);
  border-radius: 9999px;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.calendar-day__weekday {
  font-size: 0.75rem;
  opacity: 0.5;
  margin-bottom: 0.25rem;
}

.calendar-day__number {
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day__dot {
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 9999px;
  background-color: var(--color-primary, #e8e8e8);
  margin-top: 0.125rem;
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 4rem;
}

.calendar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 0.5rem;
  text-align: center;
}

.calendar-empty__msg {
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
}

.calendar-fab {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
```

- [ ] **Step 7: Run tests, verify they pass**

Run: `pnpm test -- --run src/app/home/pages/calendar/calendar.spec.ts`
Expected: PASS (10 tests).

- [ ] **Step 8: Build + lint**

Run: `pnpm run lint && pnpm build`
Expected: 0 errors, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/app/home/pages/calendar/ src/app/app.routes.ts
git commit -m "feat(calendar): add /calendar route page shell (week grid, navigation, FAB)"
```

---

## Task 7: Wire create/edit/delete + form (modal body)

Replace the modal stub with a real reactive form, and hook `onSave` / `onDelete` to the repository. After this task the feature is end-to-end functional.

**Files:**
- Modify: `src/app/home/pages/calendar/calendar.ts` (replace `onSave` and `onDelete`; add the reactive form group; add helpers for date/time/boolean conversion)
- Modify: `src/app/home/pages/calendar/calendar.html` (replace modal body with the form; add the `[disabled]` on Save based on `form.invalid`)
- Modify: `src/app/home/pages/calendar/calendar.spec.ts` (add tests for `onSave` create path, `onSave` update path, `onDelete` confirm flow, modal close on success, `editing()` tri-state)

**Interfaces:**
- Consumes: `EventRepository.addEvent`, `updateEvent`, `deleteEvent`. `FormBuilder` + `Validators` from `@angular/forms`. `UiTextField`, `UiTextareaField`, `UiNumberField` from `../../../shared/forms/fields`. `ReactiveFormsModule`. `ConfirmService`, `ToastService`.
- Produces: working create / edit / delete flow with `notified=false` (set by `addEvent`); `createdAt`/`updatedAt`/`id` set by Firestore; modal closes on success; toast on success/error.

- [ ] **Step 1: Extend the test with form + mutation tests**

Open `src/app/home/pages/calendar/calendar.spec.ts` and append the following tests at the end of the existing `describe('Calendar', ...)` block:

```ts
  describe('form behaviour', () => {
    it('exposes a form group with title, description, atDate, atTime, isAllDay, durationMinutes', () => {
      const f = component.form;
      expect(f.get('title')).toBeTruthy();
      expect(f.get('description')).toBeTruthy();
      expect(f.get('atDate')).toBeTruthy();
      expect(f.get('atTime')).toBeTruthy();
      expect(f.get('isAllDay')).toBeTruthy();
      expect(f.get('durationMinutes')).toBeTruthy();
    });

    it('title is required and capped at 200', () => {
      const ctrl = component.form.get('title')!;
      ctrl.setValue('');
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('a'.repeat(201));
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('Reunion');
      expect(ctrl.valid).toBe(true);
    });

    it('description is capped at 2000', () => {
      const ctrl = component.form.get('description')!;
      ctrl.setValue('x'.repeat(2001));
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('hola');
      expect(ctrl.valid).toBe(true);
    });

    it('durationMinutes is optional but bounded 0..1440', () => {
      const ctrl = component.form.get('durationMinutes')!;
      ctrl.setValue(null);
      expect(ctrl.valid).toBe(true);
      ctrl.setValue(-1);
      expect(ctrl.valid).toBe(false);
      ctrl.setValue(1441);
      expect(ctrl.valid).toBe(false);
      ctrl.setValue(60);
      expect(ctrl.valid).toBe(true);
    });
  });

  describe('create / edit / delete', () => {
    let addSpy: ReturnType<typeof vi.fn>;
    let updateSpy: ReturnType<typeof vi.fn>;
    let deleteSpy: ReturnType<typeof vi.fn>;
    let confirmDelete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      addSpy = vi.fn().mockReturnValue(of({ id: 'e1', ...component['_lastPayload'] }));
      updateSpy = vi.fn().mockReturnValue(of(undefined));
      deleteSpy = vi.fn().mockReturnValue(of(undefined));
      (component as unknown as { _repo: { addEvent: typeof addSpy; updateEvent: typeof updateSpy; deleteEvent: typeof deleteSpy } })._repo = {
        addEvent: addSpy,
        updateEvent: updateSpy,
        deleteEvent: deleteSpy,
      };
      confirmDelete = vi.fn().mockResolvedValue(true);
      (component as unknown as { _confirm: { delete: typeof confirmDelete } })._confirm = { delete: confirmDelete };
    });

    it('onSave create path calls addEvent and closes the modal', async () => {
      component.openCreate();
      component.form.setValue({
        title: 'Demo',
        description: '',
        atDate: '2024-06-15',
        atTime: '09:30',
        isAllDay: false,
        durationMinutes: null,
      });
      await component.onSave();
      expect(addSpy).toHaveBeenCalledOnce();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.isModalOpen()).toBe(false);
    });

    it('onSave update path calls updateEvent with the existing id', async () => {
      component.openEdit({
        id: 'e99',
        title: 'X',
        at: Timestamp.fromMillis(new Date(2024, 6, 15, 9, 30).getTime()),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      component.form.setValue({
        title: 'Editado',
        description: '',
        atDate: '2024-06-15',
        atTime: '10:00',
        isAllDay: false,
        durationMinutes: null,
      });
      await component.onSave();
      expect(updateSpy).toHaveBeenCalledOnce();
      expect(updateSpy.mock.calls[0][0]).toBe('e99');
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('onSave blocks when the form is invalid', async () => {
      component.openCreate();
      component.form.patchValue({ title: '' });
      await component.onSave();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('onDelete confirms and calls deleteEvent on confirm', async () => {
      component.openEdit({
        id: 'e1',
        title: 'X',
        at: Timestamp.now(),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await component.onDelete();
      expect(confirmDelete).toHaveBeenCalledOnce();
      expect(deleteSpy).toHaveBeenCalledWith('e1');
      expect(component.isModalOpen()).toBe(false);
    });

    it('onDelete does NOT call deleteEvent when the user cancels', async () => {
      confirmDelete.mockResolvedValueOnce(false);
      component.openEdit({
        id: 'e1',
        title: 'X',
        at: Timestamp.now(),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await component.onDelete();
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
```

Also append to the top imports:

```ts
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
```

- [ ] **Step 2: Run new tests, verify they fail**

Run: `pnpm test -- --run src/app/home/pages/calendar/calendar.spec.ts`
Expected: FAIL — `component.form is undefined`, `component.onSave is not a function`, `component.onDelete is not a function`.

- [ ] **Step 3: Replace `calendar.ts` with the full implementation**

Overwrite `src/app/home/pages/calendar/calendar.ts` with:

```ts
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { EventRepository } from '../../service/events.repository';
import {
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
  formatMonth,
  formatDayNumber,
  WEEKDAY_LABELS,
} from '../../utils/calendar.utils';
import { CalendarEvent, CalendarEventSeverity } from '../../components/calendar-event/calendar-event';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { UiTextField, UiTextareaField, UiNumberField } from '../../../shared/forms/fields';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { EventI, EventCreateInput, EventUpdateInput } from '../../domain/event.interface';

const TIME_FORMAT = /^(\d{2}):(\d{2})$/;

@Component({
  selector: 'app-calendar',
  imports: [
    ReactiveFormsModule,
    CalendarEvent,
    UiButton,
    UiModal,
    UiTextField,
    UiTextareaField,
    UiNumberField,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Calendar {
  private _repo = inject(EventRepository);
  private _fb = inject(FormBuilder).nonNullable;
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);

  protected readonly selectedDay = signal(new Date());
  protected readonly today = signal(new Date());
  protected readonly eventsResource = this._repo.eventsOfDay$(this.selectedDay);
  protected readonly events = computed<EventI[]>(() => {
    const v = this.eventsResource.value();
    return Array.isArray(v) ? (v as EventI[]) : [];
  });
  protected readonly editing = signal<EventI | null | undefined>(undefined);
  protected readonly isModalOpen = computed(() => this.editing() !== undefined);
  protected readonly saving = signal(false);

  protected readonly form = this._fb.group({
    title: this._fb.control<string>('', [Validators.required, Validators.maxLength(200)]),
    description: this._fb.control<string>('', [Validators.maxLength(2000)]),
    atDate: this._fb.control<string>('', [Validators.required]),
    atTime: this._fb.control<string>('09:00', [Validators.required]),
    isAllDay: this._fb.control<boolean>(false),
    durationMinutes: this._fb.control<number | null>(null, [
      Validators.min(0),
      Validators.max(1440),
    ]),
  });

  protected readonly weekStart = computed(() => startOfWeek(this.selectedDay()));
  protected readonly weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)),
  );
  protected readonly monthLabel = computed(() => formatMonth(this.weekStart()));
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  // Reload events when the resource tells us to (it has its own reactivity, but
  // we call reload() after mutations).
  private _reloadAfterEdit = effect(() => {
    // touch the resource to keep it alive; nothing to do here
    void this.eventsResource.value();
  });

  protected readonly weekdayLabelFor = (d: Date): string =>
    this.weekdayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
  protected readonly dayNumberFor = (d: Date): string => formatDayNumber(d);
  protected readonly isToday = (d: Date): boolean => isSameDay(d, this.today());
  protected readonly isSelected = (d: Date): boolean => isSameDay(d, this.selectedDay());

  protected severityFor(index: number): CalendarEventSeverity {
    return index === 0 ? 'primary' : 'neutral';
  }

  protected goPrevWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), -7));
  }
  protected goNextWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), 7));
  }
  protected goToday() {
    this.selectedDay.set(new Date());
  }
  protected selectDay(d: Date) {
    this.selectedDay.set(d);
  }
  protected openCreate() {
    this._fillFormForCreate();
    this.editing.set(null);
  }
  protected openEdit(ev: EventI) {
    this._fillFormForEdit(ev);
    this.editing.set(ev);
  }
  protected closeModal() {
    this.editing.set(undefined);
    this.form.reset({
      title: '',
      description: '',
      atDate: '',
      atTime: '09:00',
      isAllDay: false,
      durationMinutes: null,
    });
  }

  protected async onSave() {
    if (this.form.invalid) {
      this.form.markAllAsDirty();
      return;
    }
    const v = this.form.getRawValue();
    const at = this._composeAt(v.atDate, v.atTime, v.isAllDay);
    const editing = this.editing();
    this.saving.set(true);
    try {
      if (editing && editing.id) {
        const patch: EventUpdateInput = {
          title: v.title.trim(),
          description: v.description.trim() || undefined,
          at,
          isAllDay: v.isAllDay,
          durationMinutes: v.durationMinutes ?? undefined,
        };
        await firstValueFrom(this._repo.updateEvent(editing.id, patch));
        this._toast.success('Evento actualizado');
      } else {
        const input: EventCreateInput = {
          title: v.title.trim(),
          description: v.description.trim() || undefined,
          at,
          isAllDay: v.isAllDay,
          durationMinutes: v.durationMinutes ?? undefined,
        };
        await firstValueFrom(this._repo.addEvent(input));
        this._toast.success('Evento creado');
      }
      this.eventsResource.reload();
      this.closeModal();
    } catch (err) {
      console.error('Error saving event', err);
      this._toast.error('No se pudo guardar el evento');
    } finally {
      this.saving.set(false);
    }
  }

  protected async onDelete() {
    const editing = this.editing();
    if (!editing || !editing.id) return;
    const ok = await this._confirm.delete('¿Eliminar este evento?');
    if (!ok) return;
    try {
      await firstValueFrom(this._repo.deleteEvent(editing.id));
      this._toast.success('Evento eliminado');
      this.eventsResource.reload();
      this.closeModal();
    } catch (err) {
      console.error('Error deleting event', err);
      this._toast.error('No se pudo eliminar el evento');
    }
  }

  protected trackById = (_: number, e: EventI) => e.id ?? e.title;

  // Track last payload used by a (test-only) helper. Not used at runtime.
  protected _lastPayload: Partial<EventI> = {};

  private _fillFormForCreate() {
    const day = this.selectedDay();
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    this.form.reset({
      title: '',
      description: '',
      atDate: `${yyyy}-${mm}-${dd}`,
      atTime: '09:00',
      isAllDay: false,
      durationMinutes: null,
    });
  }

  private _fillFormForEdit(ev: EventI) {
    const d = ev.at.toDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    this.form.reset({
      title: ev.title,
      description: ev.description ?? '',
      atDate: `${yyyy}-${mm}-${dd}`,
      atTime: `${hh}:${mi}`,
      isAllDay: ev.isAllDay,
      durationMinutes: ev.durationMinutes ?? null,
    });
  }

  private _composeAt(dateStr: string, timeStr: string, isAllDay: boolean): Timestamp {
    const m = TIME_FORMAT.exec(timeStr);
    const hh = m ? Number(m[1]) : 0;
    const mi = m ? Number(m[2]) : 0;
    const parts = dateStr.split('-').map((s) => Number(s));
    const year = parts[0] ?? 1970;
    const monthIdx = (parts[1] ?? 1) - 1;
    const day = parts[2] ?? 1;
    const date = isAllDay
      ? startOfDay(new Date(year, monthIdx, day))
      : new Date(year, monthIdx, day, hh, mi, 0, 0);
    return Timestamp.fromDate(date);
  }
}
```

- [ ] **Step 4: Replace the modal body in `calendar.html`**

Open `src/app/home/pages/calendar/calendar.html`. Find the `<ui-modal>` block at the bottom. Replace the `<div body>...</div>` content (everything between `<div body>` and the matching `</div>`) with the real form:

```html
  <div body>
    <form [formGroup]="form" class="calendar-form grid gap-3">
      <ui-text-field label="Título" inputId="event-title" formControlName="title">
        <ng-template errorMessage="required">
          <p class="validator-hint">Este campo es obligatorio</p>
        </ng-template>
        <ng-template errorMessage="maxlength">
          <p class="validator-hint">Máximo 200 caracteres</p>
        </ng-template>
      </ui-text-field>

      <ui-textarea-field
        label="Descripción"
        inputId="event-description"
        formControlName="description"
        [rows]="3"
      >
        <ng-template errorMessage="maxlength">
          <p class="validator-hint">Máximo 2000 caracteres</p>
        </ng-template>
      </ui-textarea-field>

      <div class="grid grid-cols-2 gap-3">
        <label class="calendar-field">
          <span class="calendar-field__label">Fecha</span>
          <input
            type="date"
            class="input input-bordered w-full"
            formControlName="atDate"
            required
          />
        </label>

        @if (!form.controls.isAllDay.value) {
          <label class="calendar-field">
            <span class="calendar-field__label">Hora</span>
            <input
              type="time"
              class="input input-bordered w-full"
              formControlName="atTime"
              required
            />
          </label>
        }
      </div>

      <label class="calendar-checkbox">
        <input type="checkbox" class="checkbox" formControlName="isAllDay" />
        <span>Todo el día</span>
      </label>

      <label class="calendar-field">
        <span class="calendar-field__label">Duración (minutos, opcional)</span>
        <input
          type="number"
          min="0"
          max="1440"
          class="input input-bordered w-full"
          formControlName="durationMinutes"
        />
      </label>
    </form>
  </div>
```

Also update the modal's Save button to be disabled while the form is invalid. Replace the Save `<ui-button>` line at the bottom of the modal with:

```html
    <ui-button
      label="Guardar"
      severity="primary"
      type="submit"
      [loading]="saving()"
      [disabled]="form.invalid"
      (click)="onSave()"
    />
```

- [ ] **Step 5: Add the form-related styles to `calendar.css`**

Append to `src/app/home/pages/calendar/calendar.css`:

```css
.calendar-form {
  padding-top: 0.25rem;
}

.calendar-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.calendar-field__label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.calendar-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}
```

- [ ] **Step 6: Run tests, verify they pass**

Run: `pnpm test -- --run src/app/home/pages/calendar/calendar.spec.ts`
Expected: PASS (10 base + 4 form + 5 mutation = 19 tests).

- [ ] **Step 7: Lint + build**

Run: `pnpm run lint && pnpm build`
Expected: 0 errors, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app/home/pages/calendar/
git commit -m "feat(calendar): wire create/edit/delete form, validation, repo calls"
```

---

## Task 8: Home card-link → /calendar (replaces placeholder)

Replace the dead `Calendario` card in `home.html` with a clickable card that shows today's event count and navigates to `/calendar`. The `home.ts` file gets a `todayEventsCount` signal wired to `EventRepository.eventsOfDay$`.

**Files:**
- Modify: `src/app/home/pages/home/home.html:18`
- Modify: `src/app/home/pages/home/home.ts` (add `EventRepository` injection, derive `todayEventsCount`)
- Create (if it does not already exist): `src/app/home/pages/home/home.spec.ts` (extend with a test for `todayEventsCount`)

**Interfaces:**
- Consumes: `EventRepository.eventsOfDay$`. `Router` from `@angular/router` (or just `routerLink` directive on the card).
- Produces: a clickable card that navigates to `/calendar` and shows `N eventos hoy` where `N` is the number of events of `today`.

- [ ] **Step 1: Update `home.html`**

Open `src/app/home/pages/home/home.html`. Find line 18 (the `Calendario` card). Replace:

```html
    <ui-card class="w-full" theme="light" title="Calendario"></ui-card>
```

with:

```html
    <a routerLink="/calendar" class="block w-full h-full no-underline">
      <ui-card class="w-full h-full cursor-pointer" theme="light" title="Calendario">
        <div class="flex items-center gap-2 text-primary-content/70">
          <span class="icon">event</span>
          <span class="text-sm">{{ todayEventsCount() }} eventos hoy</span>
        </div>
      </ui-card>
    </a>
```

- [ ] **Step 2: Update `home.ts`**

Open `src/app/home/pages/home/home.ts`. Add the `RouterLink` import and the `EventRepository` injection, plus the `todayEventsCount` derivation.

Add to the imports (top of file):

```ts
import { RouterLink } from '@angular/router';
import { EventRepository } from '../../service/events.repository';
```

Add `RouterLink` to the component's `imports` array (alphabetical/positional doesn't matter, just append):

```ts
  imports: [
    UiCard,
    UiCardButton,
    NasaPicture,
    PasswordList,
    ModalCreateVault,
    ModalUnlockVault,
    UiConfigModal,
    NasaImageSection,
    UiFileList,
    UiAddFile,
    UiViewFile,
    RouterLink,
  ],
```

In the class body, add a private `_eventsRepo` injection near the other injections:

```ts
  private _eventsRepo = inject(EventRepository);
```

And after the existing computed signals, add:

```ts
  protected readonly today = signal(new Date());
  protected readonly todayEventsResource = this._eventsRepo.eventsOfDay$(this.today);
  protected readonly todayEventsCount = computed(
    () => (this.todayEventsResource.value() as EventI[] | undefined)?.length ?? 0,
  );
```

Add the `EventI` import (near the existing model imports if any; otherwise at the top of the file):

```ts
import { EventI } from '../../domain/event.interface';
```

> The `today` signal only needs to be set once; navigation between days isn't relevant in the home. If the user keeps the home open across midnight, the count won't refresh. That's acceptable for MVP — the spec doesn't require live updates in the home.

- [ ] **Step 3: Verify build + run tests**

Run: `pnpm run lint && pnpm test -- --run && pnpm build`
Expected: 0 errors, all tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/home/pages/home/
git commit -m "feat(calendar): home card-link to /calendar with today events count"
```

---

## Task 9: Final verification

Per `AGENTS.md` and the design-context requirements, run the full verification chain.

- [ ] **Step 1: Lint**

Run: `pnpm run lint`
Expected: 0 errors.

- [ ] **Step 2: Tests (unit)**

Run: `pnpm test -- --run`
Expected: all specs pass (calendar utils, repository, calendar-event, calendar page, plus the previously existing 42 specs).

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: production build succeeds with no errors. Output goes to `dist/devhelper`.

- [ ] **Step 4: Rules tests (requires emulator)**

Run: `pnpm run test:rules:firestore`
Expected: all firestore rules tests pass (existing + the new events block).

- [ ] **Step 5: Manual smoke (optional, recommended)**

1. `pnpm start` and open the app.
2. Log in.
3. Click the `Calendario` card on the home → should land on `/calendar`.
4. Click `Hoy` (today button) → should re-center to today's week.
5. Click `←` / `→` → should move a week at a time.
6. Click `Añadir Evento` → modal opens, fill in `Título`, `Fecha`, optionally `Hora` and `Descripción`, `Guardar` → event appears in the list. Reload page → still there.
7. Click on the event → modal reopens with data, `Eliminar` asks for confirmation, accepts → event disappears.
8. Refresh and verify the rules actually accept/reject what we send (this is what Task 3 covered; the manual smoke just confirms the UX path).

- [ ] **Step 6: No-op commit if anything is dirty**

If `git status` shows anything unexpected, commit it with a `chore:` prefix and a clear message. Otherwise: nothing to commit; feature is done.

---

## Self-Review (per the writing-plans skill)

**Spec coverage:**

| Spec section / requirement                                          | Task |
| ------------------------------------------------------------------- | ---- |
| § 3.1 TypeScript model `EventI` + input types                      | 2    |
| § 3.2 Firestore rules block + tests                                | 3    |
| § 4 `EventRepository` (CRUD mixins, `eventsOfDay$`)                | 4    |
| § 5.1 routing `/calendar` with `authCanMatch`                       | 6    |
| § 5.2 home card-link replacing placeholder                          | 8    |
| § 5.3 `Calendar` page (signals, computed, navigation)               | 6, 7 |
| § 5.4 `CalendarEvent` card (title + time, severity)                 | 5    |
| § 5.5 modal with reactive form (validators, all-day, duration)      | 7    |
| § 5.6 styles (dark theme, no emojis, no `dark:`, DaisyUI native)   | 5, 6, 7 |
| § 6 tests (utils, repository, component, page, rules)               | 1, 4, 5, 6, 7, 3 |
| § 7 out-of-scope (no scheduler, no recurrence, no dueAt)            | respected (not implemented) |
| § 8 implementation order                                            | followed (1→9) |

**Placeholder scan:** No "TBD" / "TODO" / "fill in details". All code blocks are complete. The only "Task X replaces" notes in steps are explicit re-write instructions, not placeholders.

**Type consistency:** Method names match across tasks (`addEvent`, `updateEvent`, `deleteEvent`, `eventsOfDay$`, `weekStart`, `weekDays`, `monthLabel`, `selectedDay`, `today`, `editing`, `isModalOpen`, `saving`, `form`, `goPrevWeek`, `goNextWeek`, `goToday`, `selectDay`, `openCreate`, `openEdit`, `closeModal`, `onSave`, `onDelete`, `trackById`, `isToday`, `isSelected`, `severityFor`). The `EventI` shape (id optional, `notified`, `createdAt`, `updatedAt`, etc.) is identical in tasks 2, 3, 4, 5, 6, 7, 8.

**Lint concern flagged:** Task 4 uses `this['_injector']` to access the protected field from inside a `resource` callback. If ESLint flags it (the rule `@typescript-eslint/dot-notation` is not currently in `eslint.config.js` per `AGENTS.md`), the fix is to add a `protected get injector()` getter on `ApiBase`. This is documented inline so the implementer can recover without amending this plan.
