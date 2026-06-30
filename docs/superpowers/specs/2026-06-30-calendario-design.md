# Calendario — Diseño

**Fecha:** 2026-06-30
**Estado:** aprobado (en revisión final del usuario)
**Alcance:** primera versión del calendario de eventos globales (CU-09)
**Ruta:** `/calendar`
**Path Firestore:** `users/{uid}/events/{eventId}`

## 0. Documentos relacionados

- [`docs/casos-de-uso.md`](../casos-de-uso.md) § 3.9 (CU-09) y § 6 (convenciones visuales).
- [`docs/estado-actual.md`](../estado-actual.md) § 3 (snapshot, "FALTA" en CU-09) y § 4.1/§ 4.7 (cambios necesarios — modelo de eventos y scheduler).
- [`docs/design-context.md`](../design-context.md) (tokens, componentes, anti-patterns, sistema de eventos).
- [`firestore.rules`](../../firestore.rules) (helpers, shape de `users/{uid}/passwords` como referencia).

## 1. Contexto y motivación

CU-09 (gestión de eventos / recordatorios) está marcado `FALTA` en `docs/estado-actual.md:131-138`. Es el caso de uso #9 de 11, prioridad **Importante** (ver `docs/casos-de-uso.md:47`). La card "Calendario" en `src/app/home/pages/home/home.html:18` es placeholder muerto. La ruta de Firestore `users/{uid}/events` no existe en `firestore.rules`.

Este diseño cubre la primera iteración del calendario. Los requisitos se acordaron con el usuario en sesión de brainstorming (ver § 2).

## 2. Decisiones cerradas

| #   | Decisión                          | Elección                                                   |
| --- | --------------------------------- | ---------------------------------------------------------- |
| 1   | Cifrado                           | Sin cifrado (title/description en claro)                   |
| 2   | Recurrencia                       | No, solo one-shot                                          |
| 3   | Eventos de día completo (`isAllDay`) | Sí (flag en el modelo)                                   |
| 4   | Eventos pasados                   | Se muestran todos los del día seleccionado, sin distinción |
| 5   | Notificaciones                    | No en MVP (solo el campo `notified` queda en el modelo)    |
| 6   | Formato hora                      | 24h (`es-ES`)                                              |
| 7   | Ubicación de la vista             | Ruta dedicada `/calendar`                                  |
| 8   | Edición de eventos                | Click en el card abre modal de edición                     |
| 9   | Indicador "hoy"                   | Punto pequeño bajo el número del día actual                |
| 10  | Días de mes vecino                | Misma intensidad que los del mes actual                    |
| 11  | Empty state de la lista           | "No hay eventos este día" + CTA "Crear evento"             |

## 3. Modelo de datos

### 3.1 TypeScript

`src/app/home/domain/event.interface.ts`:

```ts
import { Timestamp } from '@angular/fire/firestore';

export interface EventI {
  id?: string;
  title: string;             // 1..200
  description?: string;      // 0..2000
  at: Timestamp;             // inicio (UTC); la UI lo convierte a local
  isAllDay: boolean;         // true => at se interpreta como inicio del día en local
  durationMinutes?: number;  // 0..1440 (opcional)
  notified: boolean;         // false siempre en MVP
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventCreateInput = Omit<EventI, 'id' | 'createdAt' | 'updatedAt' | 'notified'>;
export type EventUpdateInput = Partial<Omit<EventI, 'id' | 'createdAt'>>;
```

### 3.2 Reglas de Firestore

Añadir a `firestore.rules` (después del bloque de `passwords`, antes de `vault`):

