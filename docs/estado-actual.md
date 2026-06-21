# Estado Actual

> Snapshot verificado del proyecto. Mapea lo implementado contra los casos de uso definidos en `casos-de-uso.md` y registra los cambios necesarios para cerrar la brecha.

> Documentos relacionados: `proposito-y-alcance.md` (alcance contra el que se mide), `casos-de-uso.md` (catalogo de CU con detalle), `design-context.md` (estado y bugs del sistema de diseno, incluyendo los `B1..B7` que aplican tambien a la UI actual).

Convenciones:

- `OK` implementado y cumple
- `PARCIAL` existe parte, falta resto
- `FALTA` no existe
- `BUG` existe pero no cumple (rompe casos de uso)
- `EXTRA` existe pero no esta en alcance (candidato a quitar)

## 1. Snapshot

- **Nombre:** DevHelper
- **Tipo:** SPA Angular
- **Stack:** Angular 20 + DaisyUI 5 + Tailwind 4 + Firebase 11 (Auth + Firestore)
- **Estado:** pre-MVP. Auth, vault y elementos globales (passwords/files) funcionan; **proyectos, tareas, eventos, busqueda y membresia no existen**.
- **Package manager:** pnpm (workspace)
- **Tests:** Karma (default Angular) + Vitest (instalado, sin uso visible)
- **Lint/format:** ESLint + Prettier configurados
- **CI:** ninguno

## 2. Estructura relevante

```
src/app/
  auth/                      OK login, register, reset password
  core/                      OK auth guard
  home/                      dashboard actual (mezcla OK + placeholders)
    components/
      password-list/         OK CRUD passwords globales
      nasa-picture/          OK imagen APOD del dia
    service/                 OK repo + crypto passwords
  shared/
    security/                OK vault (PIN/Passkey), modal create/unlock, lockout
    files/                   OK repo files (global + nasa + issue scope), blob chunks, upload
    service/                 OK authenticator, session-manager, brute-force.guard, confirm, toast, loader
    filter/                  OK filter service (text/number/date/select), modal, chip
    forms/                   OK fields reusables (text, email, password, pin, number, search, textarea) + validators
    preferences/             OK singleton prefs (NASA custom image)
    components/              OK ui-button, ui-modal, ui-alert, ui-toast, ui-add-file, ui-view-file, ui-file-list, card-base, card-button, list-button, item-list, tooltip
    api/                     OK ApiBase + crud mixins (collection, doc, delete, add)
    scope/                   OK ScopeContext (global | issue)
    handler/                 OK global error handler + http interceptor
  environments/              OK firebase config
src/styles/                  OK tokens + utilities (DaisyUI theme "devhelper")
firestore.rules              ⚠ contiene paths de proyectos/issues que no tienen modelo ni UI
```

## 3. Mapeo contra casos de uso

### CU-01 Registro / creacion de cuenta

- **OK** email/password en `authenticator.register` + UI en `form-register`.
- **OK** Google OAuth (`loginWithGoogle`).
- **EXTRA** GitHub OAuth (`loginWithGithub`) implementado pero no en alcance. Quitar o documentar como out-of-scope explicito.
- **BUG** se envia email de verificacion pero el sistema no la exige ni bloquea el acceso.

### CU-02 Inicio y cierre de sesion

- **OK** login email/password + Google.
- **OK** logout via `authenticator.logout`.
- **OK** `SessionManager`: 30 min inactividad, reactiva por eventos del usuario.
- **OK** `authCanMatch` (not=false permite app, not=true permite /login).
- **EXTRA** GitHub login (mismo que CU-01).
- **FALTA** "recordar sesion entre visitas" configurable. Hoy depende solo de Firebase.

### CU-03 Configuracion inicial del vault

- **OK** `VaultSecurity.createVault('pin'|'passkey', pin?)`.
- **OK** `UnlockKeyWithPin` (PBKDF2 + AES-GCM).
- **OK** `UnlockKeyWithPasskey` (WebAuthn, SHA-256 de clientDataJSON).
- **OK** `MasterKey` genera/importa/exporta clave AES-GCM.
- **OK** UI en `modal-create-vault` (HTML+TS).
- **PARCIAL** auto-disparo al detectar `VAULT_STATUS.NO_CREATE` via effect: OK, pero no se ha confirmado que el flujo post-create redirija a "crear primer proyecto" (ver CU-05).

