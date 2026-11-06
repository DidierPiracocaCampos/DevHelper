---
name: DevHelper
description: Memoria técnica personal para un desarrollador; tema oscuro único, una sola familia y registros separados por filetes.
colors:
  primary: "#e8e8e8"
  primary-hover: "color-mix(in oklab, #e8e8e8, #000 7%)"
  primary-content: "#171717"
  base-100: "#171717"
  base-200: "#20201e"
  base-200-hover: "color-mix(in oklab, #20201e, #000 7%)"
  base-300: "#363633"
  base-content: "#e8e8e8"
  text-reading: "color-mix(in oklch, #e8e8e8 78%, transparent)"
  text-meta: "color-mix(in oklch, #e8e8e8 70%, transparent)"
  surface-lit: "color-mix(in oklch, #e8e8e8 7%, #20201e)"
  success: "oklch(55% 0.22 145)"
  error: "oklch(70% 0.25 25)"
  warning: "oklch(88% 0.18 85)"
  info: "oklch(70% 0.2 265)"
typography:
  display:
    fontFamily: "Roboto, sans-serif"
    fontSize: "clamp(2.75rem, max(6.2vw, min(16vw, 4rem)), 5.5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Roboto, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  field-lit:
    fontFamily: "Roboto, sans-serif"
    fontSize: "clamp(1.25rem, 2.8vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.28
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
  body-lg:
    fontFamily: "Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  meta:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  field: "0.25rem"
  box: "1rem"
  selector: "1rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    rounded: "{rounded.field}"
    padding: "0 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-content}"
  button-primary-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    rounded: "{rounded.field}"
    padding: "0 0.75rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
    padding: "0 1.25rem"
    height: "3rem"
  button-ghost-hover:
    backgroundColor: "{colors.base-200-hover}"
    textColor: "{colors.base-content}"
  record:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
  record-field-lit:
    backgroundColor: "{colors.surface-lit}"
    textColor: "{colors.base-content}"
    typography: "{typography.field-lit}"
    padding: "1.5rem"
  record-term:
    backgroundColor: "transparent"
    textColor: "{colors.base-content}"
    typography: "{typography.meta}"
    rounded: "{rounded.field}"
    padding: "0 0.75rem"
    height: "2.25rem"
  record-term-hover:
    backgroundColor: "{colors.base-300}"
  record-term-active:
    backgroundColor: "{colors.base-content}"
    textColor: "{colors.base-100}"
  demo-line:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    typography: "{typography.meta}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  demo-line-hit:
    backgroundColor: "{colors.surface-lit}"
    typography: "{typography.label}"
---

# Design System: DevHelper

## Overview

**Creative North Star: "El registro abierto"**

DevHelper se presenta como lo que guarda: un registro técnico con sus campos a la vista. Las superficies son planos oscuros contiguos, separados por filetes de 1px, y el contenido se ordena en campos y filas en lugar de piezas flotantes. La sensación es densa, sobria y cerrada por defecto: cero adornos y solo feedback de estado discreto.

La jerarquía nace de la escala y no del color. Roboto, la única familia, va de titulares enormes con tracking apretado a metadatos de 0.875rem; el botón principal es casi blanco y el único tono que aparece en reposo marca un estado resuelto. El campo más luminoso de una pantalla es el que contiene la respuesta.

`docs/design-context.md` sigue siendo vinculante para tema, tokens, convenciones y anti-patterns; este archivo registra cómo se expresan en lo construido. La composición en registros se ha evidenciado en la landing; el dashboard y los formularios siguen usando las cards y los campos descritos en ese documento.

**Key Characteristics:**
- Un solo tema oscuro, `devhelper`, sin alternador.
- Roboto como única familia y Material Symbols Outlined como única iconografía de interfaz.
- Superficies planas separadas por filetes de 1px en lugar de sombras.
- Acromático en reposo, salvo el verde de estado resuelto.
- Esquinas de campo de 4px en registros y botones.

## Colors

Una escala casi neutra de grises cálidos y un texto gris claro, con tonos semánticos reservados para estados.