```rules
// Subcollection: users/{userId}/events
// Document ID: auto-generated
// Fields:
//   - title: string (required, 1..200)
//   - description?: string (optional, <= 2000)
//   - at: timestamp (required)
//   - isAllDay: bool (required)
//   - durationMinutes?: int (optional, 0..1440)
//   - notified: bool (required)
//   - createdAt: timestamp (required, immutable)
//   - updatedAt: timestamp (required)
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

La colección es queryable por `at` con `orderBy('at')` sin necesidad de índice compuesto (Firestore crea el índice single-field automáticamente).

## 4. Capa de servicios

`src/app/home/service/events.repository.ts` — patrón idéntico a `src/app/home/service/passwords.repository.ts:1-35`:

- `@Injectable({ providedIn: 'root' })`.
- Extiende `ApiBase<EventI>` con mixins `withCollection`, `withAddDoc`, `withUpdateDoc`, `withDocDelete`.
- `path = signal(['events'] as const)`.
- `converter: FirestoreDataConverter<EventI>`:
  - `toFirestore`: descarta `id`, mantiene el resto.
  - `fromFirestore`: `snap.data() as EventI`.
- Métodos públicos:
  - `addEvent(input: EventCreateInput): Observable<EventI & { id: string }>` — completa `createdAt = updatedAt = serverTimestamp()`, `notified = false`, normaliza `at = Timestamp.fromDate(input.at)`.
  - `updateEvent(id: string, patch: EventUpdateInput): Observable<void>` — fuerza `updatedAt = now`. `createdAt` se omite del patch (reglas lo exigen inmutable).
  - `deleteEvent(id: string): Observable<void>` — vía mixin.
  - `eventsOfDay$(day: Signal<Date>)` — `resource` reactivo; internamente construye un `query` con `where('at', '>=', startOfDay)` + `where('at', '<', endOfDay)` + `orderBy('at')`. Expone `reload()` para invalidar al volver de crear/editar.

No hay cifrado. No hay subclase `*Crypto`. No hay servicio paralelo tipo `EventsService`: el repo es el único punto de acceso a Firestore para esta entidad.

## 5. UI

### 5.1 Routing

`src/app/app.routes.ts` (después del bloque `path: ''` actual):

```ts
{
  path: 'calendar',
  loadComponent: () => import('./home/pages/calendar/calendar').then((c) => c),
  canMatch: [authCanMatch()],
}
```

Auth gate con el mismo `authCanMatch()` que ya usa `/`. El bloque `**` redirect se mantiene.

### 5.2 Card-link en el home (reemplaza el placeholder muerto)

`src/app/home/pages/home/home.html:18` — la celda `<ui-card class="w-full" theme="light" title="Calendario">` se reemplaza por:

```html
<ui-card
  class="w-full cursor-pointer"
  theme="light"
  title="Calendario"
  routerLink="/calendar"
>
  <div class="flex items-center gap-2 text-base-content/60">
    <span class="icon">event</span>
    <span>{{ todayEventsCount() }} eventos hoy</span>
  </div>
