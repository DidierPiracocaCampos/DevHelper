# M3 · Archivos globales

Repositorio de archivos compartidos. Subida, listado, descarga y borrado. Cifrado cliente con la vault key y bytes en subcollection de Firestore (chunks de 700 KB, max 5 MB por archivo). Sin Firebase Storage.

## Dependencias

- M7-T0 (ScopeContext + ApiBase reactivo).
- M7-T1 (filtro).
- M7-T2 (inputs en signals).
- M7-T3 (FileInputField + FileBlobService con chunks en Firestore).

## Alcance de M3

M3 cubre 2 niveles de scope, **independientes** (no jerárquicos):

| Nivel   | Path Firestore                                                                     | Uso en M3                          |
| ------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| global  | `users/{uid}/files/{fileId}`                                                       | Card "Archivos" del home           |
| issue   | `users/{uid}/proyectos/{projectId}/issues/{issueId}/files/{fileId}`                | Consumido por M1 (página de issue) |

M3-T1 sólo prueba el nivel `global` en el home. M1 montará el nivel `issue` más adelante reusando los mismos componentes.

---

## M3-T0 · Refactor de storage y scope (base para la UI)

Objetivo: dejar el modelo, los servicios, el scope y las reglas de Firestore listos para que `<ui-file-list>`/`ui-add-file`/`ui-view-file>` se apoyen sin más cambios estructurales. Cubre todo lo que NO es UI: modelo, paths, cifrado, scope, converter, reglas, tests.

### T0.1 Renombrar `type` → `mimeType` en `FileMetadataI`

- Archivo: `src/app/shared/files/models/file.model.ts`.
- Renombrar el campo `type` a `mimeType` en `FileMetadataI`.
- Mantener los demás campos (`name`, `size`, `chunkCount`, `updatedAt`, `encrypted?`, `iv?`).

### T0.2 Añadir `tags` y `createdAt` a `FileMetadataI`

```ts
export interface FileMetadataI {
  name: string;
  mimeType: string;
  size: number;
  chunkCount: number;
  updatedAt: number;
  encrypted?: boolean;
  iv?: string;          // base64
  tags: string[];       // [] por defecto
  createdAt: number;    // Date.now() al crear; inmutable en update
}
```

- `createdAt` se setea en `FileBlobService.computeMetadata` y NO se permite sobrescribir en update (regla de Firestore + helper en repo).

### T0.3 Extender `BlobNamespace`

- Archivo: `src/app/shared/files/models/blob-chunk.model.ts`.

```ts
export type BlobNamespace =
  | 'files'
  | `proyectos/${string}/issues/${string}/files`;
```

- `NasaImageRepository` mantiene su propio `namespace = 'nasa-image'` como tipo interno, sin entrar en este union (es público, sin scope).

### T0.4 `FileBlobService` con namespace dinámico

- Archivo: `src/app/shared/files/services/file-blob.service.ts`.
- Métodos afectados: `upload`, `getBytes`, `getObjectUrl`, `deleteFile`.
- Reemplazar las ramas `if (namespace === 'nasa-image')` por una construcción de path uniforme:

```ts
const segments = namespace.split('/') as PathSegments;
const docRef = doc(this.firestore, ...segments, fileId);
const chunksCol = collection(docRef, 'chunks');
```

- Constantes: `BLOB_CHUNK_SIZE = 700 * 1024`, `BLOB_MAX_FILE_SIZE = 5 * 1024 * 1024` (sin cambios).
- `computeMetadata(file)` ahora setea:
  - `mimeType: file.type || 'application/octet-stream'`
  - `tags: []`
  - `createdAt: Date.now()`
  - `updatedAt: Date.now()`
- `upload`:
  - Si recibe `encryptWith: CryptoKey`, cifra cada chunk con AES-GCM-256 + `iv` aleatorio por archivo.
  - `iv` se guarda en `FileMetadataI.iv` (base64).
  - `encrypted: true` si se cifró.
- `getBytes`:
  - Si la metadata tiene `encrypted === true`, requiere `key: CryptoKey` y descifra cada chunk antes de concatenar.
- `deleteFile`:
  - Borra todos los chunks en batch y luego el doc.

### T0.5 `FileRepository` scope-aware

- Archivo: `src/app/shared/files/services/file-repository.ts`.
- Inyecta `ScopeContext` y `Firestore`.
- `path` deja de ser `signal` y pasa a ser `computed`:

```ts
protected path = computed<PathSegments>(() => {
  const s = this._scope.scope();
  if (s === 'global') return ['files'];
  return ['proyectos', s.projectId, 'issues', s.issueId, 'files'];
});
```