### CU-04 Desbloqueo del vault

- **OK** `unlockWithPin` / `unlockWithPasskey`.
- **OK** `PinLockoutService`: 3 intentos, 5 min lockout (constantes: `MAX_PIN_ATTEMPTS`, `PIN_LOCKOUT_DURATION_MS`).
- **OK** UI `modal-unlock-vault` muestra intentos restantes.
- **OK** `showModal(action)` encola accion pendiente si vault bloqueado.
- **FALTA** `changePin` existe en codigo (`VaultSecurity.changePin`) pero no hay UI para cambiar PIN tras setup.

### CU-05 Gestion de proyectos

- **FALTA** no existe coleccion `users/{uid}/proyectos/{projectId}` con metadatos (nombre, descripcion, archived, createdAt).
- **FALTA** no existe `ProjectRepository` / servicio.
- **FALTA** no existe UI: el card "Proyectos" en `home.html:4-9` es placeholder sin logica.
- **FALTA** no se valida el limite de 1 proyecto en plan gratuito.
- **FALTA** no existe flujo de "archivar" ni "eliminar proyecto".
- **BUG** `firestore.rules:112` y `firestore.rules:244-268` referencian `proyectos/{projectId}/issues/{issueId}/files` pero no hay reglas para `proyectos` ni `issues` en si. Las reglas de `proyectos/.../files` seran inalcanzables hasta que exista el modelo.

### CU-06 Gestion de tareas (normales y notas)

- **FALTA** no existe coleccion `users/{uid}/proyectos/{projectId}/issues/{issueId}`.
- **FALTA** no existe `IssueRepository` / servicio.
- **FALTA** no existe UI: el card "Tareas" en `home.html:11` es placeholder.
- **FALTA** no existe diferenciacion entre tarea "normal" (estado + fecha) y tarea "nota" (sin estado/fecha).
- **FALTA** no existe flujo de edicion, marcar como hecha, archivar, eliminar.
- **BUG** `ScopeContext` ya define `kind: 'issue'` con `projectId` + `issueId`, pero nunca se setea (solo `setGlobal` se usa en `home.ts:67`). Codigo muerto.

### CU-07 Adjuntar ficheros

- **OK** `FileRepository` con chunks (max 8, 700KB c/u = 5MB total).
- **OK** `BLOB_MAX_FILE_SIZE = 5 * 1024 * 1024` (hardcoded).
- **OK** `BLOB_CHUNK_SIZE = 700 * 1024` (hardcoded).
- **OK** `FileBlobService.upload` cifra con vault key, sube metadata + chunks.
- **OK** UI: `ui-add-file`, `ui-file-list`, `ui-view-file` ya implementadas.
- **OK** Repositorio soporta namespace `proyectos/{projectId}/issues/{issueId}/files` (reglas + path dinamico en `file-repository.ts:25`).
- **PARCIAL** limite por plan (cantidad de ficheros): no se cuenta, no se enforza.
- **PARCIAL** tipo de archivo permitido: no hay whitelist. Acepta cualquier MIME.

### CU-08 Gestion de passwords

- **OK** `PasswordRepository` con add/list/delete.
- **OK** `PasswordCrypto` cifra con vault key.
- **OK** UI `password-list` con add/list/view (descifra bajo demanda) / copy / edit / delete.
- **BUG** modelo de datos incompatible con `firestore.rules:170-181`:
  - Codigo: `{ name, password: EncryptedData {cipher, iv}, secure }`.
  - Reglas: `{ title, username, password (string <=1024), url, notes, createdAt (timestamp), updatedAt (timestamp) }`.
  - El codigo **fallara** al escribir en Firestore por `hasOnly` y por tipo `timestamp` faltante.
