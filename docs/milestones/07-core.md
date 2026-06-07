# M7 · Core

Modulo base del que dependen todos los demas. Cualquier trabajo en otro modulo parte de lo que aqui se defina.

## Dependencias

Ninguna. Es el primer modulo que se trabaja.

## Tareas

### T0 · Base agnostica de scope (bloqueante para M3 y M4)

- [x] T0.1 Refactor `ApiBase` a path reactivo (`path` como signal/computed) y propagarlo por `$userCollectionRef()`.
- [x] T0.2 Servicio `ScopeContext` (`shared/scope/scope-context.ts`) con `scope = signal<'global' | { projectId: string }>('global')`, `setGlobal()` y `setProject(id)`.
- [x] T0.3 Ajustar `withCollection` / resto de mixins para que el `resource()` re-evalue al cambiar `path`.
- [x] T0.4 Tests del refactor (cambio de scope recarga el `resource()`).

### T1 · Sistema de filtrado comun (agnostico de la entidad)

- [x] T1.1 Modelo `FilterField<T>` y `FilterSchema<T>` (campo, label, tipo de control, ops permitidas).
- [x] T1.2 `FilterService` con `state = signal<ActiveFilters>`, `apply(schema)`, `reset()`, salida en `QueryOptions`.
- [x] T1.3 Componente `FilterModal` (sobre `ui-modal` existente) que renderiza cualquier `FilterSchema` recibido por input.
- [x] T1.4 Componente `FilterChip` para filtros activos con opcion de quitar.

### T2 · Refactor de inputs a signals + patron compuesto

- [x] T2.1 `UiField` base con slots `[label]`, `[prefix]`, `[suffix]`, `[errors]` y estado en signals (`value`, `disabled`, `errors`, `touched`, `dirty`).
- [x] T2.2 `UiTextField`.
- [x] T2.3 `UiEmailField`.
- [x] T2.4 `UiPasswordField` con toggle show/hide accesible.
- [x] T2.5 `UiNumberField`.
- [x] T2.6 `UiSearchField`.
- [x] T2.7 `UiPinField` (variante con UX propia: digitos, teclado, paste).
- [x] T2.8 `UiTextareaField`.
- [x] T2.9 Migrar consumidores existentes a los nuevos componentes.
- [x] T2.10 Corregir memory leak de `matchOtherValidator`.
- [x] T2.11 Anadir debounce a `firebasePasswordValidator`.
- [x] T2.12 Tests de los nuevos componentes.

### T3 · File-input con signals + chunks en Firestore

- [x] T3.1 `FileRepository` con namespace `users/{uid}/files/{fileId}` (metadata + chunks en subcollection).
- [x] T3.2 `FileBlobService` con chunks de 700 KB, cifrado opcional con vaultKey, max 5 MB.
- [x] T3.3 `FileInputField` signal-based: drag&drop, multiple, preview, validacion de tipo/tamano, barra de progreso.
- [x] T3.4 Integracion con T1 (acepta `FilterSchema` externo).
- [x] T3.5 Firestore rules para `files/{fileId}` y `files/{fileId}/chunks/{i}` (limite 700 KB por chunk).
- [x] T3.6 Tests de upload/download y de las reglas.

### T4 · Modal de configuracion y preferencias

- [x] T4.1 Modelar `UserPreferencesI`: `id ('singleton'), customNasaImage? { fileId, updatedAt }`.
- [x] T4.2 `PreferencesRepository` con path `['preferences']`, doc id `'singleton'`. Mixins: `withDocById, withSetDoc, withDocDelete`.
- [x] T4.3 `PreferencesService` con `resolvedUrl = resource(...)` que obtiene bytes desde `nasa-image/{fileId}` y crea blob URL.
- [x] T4.4 Metodos `setCustomNasaImage(file)` (sube via `FileBlobService` a `nasa-image`, actualiza preferencias, borra la anterior) y `clearCustomNasaImage()`.
- [x] T4.5 `<ui-config-modal>` modal a pantalla completa con secciones colapsables. Seccion 1 "Widget NASA" con preview, boton "Cambiar imagen" y "Quitar imagen personalizada" (visible solo si hay custom).
- [x] T4.6 En home: rewirear el boton `settings` para abrir el config modal, y mover `openVault()` al boton `data_object` (actualmente sin uso).
- [x] T4.7 Tests: preferences repo, upload/replace/delete en chunks, resource reactivo.