- `withCollection.getCollectionResource` ya consume `this.colRefSignal()` y se re-evalúa automáticamente al cambiar `scope`.
- `converter` (Firestore → `FileMetadataI` y vuelta) usa los nombres `mimeType`, `tags`, `createdAt`, `updatedAt`.
- Namespace dinámico exportado como:

```ts
protected namespace = computed<BlobNamespace>(() => {
  const s = this._scope.scope();
  if (s === 'global') return 'files';
  return `proyectos/${s.projectId}/issues/${s.issueId}/files`;
});
```

- Métodos públicos: `addFile`, `deleteFile`, `getBytes`, `getObjectUrl`, todos delegan a `FileBlobService` con el namespace actual.

### T0.6 `NasaImageRepository` (sin scope)

- Archivo: `src/app/shared/files/services/nasa-image.repository.ts`.
- Sigue apuntando a `users/{uid}/nasa-image/{fileId}` (singular, sin scope).
- Actualizar el converter para usar `mimeType` en lugar de `type`.
- No usa cifrado (es público).

### T0.7 Extender `ScopeContext`

- Archivo: `src/app/shared/scope/scope-context.ts`.

```ts
export type Scope =
  | 'global'
  | { kind: 'issue'; projectId: string; issueId: string };

@Injectable({ providedIn: 'root' })
export class ScopeContext {
  readonly scope = signal<Scope>('global');
  setGlobal(): void { this.scope.set('global'); }
  setIssue(projectId: string, issueId: string): void {
    this.scope.set({ kind: 'issue', projectId, issueId });
  }
  readonly isGlobal = computed(() => this.scope() === 'global');
  readonly isIssue = computed(() => this.scope() !== 'global');
}
```

- Se elimina el estado `'project'` previo.
- M3-T1 siempre usa `setGlobal()` por defecto en home. M1 (fuera de M3) usará `setIssue(...)`.

### T0.8 `FileInputField` usa `mimeType`

- Archivo: `src/app/shared/files/file-input-field/file-input-field.ts`.
- En el output `files` que emite, el modelo de cada item debe llevar `mimeType` (en vez de `type`).
- La validación interna de MIME permitidos y tamaño máximo se mantiene igual.

### T0.9 `preferences.service.ts` usa `mimeType`

- Archivo: `src/app/shared/preferences/services/preferences.service.ts`.
- En `getObjectUrl`, al pasar el metadata a `NasaImageRepository.getBytes`/`getObjectUrl`, usar `mimeType` en lugar de `type`.
- Actualizar el spec correspondiente para reflejar el cambio.

### T0.10 Reglas Firestore

- Archivo: `firestore.rules`.
- Renombrar `type` → `mimeType` en los `hasOnly` actuales de `files` y `nasa-image`.
- Añadir validación para `tags` y `createdAt` en los dos niveles de archivos:

```text
function isValidTags(t) {
  return t is list
      && t.size() <= 10
      && t.allMatches(tag, tag is string && tag.size() > 0 && tag.size() <= 32);
}
```

- `hasValidFileMetadata(m)`:
  - `m.keys().hasAll(['name','mimeType','size','chunkCount','updatedAt','tags','createdAt'])`
  - `m.name is string && m.name.size() > 0 && m.name.size() <= 200`
  - `m.mimeType is string && m.mimeType.size() <= 120`
  - `m.size is int && m.size > 0 && m.size <= 5 * 1024 * 1024`
  - `m.chunkCount is int && m.chunkCount > 0`
  - `m.updatedAt is int && m.updatedAt == request.time.toMillis() || (resource != null && m.updatedAt == resource.data.updatedAt)`
  - `m.tags is list && isValidTags(m.tags)`
  - `m.createdAt is int`
  - `m.encrypted is bool || !('encrypted' in m)`
  - `m.iv is string || !('iv' in m)`

- En `update`, exigir `request.resource.data.createdAt == resource.data.createdAt` (inmutable).

- Añadir el segundo nivel (issue):

```text
match /users/{userId}/proyectos/{projectId}/issues/{issueId}/files/{fileId} {
  allow read, write: if isOwner(userId)
                    && hasValidFileMetadata(request.resource.data);
  allow delete: if isOwner(userId);
}
match /users/{userId}/proyectos/{projectId}/issues/{issueId}/files/{fileId}/chunks/{chunkId} {
  allow read, write: if isOwner(userId)
                    && request.resource.size() <= 700 * 1024;
}
```

- Los 2 niveles son hermanos: reglas idénticas, paths distintos.