- **FALTA** password-por-tarea: no existe ruta `proyectos/.../issues/.../passwords` ni en reglas ni en codigo.
- **FALTA** "auto-ocultar tras N segundos" tras mostrar un password (proteccion shoulder-surf). Hoy se queda visible.
- **FALTA** "codigo de recuperacion" del vault (mencionado en `casos-de-uso.md` como asuncion): no implementado. Si el usuario pierde el PIN y no tiene passkey sincronizada, los passwords son irrecuperables.
- **FALTA** UI para reautenticacion (`Authenticator.reauthenticate` existe en codigo pero sin pantalla).

### CU-09 Gestion de eventos / recordatorios

- **FALTA** no existe coleccion `users/{uid}/events` (ni global ni scoped).
- **FALTA** no existe `EventRepository` / servicio.
- **FALTA** no existe UI: el card "Calendario" en `home.html:18` es placeholder.
- **FALTA** no hay scheduler ni notificacion push; no se puede "disparar recordatorio".
- **FALTA** `firestore.rules` no incluye path de eventos.

### CU-10 Busqueda y recuperacion

- **PARCIAL** existe `ui-search-field` (form field reusagle) pero no hay `SearchService`.
- **FALTA** buscador global que consulte proyectos, tareas, passwords (label+URL), eventos y ficheros.
- **FALTA** vista de resultados agrupados por tipo.
- **FALTA** indiciacion clara de que passwords se busca por label/URL y nunca por valor cifrado.

### CU-11 Gestion de la membresia

- **FALTA** no existe coleccion `users/{uid}/subscription` ni en reglas ni en codigo.
- **FALTA** no hay UI "Plan y facturacion".
- **FALTA** no hay pasarela de pago integrada.
- **FALTA** no se distingue plan gratuito vs plan pago; no se enforza limite de 1 proyecto.

## 4. Cambios necesarios (orden sugerido)

### 4.1 Modelo de datos Firestore (reglas)

Agregar reglas para las colecciones que faltan. Mantener owner-only.

- `users/{uid}/proyectos/{projectId}`: `{ name (string <=200), description? (string <=2000), archived (bool), createdAt (timestamp) }`.
- `users/{uid}/proyectos/{projectId}/issues/{issueId}`: `{ title (string <=200), description? (string <=20000), status ('pending'|'done'|null), isNote (bool), dueAt? (timestamp), createdAt (timestamp), updatedAt (timestamp) }`. `isNote=true` equivale a "nota": `status` debe ser null, `dueAt` debe ser null.
- `users/{uid}/proyectos/{projectId}/issues/{issueId}/passwords/{passwordId}`: misma shape que `users/{uid}/passwords`.
- `users/{uid}/proyectos/{projectId}/issues/{issueId}/files/{fileId}` + chunks: ya existe, verificar.
- `users/{uid}/events/{eventId}`: `{ title (string <=200), description? (string <=2000), at (timestamp), durationMinutes? (int >=0), notified (bool), createdAt (timestamp) }`. **Globales, no scoped a proyecto/issue.**
- `users/{uid}/subscription/{subscriptionId='singleton'}`: `{ plan ('free'|'paid'), renewsAt? (timestamp), providerCustomerId? (string), providerSubscriptionId? (string) }`.

Ademas:

- **BUG fix** `users/{uid}/passwords`: alinear reglas a la realidad del codigo. Decidir:
  - Opcion A (preferida): expandir reglas a `{ name, password: { cipher: list, iv: list }, secure, createdAt, updatedAt }`. Mantiene el modelo cifrado client-side.
  - Opcion B: rehacer el codigo para que coincida con las reglas (title/username/url/notes/timestamps).
- **BUG fix** el campo `password` encriptado en base64 puede exceder 1024 chars para passwords largos. Subir limite o cambiar validacion.

### 4.2 Capa de servicios (Angular)

