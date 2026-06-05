# M7 · Core

Modulo base del que dependen todos los demas. Cualquier trabajo en otro modulo parte de lo que aqui se defina.

## Dependencias

Ninguna. Es el primer modulo que se trabaja.

## Tareas

### T0 · Base agnostica de scope (bloqueante para M3 y M4)

- [ ] T0.1 Refactor `ApiBase` a path reactivo (`path` como signal/computed) y propagarlo por `$userCollectionRef()`.
- [ ] T0.2 Servicio `ScopeContext` (`shared/scope/scope-context.ts`) con `scope = signal<'global' | { projectId: string }>('global')`, `setGlobal()` y `setProject(id)`.
- [ ] T0.3 Ajustar `withCollection` / resto de mixins para que el `resource()` re-evalue al cambiar `path`.
- [ ] T0.4 Tests del refactor (cambio de scope recarga el `resource()`).

### T1 · Sistema de filtrado comun (agnostico de la entidad)

- [ ] T1.1 Modelo `FilterField<T>` y `FilterSchema<T>` (campo, label, tipo de control, ops permitidas).
- [ ] T1.2 `FilterService` con `state = signal<ActiveFilters>`, `apply(schema)`, `reset()`, salida en `QueryOptions`.
- [ ] T1.3 Componente `FilterModal` (sobre `ui-modal` existente) que renderiza cualquier `FilterSchema` recibido por input.
- [ ] T1.4 Componente `FilterChip` para filtros activos con opcion de quitar.

### T2 · Refactor de inputs a signals + patron compuesto

- [ ] T2.1 `UiField` base con slots `[label]`, `[prefix]`, `[suffix]`, `[errors]` y estado en signals (`value`, `disabled`, `errors`, `touched`, `dirty`).
- [ ] T2.2 `UiTextField`.
- [ ] T2.3 `UiEmailField`.
- [ ] T2.4 `UiPasswordField` con toggle show/hide accesible.
- [ ] T2.5 `UiNumberField`.
- [ ] T2.6 `UiSearchField`.
- [ ] T2.7 `UiPinField` (variante con UX propia: digitos, teclado, paste).
- [ ] T2.8 `UiTextareaField`.
- [ ] T2.9 Migrar consumidores existentes a los nuevos componentes.
- [ ] T2.10 Corregir memory leak de `matchOtherValidator`.
- [ ] T2.11 Anadir debounce a `firebasePasswordValidator`.
- [ ] T2.12 Tests de los nuevos componentes.

### T3 · File-input con signals + Firebase Storage

- [ ] T3.1 `FileRepository` con namespace `users/{uid}/files/{fileId}` (metadata Firestore + bytes Storage).
- [ ] T3.2 Servicio de upload con `uploadBytesResumable` y emision de progreso.
- [ ] T3.3 `FileInputField` signal-based: drag&drop, multiple, preview, validacion de tipo/tamano, barra de progreso.
- [ ] T3.4 Integracion con T1 (acepta `FilterSchema` externo).
- [ ] T3.5 Storage rules para limitar acceso al `userId` propietario.
- [ ] T3.6 Tests de upload/download y de las reglas.

### T4 · Modal de configuracion y preferencias

- [ ] T4.1 Modelar `UserPreferencesI`: `id ('singleton'), customNasaImage? { storagePath, updatedAt }`.
- [ ] T4.2 `PreferencesRepository` con path `['preferences']`, doc id `'singleton'`. Mixins: `withDocById, withSetDoc, withDocDelete`.
- [ ] T4.3 `PreferencesService` con `customNasaImageUrl = resource(...)` que resuelve el `getDownloadURL` a partir de `storagePath`.
- [ ] T4.4 Metodos `setCustomNasaImage(file)` (sube a Storage, actualiza preferencias, borra la anterior) y `clearCustomNasaImage()`.
- [ ] T4.5 `<ui-config-modal>` modal a pantalla completa con secciones colapsables. Seccion 1 "Widget NASA" con preview, boton "Cambiar imagen" y "Quitar imagen personalizada" (visible solo si hay custom).
- [ ] T4.6 En home: rewirear el boton `settings` para abrir el config modal, y mover `openVault()` al boton `data_object` (actualmente sin uso).
- [ ] T4.7 Tests: preferences repo, upload/replace/delete en Storage, resource reactivo.