### T0.11 Tests (T0)

- `file-blob.service.spec.ts`:
  - `computeMetadata` rellena `mimeType`, `tags: []`, `createdAt: number`.
  - `upload` con `encryptWith` cifra cada chunk, genera `iv` aleatorio, marca `encrypted: true`.
  - `getBytes` descifra cuando `key` se pasa y `encrypted === true`.
  - `deleteFile` borra chunks + doc.
  - Path construido con `namespace.split('/')` para los 2 namespaces.
- `file-repository.spec.ts`:
  - `path` resuelve a `['files']` cuando `scope = 'global'`.
  - `path` resuelve a `['proyectos', projectId, 'issues', issueId, 'files']` cuando `scope = { kind: 'issue', ... }`.
  - `addFile`/`deleteFile`/`getObjectUrl` delegan en `FileBlobService` con el namespace correcto.
  - Al cambiar `scope`, el `resource()` se re-evalúa (verificar spy del `colRefSignal`).
- `scope-context.spec.ts`:
  - Estado inicial `'global'`.
  - `setIssue` actualiza el signal y `isIssue` se vuelve `true`.
  - `setGlobal` vuelve al estado inicial.
- `file-input-field.spec.ts`:
  - Output emite items con `mimeType`.
- `preferences.service.spec.ts`:
  - `getObjectUrl` propaga `mimeType` al repo de NASA.
- `firestore.rules.spec.ts` (con `@firebase/rules-unit-testing`):
  - Nivel global: crear/leer/borrar permitido al dueño; chunks ≤ 700KB aceptados; > 700KB rechazados.
  - Nivel issue: idem.
  - Cross-project deny: `users/u1/.../proyectos/p1/issues/i1/files` y `users/u1/.../proyectos/p2/issues/i2/files` son independientes (no cross-read).
  - Cross-issue deny: `users/u1/.../proyectos/p1/issues/i1/files` ≠ `users/u1/.../proyectos/p1/issues/i2/files`.
  - `createdAt` inmutable en update.

### T0.12 Build & tests

- Correr `ng build` y `ng test` después de generar el código. Iterar hasta verde.

---

## M3-T1 · UI: `<ui-file-list>`, `<ui-add-file>`, `<ui-view-file>`

Objetivo: listar, añadir y visualizar archivos en la card "Archivos" del home, con cifrado opcional (input `[encrypt]`), thumbnail cliente y filtro.

### T1.1 `<ui-file-list>` (presentacional)

- Archivo: `src/app/shared/components/ui-file-list/ui-file-list.ts`.
- Inputs:
  - `files: Signal<FileMetadataI[]>` (lista ya resuelta; el padre hace el `resource`).
  - `loading: Signal<boolean>`.
  - `error: Signal<unknown | null>`.
- Render:
  - Lista con `<ui-list-item>` por archivo: thumbnail (si imagen), nombre, mimeType, tamaño, badge de cifrado, botones ver/descargar/borrar.
  - Empty state si no hay archivos.
  - Skeleton si `loading`.
  - Mensaje de error si `error`.

### T1.2 `<ui-add-file>` (modal)

- Archivo: `src/app/shared/components/ui-add-file/ui-add-file.ts`.
- Usa `<ui-modal>` como host.
- Inputs:
  - `isOpen: ModelSignal<boolean>`.
  - `encrypt: Signal<boolean>` — si true, requiere vault key. Si no hay vault key, abre `ModalUnlockVault` antes.
  - `maxSize: number = BLOB_MAX_FILE_SIZE` (5MB).
- Salidas:
  - `closed: OutputEmitterRef<void>`.
  - `added: OutputEmitterRef<FileMetadataI[]>`.
- Reusa `FileInputField` para drag&drop, preview, progreso.
- Cola: mantiene `WritableSignal<AddFileQueueItem[]>` con estado `pending | uploading | done | error`.
- Botón "Subir" disabled hasta que haya al menos 1 item y no haya `uploading`.
- Cancelar: aborta la subida en curso.
- Llamadas: `FileBlobService.upload` con `encryptWith = key` si `encrypt() && key`.
- Toast: success en `added`, error en `error`.
- Confirm al cerrar si hay `pending` o `uploading`.

### T1.3 `<ui-view-file>` (modal)

- Archivo: `src/app/shared/components/ui-view-file/ui-view-file.ts`.
- Inputs:
  - `isOpen: ModelSignal<boolean>`.
  - `file: Signal<FileMetadataI | null>`.
- Salidas:
  - `closed: OutputEmitterRef<void>`.
  - `download: OutputEmitterRef<void>`.
