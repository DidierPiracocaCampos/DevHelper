# Design Context

Sistema de diseño de DevHelper. Documento de referencia para agentes que generan o modifican UI.

![Status](https://img.shields.io/badge/Estado-Vivo-000000?style=flat-square)
![Audience](https://img.shields.io/badge/Audiencia-Agentes_AI_+_Developers-333333?style=flat-square)
![Stack](https://img.shields.io/badge/DaisyUI-5.5-5A0EF8?style=flat-square&logo=daisyui&logoColor=white)
![Stack](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

AI-first: estructura densa, sin narrativa. Cubre tokens, componentes, patrones y trampas conocidas.

---

## Tabla de contenidos

| #                                                    | Sección                             |
| ---------------------------------------------------- | ----------------------------------- |
| [0](#0-docs-relacionadas)                            | Docs relacionadas                   |
| [1](#1-identidad)                                    | Identidad                           |
| [2](#2-tema-daisyui)                                 | Tema DaisyUI                        |
| [3](#3-tokens-custom-en-srcstylestokenscss)          | Tokens custom en `tokens.css`       |
| [4](#4-tipografía-e-iconografía)                     | Tipografía e iconografía            |
| [5](#5-componentes-lo-que-sí-usamos-de-daisyui)      | Componentes: lo que sí usamos       |
| [6](#6-componentes-lo-que-reinventamos-y-por-qué)    | Componentes: lo que reinventamos    |
| [7](#7-layout-y-motion)                              | Layout y motion                     |
| [8](#8-convenciones-de-naming-y-estructura)          | Convenciones de naming y estructura |
| [9](#9-anti-patterns-no-hacer)                       | Anti-patterns (no hacer)            |
| [10](#10-cómo-extender)                              | Cómo extender                       |
| [11](#11-bugs-y-problemas-conocidos)                 | Bugs y problemas conocidos          |
| [12](#12-mejoras-recomendadas-ordenadas-por-impacto) | Mejoras recomendadas                |

---

## 0. Docs relacionadas

| Doc                                                | Sección relevante                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [`proposito-y-alcance.md`](proposito-y-alcance.md) | § 3 — propósito y público objetivo (informan la identidad visual)  |
| [`casos-de-uso.md`](casos-de-uso.md)               | § 4 — flujos críticos (los que más atención visual reciben)        |
| [`estado-actual.md`](estado-actual.md)             | § 3 + § 6 — mapa de componentes UI implementados vs los que faltan |
| [`README.md`](../README.md)                        | § "Sistema de diseño" — resumen ejecutivo del tema para humanos    |

> Los cambios de diseño propuestos deben ser consistentes con estos 4 docs.

---

## 1. Identidad

- **Producto:** workspace personal cifrado para developers. Single-user, dark by default.
- **Sensacion objetivo:** denso, monoespaciado, tipo IDE/terminal. Cero adornos. Privacidad como metafora visual (la UI se siente "cerrada por defecto").
- **Tema unico:** `devhelper` (dark, sin alternador). Si se anade un segundo tema en el futuro, debe ser un claro/oscuro alternativo, no multiples paletas.
- **No usar:** emojis, iconos coloridos, gradientes decorativos, fuentes alternativas no aprobadas, animaciones de celebracion (confetti, shake). Solo feedback de estado discreto.

## 2. Tema DaisyUI

- **Definido en:** `src/styles.css:8-41` con bloque `@plugin "daisyui/theme"`.
- **Tipo:** custom theme, nombre `devhelper`, default + dark forzado via `color-scheme: 'dark'`.
- **`prefersdark: false`** - el tema no responde al sistema operativo, siempre es el mismo dark.
- **Sin `daisyui` config block** - no se limitan themes built-in, no se desactiva el log, no se aplica prefix.

Paleta actual:

| Token             | Valor                      | Notas                                                           |
| ----------------- | -------------------------- | --------------------------------------------------------------- |
| `base-100`        | `#171717`                  | fondo app                                                       |
| `base-200`        | `#20201e`                  | superficies elevadas (cards, inputs)                            |
| `base-300`        | `#363633`                  | bordes, separadores                                             |
| `base-content`    | `#e8e8e8`                  | texto principal                                                 |
| `primary`         | `#e8e8e8` (gris claro)     | accion principal, sobre `base-100` queda como boton blanco/gris |
| `primary-content` | `#171717`                  | texto sobre primary                                             |
| `secondary`       | `#20201e`                  | casi invisible - no usar para CTAs                              |
| `accent`          | `#363633`                  | casi invisible - no usar para CTAs                              |
| `neutral`         | `oklch(14% 0.005 285.823)` | elementos neutros                                               |
| `success`         | `oklch(55% 0.22 145)`      |                                                                 |
| `warning`         | `oklch(88% 0.18 85)`       |                                                                 |
| `error`           | `oklch(70% 0.25 25)`       |                                                                 |
| `info`            | `oklch(70% 0.2 265)`       |                                                                 |

Tokens de tamano (definidos en `src/styles.css:33-40`):

| Token               | Valor              | Uso                        |
| ------------------- | ------------------ | -------------------------- |
| `--radius-selector` | `var(--radius-xl)` | checkbox, toggle, badge    |
| `--radius-field`    | `var(--radius-sm)` | button, input, select, tab |
| `--radius-box`      | `var(--radius-xl)` | card, modal, alert         |
| `--size-selector`   | `var(--spacing-1)` | base para selectores       |
| `--size-field`      | `var(--spacing-1)` | base para fields           |
| `--border`          | `1px`              |                            |
| `--depth`           | `0`                | sin sombra 3D              |
| `--noise`           | `0`                | sin grano                  |

## 3. Tokens custom en `src/styles/tokens.css`

- **Archivo no es un wrapper de DaisyUI** - introduce variables propias que la mayoria de componentes referencian.
- **Duplicacion intencional y problematicas:**
  - `--color-error`, `--color-warning`, `--color-info`, `--color-success` se redeclaran en `tokens.css:49-67` aunque DaisyUI ya las provee via el tema. Si el tema cambia, los alerts/toasts no se enteran.
  - `--radius-sm|md|lg|xl` (`tokens.css:30-35`) coexisten con `--radius-selector|field|box` de DaisyUI. Los custom no son los que usa el tema, son valores de "diseno general".

Jerarquia de tokens:

```
daisyUI theme  ->  --color-primary, --color-base-100, --radius-field, etc.
                  |
                  v
tokens.css      ->  reempaqueta:
                    --color-text-{primary,secondary,muted,disabled,inverse}
                    --color-{error,warning,info,success}-{bg,border}
                    --{btn,input,card,list-row}-*
                    --{font-size,font-weight,spacing,radius}-*
                    --transition-*, --shadow-*, --view-transition-*
                  |
                  v
utilities.css   ->  clases compositivas:
                    .icon, .icon-sm/lg, .input, .label-field, .btn-base,
                    .card-base, .card-base-elevated, .list-row-custom,
                    .validator-hint, .text-{error,warning,info,success}
```

## 4. Tipografía e iconografía

- **Fuente:** Roboto (cargada via Google Fonts en `src/styles.css:1`). No usar otras fuentes. Sin fallbacks custom en CSS.
- **Tamafos** via tokens `--font-size-{xs..4xl}`.
- **Iconos:** Material Symbols Outlined (cargados externamente). Aplicar via clase `icon` (definida en `utilities.css:2-10`) con modificadores `icon-sm` / `icon-lg`. Variacion fija: FILL 0, wght 400, GRAD 0, opsz 24.
- **Sin emojis** en UI. Excepcion: si el diseno lo requiere explicitamente.

## 5. Componentes: lo que sí usamos de DaisyUI

Inventario verificado (grep en `src/**/*.html`): `alert, badge, btn, card, checkbox, footer, input, label, link, loading, menu, modal, radio, select, skeleton, status, tab, tabs, textarea, toast, tooltip`.

Patrones de uso:

- **Cards:** `card card-xl` (clase de tamano de DaisyUI).
- **Buttons:** `btn btn-base btn-{severity} btn-{size} [btn-outline|btn-ghost]`. Los colores se aplican via `btn-{primary|secondary|accent|info|success|warning|error|neutral}`.
- **Inputs:** `input input-bordered` o field wrappers `ui-text-field` / `ui-email-field` / etc.
- **Tabs:** `tabs tabs-lift` + `tab` + `tab-content border-base-300 bg-base-100` (ver `modal-unlock-vault.html:97-104`).
- **Loading:** `loading loading-infinity loading-sm`.
- **Modals:** clases nativas de DaisyUI (`modal`, `modal-box`); `ui-modal` las envuelve con configuraciones (`is-fullscreen` con grid interno).
- **Toasts / alerts:** ver seccion 6 - NO usamos los nativos de DaisyUI.

## 6. Componentes: lo que reinventamos (y por qué)

`ui-toast`, `ui-alert`, `item-list`, `card-base`, `list-button` existen como wrappers propios. Decision historica: la mayoria no son realmente necesarios y duplican CSS de DaisyUI.

| Wrapper propio                     | DaisyUI nativo      | Estado                                                                                                                                                                       |
| ---------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | -------- | -------- |
| `ui-toast` (36 lineas CSS)         | `toast` + `alert`   | Migrado a `toast` (container con placement) + `alert alert-soft alert-{severity}` (cada toast). Wrapper conserva solo `toast-details` (pre para errores expandidos) y la animacion `toast-fade-in`. |
| `ui-alert` (0 lineas CSS)          | `alert`             | Migrado a `alert alert-soft alert-{severity}` puro. `icon` sigue como `input<string>()` (no se migro a `ng-content` para preservar los 7 consumidores). |
| `item-list` + `list-row-custom`    | `list` + `list-row` | Reimplementado con multiples variantes (`item-list-primary                                                                                                                   | secondary | accent | outlined | plain`). |
| `card-base` (envoltorio de `card`) | `card`              | Wrapper ligero con header/title/subtitle/actions via content projection. Vale la pena mantenerlo.                                                                            |
| `card-button` (icono redondo)      | `btn btn-circle`    | Wrapper con `icon` Material Symbols.                                                                                                                                         |

**Regla de diseno:** antes de crear un componente custom, verificar que DaisyUI no lo provea nativamente. Si se necesita wrappear, que sea para composicion (slots, content projection), no para reescribir CSS.

## 7. Layout y motion

- **Grid en home:** `grid grid-cols-12 grid-rows-[1fr_2fr_1fr_2fr]` (`home.html:2`). Decidir el grid template a nivel de pagina.
- **Cards en grid:** siempre `h-full` en `:host` para que el card llene su celda (ver `card-base.css:43-50`).
- **Motion tokens:** `--transition-fast/base/slow`, `--view-transition-duration`, `--animate-{fade-slide-in,spin,pulse,bounce}`.
- **View transitions:** activadas en `app.config.ts:6` (`withViewTransitions()`). Usar la variante `rotate-in/out` definida en `src/styles.css:94-110` con keyframes.
- **Animacion global de "noise":** `body::before` en `src/styles.css:71-79` superpone un SVG fractalNoise al body. Es muy sutil (opacity 0.035) y da textura. Mantener.
- **Loader:** `#app-loader` fixed fullscreen (styles.css:116-131) con fade. Lo controla `LoaderService`.

## 8. Convenciones de naming y estructura

- **Clases:** BEM-like con sufijo del componente (`ui-card`, `ui-button`, `password-list`, `card-title`, `card-subtitle`).
- **Selectores CSS en componentes:** todos los CSS de componentes arrancan con `@reference '../../../../styles.css'; @reference '../../../../styles/tokens.css'; @reference '../../../../styles/utilities.css';` (o sin utilities) para poder usar `@apply` con tokens custom. Si el CSS del componente no usa `@apply`, no necesita `@reference`.
- **Selectores globales de daisyUI en componentes:** no se reusan; se asume que daisyUI ya esta en el bundle global.
- **Tokens custom referenciados en CSS:** siempre via `var(--token)`, nunca con valores hardcoded.
- **Sin CSS inline** en templates salvo casos justificados (e.g. SVG inline del noise).

## 9. Anti-patterns (no hacer)

- **No** hardcodear colores (`color: #e8e8e8`) en CSS de componentes. Usar `var(--color-*)` o clases daisyUI.
- **No** hardcodear tamanos (`width: 320px`, `font-size: 1.5rem`). Usar tokens o utilidades Tailwind.
- **No** redefinir clases nativas de daisyUI en CSS custom (e.g. `.input { @apply ... }` cuando ya existe). Si se necesita override, usar el variant de daisyUI o `!` solo en ultimo caso.
- **No** usar clases Tailwind de color (`text-red-500`, `bg-blue-200`). Solo daisyUI semantic colors.
- **No** agregar `dark:` prefixes. El tema es siempre dark.
- **No** cargar mas de una fuente.
- **No** crear nuevos componentes propios sin antes verificar que daisyUI no los tenga.
- **No** anadir un segundo tema sin migrar primero `tokens.css` para no duplicar colores.
- **No** usar emojis como iconos.
- **No** usar gradientes decorativos (el unico gradiente legitimo es `frost-effect` en styles.css:82-84, para hero/banneres de marketing si se anaden).

## 10. Cómo extender

Para anadir un nuevo componente UI:

1. Verificar primero si DaisyUI ya lo provee (`alert`, `toast`, `dropdown`, `menu`, `navbar`, `table`, `steps`, `tab`, `accordion`, `collapse`, `drawer`, `stat`, `kbd`, `swap`, `timeline`, `mockup-*`, `chat`).
2. Si existe, usarlo directo con `class="..."`. Si necesita composicion (slots, signals, lifecycle), wrappear en un componente Angular standalone que aplique las clases nativas.
3. Si NO existe en DaisyUI y la necesidad es genuina, crear un componente con:
   - Selector `ui-*`
   - OnPush, signals, `inject()`.
   - Template con clases daisyUI cuando aplique.
   - CSS con `@reference` solo si usa `@apply` con tokens custom.
   - Sin `styleUrl` si no hay CSS.
4. Si es un componente presentacional con variantes (severity/size/shape), preferir un signal `input<VariantType>()` que devuelva la clase via `computed()` o getter, igual que `ui-button.ts:33-44`.
5. Si introduce un nuevo token de diseno, agregarlo a `tokens.css` dentro del layer apropiado. No crear variables ad-hoc en el CSS del componente.

## 12. Mejoras recomendadas (ordenadas por impacto)

### 12.1 Rápidas (1-2h, alto retorno)

- **Eliminar el bloque autoreferencia en `button.css:36-75`.** Es codigo muerto y confuso. `ui-button` ya pasa las clases correctas al template.
- **Consolidar `text-error/warning/info/success` en un solo lugar.** Mantener solo en `utilities.css` o en `tokens.css`, no en ambos.
- **Renombrar `.input` de `utilities.css` a `.ui-input-shell`.** Evita la colision con `class="input"` nativo de DaisyUI.
- **Remover `.btn-base` de `utilities.css`.** Las propiedades ya estan en tokens (`--btn-radius`, `--btn-font-weight`, etc.) o son defaults de DaisyUI.

### 12.2 Medias (medio día cada una)

- ~~**Migrar `ui-toast` a `toast` + `alert` de DaisyUI.**~~ **Hecho.** 161 → 36 lineas CSS. HTML usa `<div class="toast toast-top toast-end">` como contenedor y `<div class="alert alert-soft alert-{severity}">` por toast. Wrapper se mantiene para la logica de stack (`ToastService`), expand, dismiss. `toast-details` (pre para errores expandidos) sigue siendo CSS local.
- ~~**Migrar `ui-alert` a `alert` nativo.**~~ **Hecho.** 71 → 0 lineas CSS. HTML usa `<div class="alert alert-soft alert-{severity}">` con `text-{severity}` para el color del icono. API publica preservada (`icon` sigue siendo `input<string>()`); cero cambios en los 7 consumidores.
- ~~**Anadir bloque `@plugin "daisyui" { logs: false; }` en `styles.css`.**~~ **Hecho.** Consola silenciosa en dev.
- ~~**Reescribir `tokens.css` para derivar del theme.**~~ **Hecho** (commit `a1e8627`). `--color-{severity}-bg/border` derivan via `color-mix` del theme DaisyUI. Si se cambia el tema, todo se mueve.

### 12.3 Grandes (refactors, varios días)

- **Consolidar los 5 archivos de fields en uno o dos.** Hoy `ui-text-field`, `ui-email-field`, `ui-password-field`, `ui-number-field`, `ui-textarea-field`, `ui-search-field`, `ui-pin-field` son casi identicos. Probable: parametrizar `ui-input-field` con un `kind: 'text'|'email'|...` signal. Reduce ~70% del codigo.
- **Anadir un theme claro como `devhelper-light`.** Mantener los mismos tokens solo cambiando `base-100/200/300` y `base-content`. Anadir un `theme-controller` en settings. Requiere primero resolver B6.
- **Sustituir `card-base` por `card` de DaisyUI + composicion.** Si la unica razon de `card-base` es agregar header/title/subtitle, probablemente se pueda reemplazar por `card card-xl` con un patron de content projection. Evaluar despues de migrar alerts/toasts.
- **Convertir `src/app/shared/components/ui-modal/ui-modal.css` a usar `modal` nativo de DaisyUI con su `is-fullscreen` traducido a un signal.** Hoy `.modal-box.is-fullscreen` reinventa grid layout.
