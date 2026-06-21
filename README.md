<div align="center">

# DevHelper

**Tu memoria técnica de trabajo, cifrada y en un solo lugar.**

Reemplaza la combinación _Notion + 1Password + Calendar + Drive_ por un único workspace donde conviven proyectos, tareas, passwords, ficheros y eventos — todo bajo un vault AES-GCM desbloqueado por PIN o Passkey.

[Quick start](#quick-start) · [Documentación](#documentación) · [Estado](#estado-del-proyecto) · [Stack](#stack) · [Diseño](#sistema-de-diseño)

</div>

---

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=flat-square&logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5-5A0EF8?style=flat-square&logo=daisyui)
![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?style=flat-square&logo=vitest)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?style=flat-square&logo=pnpm)

![Estado](https://img.shields.io/badge/Estado-Pre--MVP-000000?style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-Privada-333333?style=flat-square)
![Region](https://img.shields.io/badge/Firestore-eur3-000000?style=flat-square)

---

## Acerca de

DevHelper existe por un problema concreto: a lo largo de meses y años de trabajo, un desarrollador se encuentra repetidamente con los mismos errores, decisiones, credenciales, archivos y compromisos que termina perdiendo o re-buscando. El producto acumula ese conocimiento en un único lugar cifrado y lo deja disponible cuando reaparece el mismo problema.

> **El cifrado es client-side.** Ni Firebase puede leer el contenido. Si pierdes el PIN y no tienes Passkey sincronizada, los datos son irrecuperables. Esto es por diseño.

Privacidad y consistencia visual son parte del alcance: la UI se siente "cerrada por defecto" (vault, modales de unlock, lockout del PIN).

---

## Estado del proyecto

> Pre-MVP. Auth, vault y elementos globales (passwords, ficheros) funcionan. El núcleo del producto (proyectos, tareas, eventos, búsqueda, membresía) no existe todavía.

| Módulo                         | Estado | Notas                                               |
| ------------------------------ | :----: | --------------------------------------------------- |
| Autenticación (email + Google) |   OK   | GitHub OAuth implementado pero fuera de alcance     |
| Vault cifrado (PIN / Passkey)  |   OK   | AES-GCM, WebAuthn, lockout 3/5min                   |
| Passwords globales             |  Bug   | Modelo no encaja con `firestore.rules`              |
| Ficheros globales (5MB)        |   OK   | Chunks 700KB, máx 8                                 |
| Proyectos                      | Falta  | Cards en `home.html` son placeholders               |
| Tareas / Notas                 | Falta  | Sin modelo, sin UI, sin reglas                      |
| Eventos / Recordatorios        | Falta  | Sin scheduler, sin notificaciones                   |
| Búsqueda global                | Falta  | `ui-search-field` existe, falta el servicio         |
| Membresía / Plan               | Falta  | Sin pasarela, sin enforcement del límite 1 proyecto |
| NASA Picture of the Day        |   OK   | Integración decorativa en home                      |

**Siguiente paso crítico:** reparar el bug del modelo de passwords antes de añadir proyectos. Detalle en [`docs/estado-actual.md`](docs/estado-actual.md).

Leyenda: `OK` implementado y cumple · `Bug` existe pero no cumple · `Falta` no existe.

---

## Quick start

### Requisitos

- **Node.js 20+**
- **pnpm 9+** — el lockfile es `pnpm-lock.yaml` y `angular.json:5` declara `packageManager: "pnpm"`. Usar `npm install` regenera el lockfile en un formato incompatible.

### Instalación

```bash
pnpm install
pnpm start               # ng serve -> http://localhost:4200
```

### Verificación (orden recomendado)

```bash
pnpm run lint            # eslint
pnpm test                # vitest
pnpm build               # production build -> dist/devhelper
```

Ejecuta los tres en este orden antes de cualquier PR. Si falla cualquiera, los siguientes probablemente también.

### Tests de reglas de Firestore

```bash
pnpm run test:rules:firestore   # arranca emulador + corre los unit tests de reglas
```

---

## Configuración local

`src/environments/environment.ts` está en `.gitignore` (línea 38). Crea el archivo localmente:

```ts
export const environment = {
  firebaseConfig: {
    projectId: 'TU_PROYECTO',
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    appId: '...',
    storageBucket: 'TU_PROYECTO.firebasestorage.app',
    messagingSenderId: '...',
    measurementId: '...',
  },
  nasaApiKey: '...',
};
```

El proyecto Firebase por defecto es `devhelper-a61ef` en región `eur3`. Ver [`.firebaserc`](.firebaserc) y [`firebase.json`](firebase.json).

> **Nunca commitees credenciales reales.** Las API keys se filtran en el primer push si están en el repo.

---

## Documentación

Toda la documentación de producto vive en [`docs/`](docs/):

| Documento                                               | Qué responde                                                |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| [`proposito-y-alcance.md`](docs/proposito-y-alcance.md) | Qué es, para quién, qué entra y qué queda fuera             |
| [`casos-de-uso.md`](docs/casos-de-uso.md)               | Actores, catálogo de CU, detalle, flujos críticos           |
| [`estado-actual.md`](docs/estado-actual.md)             | Snapshot verificado + gap analysis + cambios necesarios     |
| [`design-context.md`](docs/design-context.md)           | Sistema de diseño: tokens, componentes, anti-patterns, bugs |

Para agentes AI: leer `AGENTS.md` (local, gitignored) para quirks del toolchain y convenciones.

---

## Stack

| Capa            | Tecnología                                           |     Versión     |
| --------------- | ---------------------------------------------------- | :-------------: |
| Framework       | Angular standalone + signals + OnPush                |     20.3.18     |
| Lenguaje        | TypeScript con `strict` + `strictTemplates`          |      5.9.2      |
| UI              | Tailwind CSS 4 + DaisyUI 5 (tema custom `devhelper`) | 4.1.12 / 5.5.23 |
| Backend         | Firebase (Auth + Firestore)                          |      11.10      |
| Integración     | AngularFire                                          |     20.0.1      |
| Iconos          | Material Symbols Outlined                            |        —        |
| Tests           | Vitest (no Karma)                                    |      3.1.1      |
| Lint / Format   | ESLint + Prettier                                    |        —        |
| Package manager | pnpm (workspaces)                                    |       9+        |

Notas no obvias:

- `angular.json:83` fuerza `"runner": "vitest"`. Karma es el default de Angular CLI pero aquí está sobreescrito.
- Los schematics usan `skipTests: true` por defecto. Los `.spec.ts` se agregan a mano cuando se necesitan.

---

## Estructura

```text
src/app/
├── auth/                      login, register, reset password
├── core/                      auth guard
├── home/                      dashboard actual (mezcla OK + placeholders)
│   ├── components/
│   │   ├── password-list/     CRUD passwords globales
│   │   └── nasa-picture/      APOD del día
│   └── service/               password repository + crypto
├── shared/
│   ├── api/                   ApiBase + CRUD mixins (base para repos Firestore)
│   ├── security/              vault (PIN/Passkey), modal create/unlock, lockout
│   ├── files/                 files globales + NASA + scoped a issue (5MB / 700KB)
│   ├── scope/                 ScopeContext (global | issue)
│   ├── service/               Authenticator, SessionManager, BruteForceGuard, Toast, Confirm, Loader
│   ├── filter/                filter service + chips + modal
│   ├── forms/                 fields reusables + validators
│   ├── preferences/           singleton de preferencias (NASA custom image)
│   ├── components/            ui-button, ui-modal, ui-alert, ui-toast, ui-add-file, ui-view-file, ui-file-list, card-*, list-*, tooltip
│   └── handler/               global error handler + http interceptor
├── environments/              (gitignored) config Firebase local
└── styles/                    tokens.css + utilities.css (DaisyUI theme en src/styles.css)

firestore.rules                reglas de seguridad (M3 paths anticipados)
firebase.json                  config Firebase (hosting -> dist/devhelper, region eur3)
docs/                          documentación de producto
```

---

## Sistema de diseño

Tema custom DaisyUI llamado `devhelper` (dark, definido en [`src/styles.css`](src/styles.css)). Tokens reusables en [`src/styles/tokens.css`](src/styles/tokens.css). Clases de utilidad en [`src/styles/utilities.css`](src/styles/utilities.css).

### Paleta

| Token             | Valor                 | Uso                                              |
| ----------------- | --------------------- | ------------------------------------------------ |
| `base-100`        | `#171717`             | Fondo de la app                                  |
| `base-200`        | `#20201e`             | Superficies elevadas (cards, inputs)             |
| `base-300`        | `#363633`             | Bordes, separadores                              |
| `base-content`    | `#e8e8e8`             | Texto principal                                  |
| `primary`         | `#e8e8e8`             | Acción principal (gris claro sobre fondo oscuro) |
| `primary-content` | `#171717`             | Texto sobre primary                              |
| `success`         | `oklch(55% 0.22 145)` |                                                  |
| `warning`         | `oklch(88% 0.18 85)`  |                                                  |
| `error`           | `oklch(70% 0.25 25)`  |                                                  |
| `info`            | `oklch(70% 0.2 265)`  |                                                  |

### Convenciones

- Un solo tema (dark, sin alternador, sin modo claro todavía).
- Sin emojis en UI. Solo `Material Symbols Outlined` (clase `icon` + `icon-sm` / `icon-lg`).
- Sin fuentes alternativas a Roboto.
- Sin gradientes decorativos fuera de `frost-effect` (hero/banner).
- Solo colores semánticos de DaisyUI (`primary`, `base-100`, etc.). Nunca `text-red-500`.

Detalle completo, anti-patterns, bugs y mejoras en [`docs/design-context.md`](docs/design-context.md).

---

## Decisiones de diseño no obvias

- Angular standalone, sin NgModules. Imports en el decorador de cada componente.
- Signals en todo el estado de componente. `computed()` para derivaciones. `inject()` no constructor injection.
- OnPush por defecto en todos los componentes. No opt-out.
- El campo `password` se cifra client-side con AES-GCM bajo la `vaultKey` derivada del PIN/Passkey. Ver [`src/app/shared/security/`](src/app/shared/security/).
- Límites hardcoded (PIN 3 intentos / 5min, brute force 5/15min, session 30min, file 5MB / chunk 700KB). Pendiente centralizar en config.

---

## Antes de contribuir

1. Lee [`docs/proposito-y-alcance.md`](docs/proposito-y-alcance.md) y [`docs/casos-de-uso.md`](docs/casos-de-uso.md) para entender el alcance.
2. Si vas a tocar UI, lee [`docs/design-context.md`](docs/design-context.md) primero.
3. Si vas a modificar `firestore.rules`, actualiza los 3 docs de producto. Las reglas deben coincidir con el spec.
4. Tras cambios no triviales: `pnpm run lint && pnpm test && pnpm build`.
5. No commitees `src/environments/`, `.env`, ni credenciales.

---

## Licencia

Privada. No publicar, no redistribuir.