- Preview según `mimeType`:
  - `image/*` → `<img>` con blob URL.
  - `text/*` → `<pre>` con texto.
  - `application/pdf` → `<iframe>` con blob URL.
  - `video/*` → `<video>`.
  - `audio/*` → `<audio>`.
  - resto → "Vista previa no disponible".
- Botón "Descargar": `FileBlobService.getBytes` + `URL.createObjectURL` + `<a download>`.
- Si `file.encrypted === true`, requiere vault key (abre `ModalUnlockVault` si no).

### T1.4 Thumbnail cliente para imágenes

- Archivo: `src/app/shared/files/utils/thumbnail.ts`.
- Función: `async function makeThumbnail(file: FileMetadataI, getBytes: () => Promise<Uint8Array>): Promise<string | null>`.
- Usa `createImageBitmap` + `OffscreenCanvas` 96×96, devuelve blob URL (o `null` si no es imagen / falla).
- Solo se llama para `image/*` en `<ui-file-list>`.

### T1.5 `FILE_FILTER_SCHEMA`

- Archivo: `src/app/shared/files/models/file-filter.schema.ts`.

```ts
export const FILE_FILTER_SCHEMA: FilterSchema<FileMetadataI> = {
  name:     { type: 'string', op: 'contains' },
  mimeType: { type: 'string', op: 'equals' },
  size:     { type: 'number', op: 'range' },
  tags:     { type: 'array',  op: 'array-contains' },
};
```

- Se conecta al `FilterService` ya existente (M7-T1) desde home.

### T1.6 Integración en home

- Archivo: `src/app/home/pages/home/home.html` y `home.ts`.
- Reemplazar la card "Archivos" vacía por:
  - `scope.setGlobal()` en `ngOnInit` del home (defensivo, ya es el estado por defecto).
  - `<ui-file-list>` con `files` desde el `resource` de `FileRepository`.
  - Header con botón "Añadir" que abre `<ui-add-file [encrypt]="true">`.
  - `<ui-view-file>` controlado por un `Signal<FileMetadataI | null>` en `home.ts`.
  - Filtro (botón con icono `filter_alt`) que abre un panel con `FILE_FILTER_SCHEMA`.

### T1.7 Tests (T1)

- `ui-file-list.spec.ts`: renderiza items, empty state, skeleton.
- `ui-add-file.spec.ts`: encola, sube con cifrado, cancela, muestra errores.
- `ui-view-file.spec.ts`: renderiza por mimeType, botón descargar funciona con spy de `getBytes`.
- `thumbnail.spec.ts`: genera blob URL para imagen, devuelve `null` para no-imagen.
- Test e2e con Firestore emulator: subir, listar, descargar, borrar en el nivel global.

### T1.8 Build & tests

- `ng build` + `ng test` verde.

---

## Tareas (checklist)

### M3-T0 · Refactor

- [ ] T0.1 Renombrar `type` → `mimeType` en `FileMetadataI`.
- [ ] T0.2 Añadir `tags: string[]` y `createdAt: number` a `FileMetadataI`.
- [ ] T0.3 Extender `BlobNamespace` a 2 valores con template-string.
- [ ] T0.4 `FileBlobService`: namespace dinámico + cifrado AES-GCM-256.
- [ ] T0.5 `FileRepository` scope-aware: `path = computed` desde `ScopeContext`.
- [ ] T0.6 `NasaImageRepository` usa `mimeType` (sin scope).
- [ ] T0.7 `ScopeContext`: `Scope = 'global' | { kind: 'issue', ... }`.
- [ ] T0.8 `FileInputField` usa `mimeType` en output.
- [ ] T0.9 `preferences.service.ts` usa `mimeType` en `getObjectUrl`.
- [ ] T0.10 `firestore.rules`: `mimeType` + `tags` + `createdAt` + 2 niveles.
- [ ] T0.11 Tests: blob, repository, scope, file-input-field, preferences, rules.
- [ ] T0.12 `ng build` + `ng test` verde.

### M3-T1 · UI

- [ ] T1.1 `<ui-file-list>` (presentacional).
- [ ] T1.2 `<ui-add-file>` (modal con cola, cifrado opcional).
- [ ] T1.3 `<ui-view-file>` (modal con preview por mimeType).
- [ ] T1.4 Thumbnail cliente para imágenes.
- [ ] T1.5 `FILE_FILTER_SCHEMA`.
- [ ] T1.6 Integración en home.
- [ ] T1.7 Tests de componentes y e2e con emulator.
- [ ] T1.8 `ng build` + `ng test` verde.