- Crear `ProjectRepository` (collection `proyectos` con CRUD + archive).
- Crear `IssueRepository` (subcollection `issues` con CRUD, incluye tipo `isNote`).
- Crear `EventRepository` (collection `events` con CRUD).
- Crear `SubscriptionRepository` (singleton `subscription`).
- Crear `SearchService` (consulta paralela a todas las colecciones, filtra passwords por label/URL, devuelve resultados agrupados por tipo).
- Crear `QuotaService` (lee `subscription`, expone `canCreateProject()`, `canAttachFile()`, contadores actuales).
- Refactor `PasswordRepository` para soportar scope "global" y scope "issue" (similar a `FileRepository`). Hoy solo es global.
- Refactor `FileRepository.setIssue()` ya existe, agregar `setProject()` (no es necesario, el path se deriva de issue) - ya esta OK.
- Mover constantes hardcoded a config: `MAX_PIN_ATTEMPTS`, `PIN_LOCKOUT_DURATION_MS`, `BLOB_MAX_FILE_SIZE`, `BLOB_CHUNK_SIZE`, `SESSION_TIMEOUT_MS`, limites de plan.

### 4.3 UI

Reorganizar `home` para reflejar la jerarquia:

- Quitar el dashboard "grid de cards" actual. Reemplazar por:
  - **Vista proyecto**: header con nombre, acciones (rename/archive/delete), lista de tareas (normales + notas) con filtros, panel lateral de ficheros y passwords de la tarea seleccionada, calendario/recordatorios globales aparte.
  - **Vista global de passwords**: aparte, accesible desde menu.
  - **Vista global de ficheros**: idem.
  - **Vista global de eventos**: idem.
- Card "Proyectos" -> lista navegable de proyectos con boton "Nuevo proyecto" (deshabilitado si plan free y ya hay 1).
- Card "Tareas" -> vista contextual al proyecto seleccionado.
- Card "Calendario" -> vista de eventos globales + tareas con `dueAt`.
- Reemplazar `<nasa-picture />` en `home.html:20` (decorativo, no aporta al producto) o mover a vista de "fondo" en preferencias.
- Vista de Plan/Facturacion (settings).
- Buscador global en header, visible en todas las vistas autenticadas.
- Modal de cambio de PIN (usar `VaultSecurity.changePin`).
- Pantalla de reautenticacion (usar `Authenticator.reauthenticate`).
- Quitar boton "Continuar con GitHub" (extra) o documentarlo.

### 4.4 Mejoras de seguridad / UX

- Implementar "codigo de recuperacion" generado en `createVault` (mnemonic BIP-39, hash derivado, almacena hash en `users/{uid}/vault/recovery`). Flujo de reset exige el codigo.
- Auto-ocultar password descifrado tras N segundos (default 15s).
- Confirmacion extra (re-enter PIN) para `changePin` y `unlockWithPasskey` cuando se cambia el metodo.
- Reforzar selector de passkey: detectar si el dispositivo ofrece passkey, deshabilitar la opcion si no.
- Bloquear acceso si email no verificado tras X dias (gate post-registro).

### 4.5 Membership / pagos

- Decidir pasarela (Stripe recomendado por SDK robusto + customer portal).
- Crear Cloud Function que escuche webhooks de la pasarela y actualice `users/{uid}/subscription/singleton`.
- Crear endpoint o callable function para crear checkout session.
- Enforzar limites desde `QuotaService` en cliente y validar tambien en reglas (no se puede escribir mas de 1 doc en `proyectos` si plan==free).
- Cloud Function programada para bajar plan a `free` al expirar `renewsAt`.

### 4.6 Busqueda

- Decidir estrategia:
  - Cliente: descargar todo y filtrar en memoria (no escala mas alla de unos cientos de docs por usuario - aceptable para MVP personal).
  - Firestore: consultas con `>=` `array-contains` etc. + un campo `searchTokens` (lista de tokens lowercase) en cada doc para busqueda full-text basica. Indexar en escritura.
- Limitar a 50 resultados por tipo. Mostrar "ver mas".
- Filtros rapidos por tipo (chips arriba del input).

### 4.7 Eventos / recordatorios

- Servicio de scheduler local (en navegador) basado en `setTimeout` + persistencia en Firestore.
- `Notification API` para notificar al usuario.
- Worker ligero (Service Worker) si se quiere notificar con la app cerrada - fuera de MVP.

