# M3 · Archivos globales

Repositorio de archivos compartidos entre proyectos. Subida, listado, descarga y borrado. Cifrado cliente con la vault key y bytes en Firebase Storage.

## Dependencias

- M7-T0 (ScopeContext + ApiBase reactivo).
- M7-T1 (filtro).
- M7-T2 (inputs en signals).
- M7-T3 (FileInputField + servicio de Storage).

## Tareas

- [ ] M3.1 Modelar `FileI`: `name, mimeType, size, storagePath, encrypted, encryptionIv?, tags[], createdAt, updatedAt`.
- [ ] M3.2 `FileStorageService` con `uploadBytesResumable`, emision de progreso, namespace `users/{uid}/files/{fileId}` (bytes).
- [ ] M3.3 `FileRepository` scope-aware: `path` como `computed` desde `ScopeContext`.
- [ ] M3.4 Crear `storage.rules` con aislamiento por `uid` (`match /users/{userId}/{allPaths=**}`).
- [ ] M3.5 Anadir bloque `storage` en `firebase.json`.
- [ ] M3.6 Cifrado cliente con `vaultKey` (AES-GCM-256, `iv` aleatorio por archivo) antes de subir.
- [ ] M3.7 Extraer `<ui-file-list>` a `shared/components/`, agnosto de scope. Reusa filtro de T1.
- [ ] M3.8 Modal `<ui-add-file>` reutilizando `FileInputField`: drag&drop, multiple, cola con progreso, cancelar subida, validacion de tamano y MIME.
- [ ] M3.9 Modal `<ui-view-file>` con preview segun mimeType (imagen, texto, PDF, video, audio) y boton de descarga. Resto: "vista previa no disponible".
- [ ] M3.10 Thumbnail cliente para imagenes (canvas + `createImageBitmap`).
- [ ] M3.11 FilterSchema de `FileI` para T1 (name, mimeType, size, tags).
- [ ] M3.12 Toast/confirm consistentes en alta, borrado, vista y descarga.
- [ ] M3.13 Tests: storage service, cifrado, reglas, componentes.
