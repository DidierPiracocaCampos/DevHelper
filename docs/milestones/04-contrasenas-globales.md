# M4 · Contrasenas globales

Vault cifrado de credenciales reutilizables. Desbloqueo por PIN o passkey.

## Dependencias

- M7-T0 (ScopeContext + ApiBase reactivo).
- M7-T1 (filtro).
- M7-T2 (inputs en signals).

## Tareas

- [ ] M4.1 Ampliar `PasswordI` con `username`, `url`, `notes` (en claro) y `createdAt`, `updatedAt`. Solo `password` se cifra.
- [ ] M4.2 Migrar `PasswordRepository` a scope-aware: `path` como `computed` desde `ScopeContext` (`['passwords']` o `['projects', projectId, 'passwords']`).
- [ ] M4.3 Anadir `withUpdateDoc` al repo y arreglar el flujo de edicion real (hoy llama a `addDoc`).
- [ ] M4.4 Extraer `<ui-password-list>` a `shared/components/`, agnosto de scope. Reusa filtro de T1.
- [ ] M4.5 Modal `<ui-add-password>` con generador de contrasenas opcional.
- [ ] M4.6 Modal `<ui-view-password>` con copia rapida al portapapeles.
- [ ] M4.7 FilterSchema de `PasswordI` para T1 (name, secure, createdAt).
- [ ] M4.8 Toast/confirm consistentes en alta, edicion, borrado, lectura y copia.
- [ ] M4.9 Tests: cifrado/descifrado, paths por scope, edicion real, componentes.