### 4.8 Deuda tecnica

- **GitHub OAuth** (`Authenticator.loginWithGithub`): quitar o documentar.
- **Email verification**: o se exige o se quita el envio.
- **Email/password auth sin reautenticacion reciente**: agregar reauth para acciones sensibles (cambiar PIN, revelar recovery code, eliminar cuenta).
- **Tests**: hay muchos `.spec.ts` pero no esta claro si corren con Karma o Vitest. Decidir y ejecutar `npm test` para validar.
- **Variables de entorno**: API keys y config Firebase deberian venir de `.env` (Angular 20 soporta `import.meta.env` en build). Hoy `environment.ts` las tiene hardcoded.
- **Sin CI**: agregar GitHub Actions que ejecute `npm run lint`, `npm test`, `npm run build`.

## 5. Numeros y limites a documentar/configurar

| Parametro                 | Valor actual | Donde                       | Accion                   |
| ------------------------- | ------------ | --------------------------- | ------------------------ |
| PIN intentos max          | 3            | `pin-lockout.service.ts:16` | mover a config           |
| PIN lockout duracion      | 5 min        | `pin-lockout.service.ts:17` | mover a config           |
| Auth brute-force intentos | 5            | `brute-force.guard.ts:17`   | mover a config           |
| Auth brute-force ventana  | 5 min        | `brute-force.guard.ts:18`   | mover a config           |
| Auth lockout duracion     | 15 min       | `brute-force.guard.ts:16`   | mover a config           |
| Sesion inactividad        | 30 min       | `session-manager.ts:13`     | mover a config           |
| Fichero maximo            | 5 MB         | `blob-chunk.model.ts:7`     | confirmar para plan free |
| Chunk size                | 700 KB       | `blob-chunk.model.ts:6`     | mover a config           |
| Max chunks por fichero    | 8            | `firestore.rules:53`        | mover a config           |
| Plan free: proyectos      | 1            | no implementado             | implementar enforcement  |
| Plan free: ficheros       | sin definir  | no implementado             | definir y enforzar       |

## 6. Estado del sistema de diseno

Resumen; el detalle completo esta en `docs/design-context.md` seccion 11.

- **OK** tema `devhelper` (dark) definido y aplicado. DaisyUI 5 + Tailwind 4 sin `tailwind.config.js`. Tokens en `src/styles/tokens.css`, utilities en `src/styles/utilities.css`.
- **OK** 22 clases nativas de DaisyUI en uso (`btn`, `card`, `input`, `tabs`, `modal`, `alert`, `toast`, `loading`, etc.). `card card-xl` para cards, `btn btn-{severity}` para botones.
- **OK** iconografia unica via Material Symbols Outlined (`icon` + `icon-sm` / `icon-lg`).
- **OK** sin emojis en UI. Sin fuentes alternativas a Roboto.
- **OK** `button.css:36-75` autoreferencia - codigo muerto. Ver `design-context.md` B1.
- **OK** `tokens.css:49-67` redeclara colores de severidad que DaisyUI ya provee.
- **OK** `.text-error/warning/info/success` duplicado en `utilities.css` y `ui-alert.css`.
- **OK** `.input` en `utilities.css:20-30` colisiona con `input` nativo de DaisyUI.
- **OK** `.btn-base` en `utilities.css:40-57` reinventa defaults de DaisyUI.
- **OK** `ui-toast` (36 lineas CSS) y `ui-alert` (0 lineas, sin CSS) migrados a `toast` + `alert` nativo de DaisyUI con `alert-soft`.
- **OK** `logs: false` configurado en el bloque `@plugin "daisyui"` (consola silenciosa en dev).
- **FALTA** un segundo tema (no se anade hasta resolver primero la duplicacion de colores en `tokens.css`).

## 7. Resumen ejecutivo (1 linea)

Autenticacion, vault cifrado, passwords globales y ficheros globales funcionan. Falta construir el nucleo del producto: proyectos, tareas, eventos, busqueda y modelo de membresia. Antes de eso, reparar la incompatibilidad entre el modelo de `password` en codigo y las reglas de Firestore.