### Primary
- **Gris Tiza** (#e8e8e8): relleno del botón principal, con texto Grafito (#171717). Es el mismo valor que el texto: la acción destaca por masa, no por tono.

### Neutral
- **Grafito** (`base-100`, #171717): fondo de página y cabecera.
- **Grafito Alzado** (`base-200`, #20201e): interior de registros y demos, banda de sección y pie.
- **Filete** (`base-300`, #363633): todos los separadores y contornos; fondo hover de los términos de búsqueda.
- **Gris Tiza como texto** (`base-content`, #e8e8e8): titulares, títulos de campo y contenido principal.
- **Texto de lectura** (Gris Tiza al 78%): ledes y párrafos explicativos.
- **Texto de metadatos** (Gris Tiza al 70%): etiquetas de contexto, fechas, tamaños y roles.
- **Campo Encendido** (Gris Tiza al 7% sobre `base-200`): la solución de un registro y la fila que responde en una demo.

### Tertiary
- **Verde Resuelto** (`success`, oklch(55% 0.22 145)): iconos de tarea hecha y de contenido cifrado.
- **Rojo Error** (`error`, oklch(70% 0.25 25)): errores y acción destructiva; en la landing, solo cerrar sesión.
- **Ámbar Aviso** y **Azul Info** (`warning` oklch(88% 0.18 85), `info` oklch(70% 0.2 265)): severidad de alertas, toasts y tooltips.

### Named Rules

**The Resolved Signal Rule.** Fuera de la severidad, `success` es el único tono en una pantalla, siempre como icono y siempre con significado: hecho o cifrado. Nunca es decoración ni relleno de CTA.

**The Lit Answer Rule.** El Campo Encendido marca solo la respuesta: la solución de un registro o la fila que acierta. Si todo se enciende, nada responde.

**The Quiet Theme Slots Rule.** `secondary` y `accent` repiten `base-200` y `base-300`: casi invisibles, no sirven para CTA. No son tonos de marca.

## Typography

**Display Font:** Roboto (con `sans-serif`)
**Body Font:** Roboto (con `sans-serif`)
**Label/Mono Font:** Roboto; `--font-mono` es un alias de la misma familia

**Character:** Una sola voz a escalas muy distintas: compacta y contundente arriba, tranquila y legible abajo. Los números tabulares (`tabular-nums`) dan a fechas y tamaños su registro técnico sin una segunda familia.

### Hierarchy
- **Display** (700, clamp hasta 5.5rem, 0.98): h1 y afirmaciones de máximo peso, como el cierre y la frontera de cifrado. Muy pocas por página.
- **Headline** (700, clamp hasta 3.25rem, 1.05): títulos de sección, con `max-width` de 20 a 24ch y `text-wrap: balance`.
- **Field Lit** (500, clamp hasta 2.5rem, 1.28): el contenido de un campo Solución. Es el único cuerpo de texto a escala de titular.
- **Title** (600, 1.5rem): filas y columnas dentro de una sección. Un paso mayor (600, 1.25rem) nombra las filas de checklist.
- **Title Small** (600, 1.125rem): título de un registro.
- **Body Large** (400, 1.125rem, 1.55): ledes y contenido de campo en escritorio; máximo 60ch.
- **Body** (400, 1rem, 1.55): explicación; 46 a 56ch.
- **Label** (500, 0.875rem): nombre de un campo, como Problema o Solución. En caja normal, sin mayúsculas sostenidas ni tracking abierto.
- **Meta** (400, 0.875rem): metadatos y líneas de demo.

### Named Rules

**The One Family Rule.** Roboto en pesos 400, 500, 600 y 700. La clase `font-mono` no se usa en plantillas porque cae al mono del sistema.

**The Tighter With Scale Rule.** El tracking se aprieta con el tamaño: -0.035em en display, -0.03em en headline, -0.015em en title, -0.01em en field lit; el texto corriente queda a 0.

**The Labels Name Fields Rule.** Una etiqueta pequeña nombra el campo que tiene debajo. No hay antetítulos sobre los titulares.

## Layout

El contenedor es único: máximo 90rem, centrado, con gutters de 1rem, 2rem desde 640px y 4rem desde 1024px. Las secciones respiran con 5rem de relleno vertical (`spacing.section`) o 3rem en secciones de transición; internamente el ritmo sale de la escala de espaciado.

La composición es de filas y registros a todo el ancho. Los grids usan columnas `minmax(0, …fr)` en proporciones asimétricas (3:4:5 en filas de característica, 4:5 en campos) y se apilan en una sola columna en móvil. Los cambios de composición ocurren en puntos propios: 48rem (dos columnas), 56rem, 64rem (filas de tres columnas) y 72rem (registro de tres columnas con alto ligado al viewport mediante `clamp` y `svh`).

**The Hairline Rule.** Lo contiguo se separa con 1px de `base-300`, no con huecos ni contenedores anidados. Los filetes se reorientan al cambiar de columnas: horizontales apilados, verticales en fila.

**The Band Rule.** Un cambio de sección de mayor peso puede invertir el par de superficies: banda `base-200` con registro `base-100` dentro. El par se invierte; no aparece un tercer plano.

## Elevation & Depth

El sistema es plano (`--depth: 0`). La profundidad se expresa con dos planos tonales, filetes y el Campo Encendido, que sube por luminosidad. Toda la página lleva un grano fractal fijo muy tenue (opacidad 0.035) como textura material, compartido y sin movimiento.

### Shadow Vocabulary
- **Barra de foco** (`box-shadow: inset 0 -2px 0 var(--color-base-content)`): indica foco en la barra de búsqueda de un registro.
- **Flotante** (utilidad `shadow-lg`): solo en menús desplegables, que sí salen del plano.
- **Card de aplicación** (`--card-shadow`, igual a `--shadow-md`): utilidad `.card-base` de la app; no aparece en la landing.

### Named Rules

**The Flat At Rest Rule.** Lo que vive en el plano de la página no lleva sombra. La sombra queda para lo que flota o para indicar estado.

## Shapes

Geometría de esquina pequeña. Registros, demos, checklists, fronteras y botones usan el radio de campo (4px); las filas interiores quedan a escuadra contra el contorno. El radio de caja y de selector (16px) pertenece a piezas flotantes y controles de la app: menú desplegable, cards, modales, alertas, badges y toggles. La tarea en blanco de cierre redondea solo sus esquinas superiores y queda abierta por abajo, apoyada en el pie.

## Components

### Buttons
Directos y sin ornamento. Siempre `btn` de DaisyUI, sin reestilizar.
- **Shape:** esquina de campo (4px).
- **Primary:** relleno Gris Tiza con texto Grafito; tamaño grande de 3rem de alto y 1.25rem de relleno lateral, y compacto de 2rem en la cabecera.
- **Hover / Focus:** el relleno oscurece un 7% hacia negro; foco con el contorno por defecto de DaisyUI.
- **Ghost:** sin fondo ni borde en reposo, junto al primario como salida secundaria; en hover toma `base-200` oscurecido.
- **Destructive:** `btn-error btn-outline`, solo para cerrar sesión.

### Chips
Términos de búsqueda de un registro: pequeños, contorneados, siempre una acción real.
- **Style:** contorno `base-300` de 1px, sin fondo, Meta, 2.25rem de alto.
- **State:** hover con fondo `base-300`; activo invertido, con fondo `base-content` y texto `base-100`, expuesto con `aria-pressed`; `focus-visible` con contorno de 2px y separación de 2px.

### Inputs / Fields
En la landing, el campo vive en la barra del registro.
- **Style:** input transparente sin borde propio, con icono de búsqueda a la izquierda y placeholder al 68% de `base-content`.
- **Focus:** la barra entera recibe la Barra de foco.
- Los formularios de la app usan los campos `ui-*` y `input` de DaisyUI; ver `docs/design-context.md`.

### Navigation
- **Cabecera:** fija, fondo `base-100`, filete inferior; marca con icono `code` y texto 700 con tracking apretado a la izquierda.
- **Enlaces:** 0.875rem, subrayado solo en hover, seguidos por el par ghost y primario.
- **Móvil:** bajo 48rem, botón cuadrado ghost con icono `menu` que abre un menú de `base-200` con contorno, radio de caja y sombra flotante.
- **Pie:** banda `base-200` con filete superior, cuatro columnas en texto de 0.875rem, títulos a 600.

### Record
La pieza firma: un registro de tarea a todo el ancho con contorno de 1px y fondo `base-200`.
- **Orden:** barra de búsqueda, cabecera con título e icono de estado, Problema, Solución y adjuntos, cada parte separada por filetes.
- **Responsive:** una columna; desde 48rem Problema y Solución en 4:5; desde 72rem añade adjuntos como tercera columna de hasta 20rem.
- **Solución:** en Campo Encendido y Field Lit. Al aparecer se enciende desde `base-200` en 900ms con `cubic-bezier(0.16, 1, 0.3, 1)`; con `prefers-reduced-motion` no hay animación.
- **Vacío:** el mensaje ocupa el registro y ofrece volver con un botón ghost.
- **Datos:** todo contenido de demostración se etiqueta como ejemplo.

### Feature Row
Fila con filete superior: título, explicación y demo, en 3:4:5 desde 64rem. La demo es un fragmento de registro con filas de 2.75rem como mínimo, icono de 1rem a la izquierda y dato tabular a la derecha. Los atajos usan `kbd kbd-sm`.

### Checklist
Registro de filas numeradas por orden, no por cifra: icono `radio_button_unchecked`, título, texto y enlace subrayado, en una sola línea de cuatro columnas desde 64rem.

### Boundary
Par de columnas contiguas en un único contorno, para contrastar dos estados. El lado protegido lleva `base-200` e iconos verdes; el otro queda en `base-100` con iconos neutros.

### Blank Record
Tarea vacía que retoma los campos Problema y Solución con su texto al 72%; es decorativa, `aria-hidden`, y cierra la página.

### Technology List
Filas de 3.25rem con filete, logo de 1.5rem, nombre a 500 y rol en Meta. Las marcas de terceros, que Material Symbols no incluye, se tiñen a un solo color con `mask-image` sobre `base-content`.

## Do's and Don'ts

### Do:
- **Do** separa lo contiguo con 1px de `base-300` y usa solo dos planos, `base-100` y `base-200`.
- **Do** referencia color con `var(--color-*)`; deriva texto secundario y Campo Encendido con `color-mix` sobre `base-content`.
- **Do** reserva el Campo Encendido para la respuesta y `success` para los estados hecho y cifrado.
- **Do** aplica iconos con la clase `icon` y sus variantes `icon-sm` e `icon-lg`, con `aria-hidden` cuando acompañan a un texto.
- **Do** añade cualquier tamaño nuevo que se reutilice a `tokens.css` antes de usarlo en más de un sitio.
- **Do** respeta `prefers-reduced-motion` en cualquier animación de contenido.
- **Do** etiqueta como ejemplo todo dato de demostración.

### Don't:
- **Don't** compongas superficies de marketing como rejillas de cards con icono ni como hero partido con captura; esta restricción no aplica a las cards del dashboard.
- **Don't** pongas sombra a lo que vive en el plano de la página.
- **Don't** cargues otra familia, uses la clase `font-mono` ni añadas un segundo tema sin migrar antes `tokens.css`.
- **Don't** uses emojis, iconos coloridos, gradientes decorativos ni animaciones de celebración como confetti o shake.
- **Don't** uses clases de color de Tailwind como `text-red-500`, prefijos `dark:` ni colores hexadecimales en CSS de componentes.
- **Don't** nombres clases propias como componentes de DaisyUI (`.hero`, `.stack`, `.card`, `.menu`): heredan su layout.
- **Don't** añadas antetítulos sobre los titulares.