</ui-card>
```

`todayEventsCount()` se conecta en `home.ts` con un `resource` derivado de `EventRepository.eventsOfDay$(todaySignal)`. Si la cuenta es 0, mostrar "0 eventos hoy" (consistente con el resto de la UI; sin empty state especial aquí).

### 5.3 Componente `Calendar` (página)

`src/app/home/pages/calendar/calendar.ts` (standalone, OnPush, signals, `inject()`).

Estado:

- `selectedDay = signal(new Date())` — día visible, base de la lista.
- `today = signal(new Date())` — para el indicador "hoy".
- `editing = signal<EventI | null | undefined>(undefined)` — `undefined` modal cerrado, `null` crear, `EventI` editar.
- `isModalOpen = computed(() => this.editing() !== undefined)`.

Derivados:

- `weekStart = computed(() => startOfWeek(this.selectedDay(), { weekStartsOn: 1, locale: es }))` — lunes ISO de la semana (locale `es-ES`).
- `weekDays = computed(() => Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)))` — 7 fechas L→D.
- `monthLabel = computed(() => format(this.weekStart(), 'LLLL', { locale: es }))`.
- `eventsResource = this._repo.eventsOfDay$(this.selectedDay)`.

Acciones:

- `goPrevWeek()` / `goNextWeek()`: `this.selectedDay.set(addDays(this.selectedDay(), ±7))`.
- `goToday()`: `this.selectedDay.set(new Date())`.
- `selectDay(d: Date)`: `this.selectedDay.set(d)`.
- `openCreate()`: `this.editing.set(null)`.
- `openEdit(ev: EventI)`: `this.editing.set(ev)`.
- `onSave(input: EventCreateInput | EventUpdateInput)`: según `editing()` decidir add vs update; `eventsResource.reload()`; toast `success`; cerrar modal.
- `onDelete()`: `ConfirmService.delete('¿Eliminar este evento?')`; `deleteEvent`; `eventsResource.reload()`; toast.

### 5.4 Componente `CalendarEvent` (card de evento)

`src/app/home/components/calendar-event/calendar-event.ts`:

- `input.required<EventI>()` event.
- `input<'primary' | 'neutral'>()` severity (default `'neutral'`).
- `output<EventI>()` edit.
- Template: botón-card clickable. Título a la izquierda, hora formateada a la derecha (`format(event.at.toDate(), 'HH:mm', { locale: es })`). Si `isAllDay`, hora = `'Todo el día'`.
- `severity === 'primary'` aplica clases de "primer evento" (color de acento); `'neutral'` aplica `base-200`.

### 5.5 Modal crear/editar

Reusar `ui-modal` (`src/app/shared/components/ui-modal/`). Form:

- `ui-text-field` `title` (required, maxLength 200, validator `Validators.required` + `Validators.maxLength(200)`).
- `ui-textarea` `description` (maxLength 2000).
- `ui-date-field` `atDate` (requerido).
- `ui-time-field` `atTime` (visible solo si `!isAllDay`).
- `ui-checkbox` `isAllDay`.
- `ui-number-field` `durationMinutes` (min 0, max 1440, opcional).

Acciones del modal:

- `Cancelar` — `btn btn-ghost`. Cierra el modal sin guardar.
- `Eliminar` — `btn btn-error`. Solo visible en modo edición. Usa `ConfirmService.delete(...)` antes de invocar `onDelete()`.
- `Guardar` — `btn btn-primary` con `[loading]="state() === 'saving'"`. Al guardar construye `at = isAllDay ? startOfDay(date) : setTime(date, time)`, normaliza a `Timestamp.fromDate(...)`, llama `addEvent` o `updateEvent`.

### 5.6 Estilos (reglas de `design-context.md`)

- `bg-base-100` page background.
- `card card-xl` para el contenedor del widget.
- Header del widget: `flex justify-between items-center px-4 py-3`.
- Botones ← →: `btn btn-ghost btn-sm icon` con `icon-sm` Material Symbols (`chevron_left`, `chevron_right`).
- Celdas de día: `flex-1 flex flex-col items-center cursor-pointer hover:bg-base-200 rounded-md py-1 transition-colors`.
- Círculo de selección: `bg-base-300 rounded-full w-9 h-9 flex items-center justify-center font-medium`.
- Punto "hoy": `<span class="w-1 h-1 rounded-full bg-primary mt-0.5"></span>` debajo del número.
- "Añadir Evento +": `btn btn-primary absolute bottom-4 right-4 shadow-md`.
- Card de evento (severity neutral): `card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors p-3 flex justify-between items-center`.
- Card de evento (severity primary): igual, fondo `bg-info text-info-content`.
- Sin emojis, sin gradientes, sin `dark:` prefix, sin `@apply` que duplique DaisyUI nativo.

## 6. Pruebas (vitest)

`src/app/home/pages/calendar/calendar.spec.ts`:

- `weekStart` siempre es lunes aunque `selectedDay` sea domingo (regla ISO).
- `weekDays` devuelve 7 fechas en orden L→D.
- `monthLabel` cambia al cruzar el límite del mes (probar semana que incluye fin e inicio de mes).
- `goPrevWeek` / `goNextWeek` desplazan `selectedDay` exactamente 7 días.
- `eventsResource` se recarga al cambiar `selectedDay` (test con `fakeAsync` / fake firestore).

`src/app/home/components/calendar-event/calendar-event.spec.ts`:

- Click sobre el card emite `edit` con el evento.
- Renderiza título + hora en formato `HH:mm` cuando `!isAllDay`.
- Renderiza `'Todo el día'` cuando `isAllDay === true`.
- `severity === 'primary'` aplica clase de color accent; `'neutral'` aplica `base-200`.

`src/app/home/service/events.repository.spec.ts`:

- `addEvent` completa `createdAt`, `updatedAt`, `notified=false` aunque el input no los traiga.
- `updateEvent` fuerza `updatedAt = now`, no toca `createdAt`.
- `deleteEvent` borra el doc con el id dado.
- `eventsOfDay$` filtra por el día local (test inyectando un `Date` fijo, con fake clock si hace falta).

`firestore.rules` (suite ya existente en `pnpm run test:rules:firestore`): añadir tests para `users/{uid}/events` — create OK, update sin `createdAt` change, delete OK, denegado a no-owner, denegado si falta `at` o `notified`, denegado si `title` excede 200, denegado si `durationMinutes > 1440`.

## 7. Fuera de alcance

- Scheduler / Notification API. El campo `notified` se persiste siempre en `false`.
- Eventos recurrentes.
- Integración con tareas (CU-06) cuando estas existan con `dueAt`.
- Vista de mes expandido, vista de semana con columnas por día, vista de día detallado.
- Paginación en `eventsOfDay$` (un día tiene ≤ unos pocos eventos en MVP personal).
- Cifrado de `title` / `description`.
- Servicio `EventsService` separado del repository.
- Tests de Karma (vitest según `angular.json:83`).
- Indicador "vencido" en eventos pasados (acordado: no se distingue pasado vs futuro).

## 8. Orden de implementación

1. `src/app/home/domain/event.interface.ts` (modelo).
2. `firestore.rules` (bloque `events`) + test rules.
3. `src/app/home/service/events.repository.ts` + `events.repository.spec.ts`.
4. `src/app/home/components/calendar-event/calendar-event.{ts,html,spec.ts}` con datos hardcoded.
5. `src/app/home/pages/calendar/calendar.{ts,html,spec.ts}` shell: navegación, días, render estático.
6. Conectar `eventsOfDay$` y `editing` modal; verificar carga/guardado manual.
7. Modal crear/editar con form + validaciones.
8. Reemplazar placeholder `Calendario` en `home.html:18` por card-link.
9. Verificar: `pnpm run lint && pnpm test && pnpm build` (en este orden, ver `AGENTS.md`).
