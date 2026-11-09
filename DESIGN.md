---
name: DevHelper
description: Memoria técnica personal para un desarrollador; tema oscuro único, una sola familia y planos separados por filetes.
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
  surface-lit: "color-mix(in oklch, #e8e8e8 7%, #171717)"
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
  block-title:
    fontFamily: "Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
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
    padding: "0 1rem"
    height: "2.5rem"
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
    backgroundColor: "{colors.base-100}"
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
  product-window:
    backgroundColor: "{colors.base-200}"
    rounded: "{rounded.box}"
  product-window-bar:
    textColor: "{colors.text-meta}"
    typography: "{typography.meta}"
    padding: "0 1rem"
    height: "2.5rem"
  capability-link:
    backgroundColor: "transparent"
    typography: "{typography.label}"
    padding: "0 0.75rem"
    height: "3rem"
  capability-link-hover:
    backgroundColor: "{colors.base-200}"
  feature-shot:
    rounded: "{rounded.box}"
  tile:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.box}"
    padding: "1.5rem 1.5rem 0"
  tile-capture:
    rounded: "{rounded.field}"
---

# Design System: DevHelper

## Overview

**Creative North Star: "El registro abierto"**

DevHelper se presenta como lo que guarda: un registro técnico con sus campos a la vista. Las superficies son planos oscuros contiguos, separados por filetes de 1px, y el contenido se ordena en campos, filas y marcos con capturas reales, sin piezas que floten. La sensación es densa, sobria y cerrada por defecto: cero adornos y solo feedback de estado discreto.

La jerarquía nace de la escala y no del color. Roboto, la única familia, va de titulares enormes con tracking apretado a metadatos de 0.875rem; el botón principal es casi blanco y el único tono que aparece en reposo marca un estado resuelto. El campo más luminoso de una pantalla es el que contiene la respuesta.

`docs/design-context.md` sigue siendo vinculante para tema, tokens, convenciones y anti-patterns; este archivo registra cómo se expresan en lo construido. La landing es una página de producto clásica: hero centrado, ventana del producto con captura real, bloques y tiles con capturas y escenas, y el registro como demostración del buscador. El dashboard y los formularios siguen usando las cards y los campos descritos en ese documento.

**Key Characteristics:**
- Un solo tema oscuro, `devhelper`, sin alternador.
- Roboto como única familia y Material Symbols Outlined como única iconografía de interfaz.
- Superficies planas separadas por filetes de 1px en lugar de sombras.
- Acromático en reposo, salvo el verde de estado resuelto.
- Esquinas de campo de 4px en registros y botones; marcos de caja de 16px alrededor de las capturas.
- Capturas reales con datos de ejemplo como prueba del producto.
- Movimiento que termina en el estado ya visible sin JS y que se retira con `prefers-reduced-motion`.

## Colors

Una escala casi neutra de grises cálidos y un texto gris claro, con tonos semánticos reservados para estados.

### Primary
- **Gris Tiza** (#e8e8e8): relleno del botón principal, con texto Grafito (#171717). Es el mismo valor que el texto: la acción destaca por masa, no por tono.

### Neutral
- **Grafito** (`base-100`, #171717): fondo de página y cabecera.
- **Grafito Alzado** (`base-200`, #20201e): tiles, banda de sección, lado protegido de una frontera, tarea en blanco y pie.
- **Filete** (`base-300`, #363633): todos los separadores y contornos; fondo hover de los términos de búsqueda.
- **Gris Tiza como texto** (`base-content`, #e8e8e8): titulares, títulos de campo y contenido principal.
- **Texto de lectura** (Gris Tiza al 78%): ledes y párrafos explicativos.
- **Texto de metadatos** (Gris Tiza al 70%): etiquetas de contexto, fechas, tamaños y roles.
- **Campo Encendido** (Gris Tiza al 7% sobre `base-100`): la solución de un registro. Sobre una captura, el mismo 7% sobre transparente enciende el campo Solución real.

### Tertiary
- **Verde Resuelto** (`success`, oklch(55% 0.22 145)): iconos de tarea hecha y de contenido cifrado.
- **Rojo Error** (`error`, oklch(70% 0.25 25)): errores y acción destructiva; en la landing, solo cerrar sesión.
- **Ámbar Aviso** y **Azul Info** (`warning` oklch(88% 0.18 85), `info` oklch(70% 0.2 265)): severidad de alertas, toasts y tooltips.

### Named Rules

**The Resolved Signal Rule.** Fuera de la severidad, `success` es el único tono en una pantalla, siempre como icono y siempre con significado: hecho o cifrado. Nunca es decoración ni relleno de CTA.

**The Lit Answer Rule.** El Campo Encendido marca solo la respuesta: la solución de un registro o el campo Solución de una captura. Si todo se enciende, nada responde.

**The Quiet Theme Slots Rule.** `secondary` y `accent` repiten `base-200` y `base-300`: casi invisibles, no sirven para CTA. No son tonos de marca.

## Typography

**Display Font:** Roboto (con `sans-serif`)
**Body Font:** Roboto (con `sans-serif`)
**Label/Mono Font:** Roboto; `--font-mono` es un alias de la misma familia

**Character:** Una sola voz a escalas muy distintas: compacta y contundente arriba, tranquila y legible abajo. Los números tabulares (`tabular-nums`) dan a fechas y tamaños su registro técnico sin una segunda familia.

### Hierarchy
- **Display** (700, clamp hasta 5.5rem, 0.98): h1 y afirmaciones de máximo peso, como el cierre y el título de Seguridad. Muy pocas por página. El h1 del hero usa este tamaño desde 48rem con interlínea 1 y, por debajo, un clamp de 2.5rem a 3.5rem.
- **Headline** (700, clamp hasta 3.25rem, 1.05): títulos de sección, con `max-width` de 18 a 24ch y `text-wrap: balance`.
- **Block Title** (700, clamp hasta 2.5rem, 1.1): título de un bloque de característica.
- **Field Lit** (500, clamp hasta 2.5rem, 1.28): el contenido de un campo Solución. Es el único cuerpo de texto a escala de titular.
- **Title** (600, 1.5rem): títulos de tile, de lado de frontera y de la lista de tecnología.
- **Title Small** (600, 1.125rem): título de un registro y de la tarea en blanco.
- **Body Large** (400, 1.125rem, 1.55): ledes, texto de bloque y contenido de campo en escritorio; de 44 a 60ch.
- **Body** (400, 1rem, 1.55): explicación, como el texto de una tile; 44 a 52ch.
- **Label** (500, 0.875rem): nombre de un campo, como Problema o Solución, y enlaces de la franja de funciones. En caja normal, sin mayúsculas sostenidas ni tracking abierto.
- **Meta** (400, 0.875rem): metadatos, barra de la ventana, pies de captura y filas de escena.

### Named Rules

**The One Family Rule.** Roboto en pesos 400, 500, 600 y 700. La clase `font-mono` no se usa en plantillas porque cae al mono del sistema.

**The Tighter With Scale Rule.** El tracking se aprieta con el tamaño: -0.035em en display, -0.03em en headline, -0.02em en block title, -0.015em en title, -0.01em en field lit; el texto corriente queda a 0.

**The Labels Name Fields Rule.** Una etiqueta pequeña nombra el campo que tiene debajo. No hay antetítulos sobre los titulares.

## Layout

El contenedor es único: máximo 90rem, centrado, con gutters de 1rem, 2rem desde 640px y 4rem desde 1024px. La cabecera fija reserva 4.5rem y las anclas paran a 5.5rem. Las secciones respiran con 5rem de relleno vertical (`spacing.section`) o 3rem en secciones de transición; internamente el ritmo sale de la escala de espaciado.

El hero y el cierre se centran; el resto se alinea a la izquierda y ocupa todo el contenedor. Los grids usan columnas `minmax(0, …fr)` y se apilan en una sola columna en móvil: 5:7 alternado en bloques de característica, 12 columnas repartidas en 7 y 5 en tiles, 4:5 en campos. Los cambios de composición ocurren en puntos propios: 48rem (fronteras y campos a dos columnas), 56rem (lista de tecnología), 64rem (tiles, franja de funciones en una línea), 72rem (registro de tres columnas con alto ligado al viewport mediante `clamp` y `svh`) y 80rem (bloques a dos columnas, solo donde la captura conserva su texto legible junto a la explicación).

**The Hairline Rule.** Dentro de una pieza, lo contiguo se separa con 1px de `base-300`, no con huecos ni contenedores anidados. Los filetes se reorientan al cambiar de columnas: horizontales apilados, verticales en fila. Las piezas independientes, como las tiles, se separan con un hueco de 1rem y llevan su propio contorno.

**The Band Rule.** Un cambio de sección de mayor peso puede invertir el par de superficies: banda `base-200` con registro `base-100` dentro. El par se invierte; no aparece un tercer plano.

## Elevation & Depth

El sistema es plano (`--depth: 0`). La profundidad se expresa con dos planos tonales, filetes y el Campo Encendido, que sube por luminosidad. Las capturas tampoco se alzan: su marco es un contorno y la ventana del producto no lleva sombra. Toda la página lleva un grano fractal fijo muy tenue (opacidad 0.035) como textura material, compartido y sin movimiento.

### Shadow Vocabulary
- **Barra de foco** (`box-shadow: inset 0 -2px 0 var(--color-base-content)`): indica foco en la barra de búsqueda de un registro.
- **Flotante** (utilidad `shadow-lg`): solo en menús desplegables, que sí salen del plano.
- **Card de aplicación** (`--card-shadow`, igual a `--shadow-md`): utilidad `.card-base` de la app; no aparece en la landing.

### Named Rules

**The Flat At Rest Rule.** Lo que vive en el plano de la página no lleva sombra. La sombra queda para lo que flota o para indicar estado; el hover de una tile aclara su contorno en lugar de alzarla.

## Shapes

Dos radios con papeles distintos. El radio de campo (4px) es el de lo que se lee y se pulsa: registros, fronteras, tarea en blanco, términos y botones; las filas interiores quedan a escuadra contra el contorno. El radio de caja (16px) enmarca capturas y escenas de producto: ventana del producto, marco de bloque y tile. También pertenece a las piezas flotantes y controles de la app: menú desplegable, cards, modales, alertas, badges y toggles. La captura dentro de una tile redondea 4px arriba y queda abierta por abajo, apoyada en el borde de la tile. El sello de cifrado no tiene radio: es una banda entre dos filetes.

## Components

### Buttons
Directos y sin ornamento. Siempre `btn` de DaisyUI, sin reestilizar.
- **Shape:** esquina de campo (4px).
- **Primary:** relleno Gris Tiza con texto Grafito; tamaño grande de 3rem de alto y 1.25rem de relleno lateral; en la cabecera, 2.5rem de alto, 1rem de relleno lateral y texto de 0.875rem.
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
- **Cabecera:** fija, fondo `base-100`; el filete inferior aparece en los primeros 3rem de scroll donde el navegador admite animación ligada al scroll y está siempre presente en el resto. Marca con icono `code` y texto 700 con tracking apretado a la izquierda.
- **Enlaces:** 0.875rem, subrayado solo en hover, seguidos por el par ghost y primario.
- **Móvil:** bajo 48rem, botón cuadrado ghost con icono `menu` que abre un menú de `base-200` con contorno, radio de caja y sombra flotante.
- **Pie:** banda `base-200` con filete superior, cuatro columnas desde 48rem en texto de 0.875rem, títulos a 600.

### Product Window
La prueba principal: una captura real a todo el ancho del contenedor, dentro de una ventana plana.
- **Marco:** contorno de 1px, radio de caja, fondo `base-200` y sin sombra.
- **Barra:** 2.5rem de alto, filete inferior, icono `code` de 1rem y nombre del producto en Meta al 70%. Sin botones de ventana simulados.
- **Imagen:** `picture` con captura de escritorio y, bajo 48rem, captura móvil centrada con un máximo de 24rem.
- **Pie:** `figcaption` fuera del marco, en Meta, que declara la pantalla real y los datos de ejemplo.

### Capabilities Strip
Índice de funciones bajo el hero: una banda entre dos filetes con enlaces a sus anclas, no una rejilla de cards.
- **Enlace:** 3rem de alto como mínimo, icono de 1rem y Label con el texto al 85%.
- **State:** hover con fondo `base-200`; `focus-visible` con contorno interior de 2px.
- **Responsive:** dos columnas sin filetes interiores; desde 64rem, una línea con cada enlace centrado y filetes verticales.

### Feature Block
Explicación y captura grande para las dos funciones centrales.
- **Texto:** Block Title y Body Large de hasta 44ch; apilado, va antes de la captura.
- **Marco:** contorno de 1px y radio de caja, sin fondo propio ni barra de ventana.
- **Imagen:** un recorte propio para móvil, para que el texto de la captura siga siendo legible.
- **Responsive:** apilado; desde 80rem, 5:7 con 3rem de hueco, y 7:5 con la captura a la izquierda en el bloque alterno.

### Tile
Pieza de función secundaria, con la prueba en la propia pieza.
- **Estructura:** Title, Body de hasta 46ch y, empujado al fondo, un visual: una captura real o una escena en código. No lleva icono de cabecera.
- **Forma:** contorno de 1px, radio de caja, fondo `base-200` y 1.5rem de relleno, sin relleno inferior cuando el visual es una captura.
- **Captura:** contorno de 1px sin borde inferior y esquinas superiores de 4px; se apoya en el borde de la tile.
- **Responsive:** apiladas con 1rem de hueco; desde 64rem, filas de 7 y 5 columnas que alternan su orden, nunca piezas iguales.
- **State:** en hover el contorno pasa a `base-content` al 30% en 200ms.

### In-capture Scenes
Movimiento que señala algo real de la pantalla y termina en la propia pantalla.
- **Sobre captura:** capa `aria-hidden` en el marco, colocada con porcentajes medidos sobre cada recorte, con valores propios en móvil. Si cambia un recorte, hay que volver a medirlos.
- **Tarea hecha:** un círculo abierto en `base-100` tapa la marca real de hecho mientras espera y se desvanece; un contorno de 1px en `base-content` destella sobre la fila.
- **Solución:** contorno de 1px al 70% y relleno al 7% sobre el campo real; sube al 18% y reposa en el 7%.
- **En código:** filas con filete, de 2.75rem como mínimo y en Meta. Los eventos entran en secuencia; la consulta de IA aparece y su respuesta se descubre de izquierda a derecha. Son texto real, legible sin animación.
- **Sello de cifrado:** banda entre filetes con un nombre, la etiqueta Ejemplo y un valor cuyo texto plano se barre hasta dejar el cifrado; el candado verde aparece al final. Se expone como una sola imagen con `aria-label`.

### Record
La pieza firma: un registro de tarea a todo el ancho con contorno de 1px, radio de campo y fondo `base-100`, dentro de la banda `base-200`. Es la demostración funcional del buscador.
- **Orden:** barra de búsqueda con términos, cabecera con título e icono de estado, Problema, Solución y adjuntos, cada parte separada por filetes.
- **Responsive:** una columna; desde 48rem Problema y Solución en 4:5 con adjuntos en una fila inferior; desde 72rem los adjuntos pasan a una tercera columna de hasta 20rem y el registro liga su alto al viewport.
- **Solución:** en Campo Encendido y Field Lit. Se enciende desde `base-100` en 900ms cada vez que aparece una tarea; con `prefers-reduced-motion` no hay animación.
- **Vacío:** el mensaje ocupa el registro y ofrece volver con un botón ghost.
- **Datos:** todo contenido de demostración se etiqueta como ejemplo. Los atajos usan `kbd kbd-md`.

### Boundary
Par de columnas contiguas en un único contorno, para contrastar dos estados; se apilan bajo 48rem. El lado protegido lleva `base-200` e iconos verdes; el otro queda en `base-100` con iconos neutros. Debajo, una advertencia a mayor escala con icono neutro y una lista de datos de dos y tres columnas, sin contornos.

### Blank Record
Tarea vacía de contorno completo, con radio de campo y fondo `base-200`, que retoma los campos Problema y Solución con su texto al 72%; es decorativa, `aria-hidden`, y cierra la página bajo el titular y los botones centrados.

### Technology List
Filas de 3.25rem con filete, logo de 1.5rem, nombre a 500 y rol en Meta. Las marcas de terceros, que Material Symbols no incluye, se tiñen a un solo color con `mask-image` sobre `base-content`.

### Página de Obsidian (`/obsidian`)
Gemela de la landing para el plugin DevHelper Dashboard y el theme DevHelper: mismo hero centrado y la misma ventana del producto, seguidos de una lista de capacidades, el bloque del theme, la documentación y las preguntas frecuentes. Los enlaces externos salen de `OBSIDIAN_LINKS`.
- **Aparte del hero:** línea en Meta bajo los botones con el deep link `obsidian://`, siempre secundario a la tienda web.
- **Lista de capacidades:** filas con filete superior e inferior, Title Small y Body de hasta 46ch; una columna, dos desde 48rem y tres desde 64rem. Sin iconos ni cards.
- **Bloque del theme:** Feature Block dentro de una banda `base-200` (Band Rule), con botón primario a la tienda y ghost al deep link; recorte propio para móvil.
- **Índice de documentación:** bajo 64rem, fila de términos contorneados de 2.25rem; desde 64rem, columna fija de 14rem pegada a 5.5rem con un filete izquierdo, y la entrada activa (`aria-current`, por IntersectionObserver) lleva el filete en `base-content`.
- **Documento:** columna de lectura de 70ch, secciones separadas por filetes, título en Title, pasos en lista numerada con marcadores al 70%. Rutas y propiedades en `.obsidian-path`: Roboto a 0.875em sobre `base-200`, contorno de 1px, radio de campo y `overflow-wrap: anywhere`.
- **Preguntas frecuentes:** `details` con filete inferior, `summary` de 3.25rem a 500 y el icono `add`/`remove` de Material Symbols al 70%.

### Franja de Obsidian (landing)
Banda `base-200` entre filetes, antes del cierre: Headline y Body Large a la izquierda; a la derecha, primario hacia `/obsidian` y ghost hacia la tienda con `open_in_new`. Apilada bajo 64rem.

### Motion
Sobrio y de una sola pasada: el movimiento confirma lo que ya está ahí.

- **Curva y tiempos:** `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`) en todo el movimiento de contenido; `--motion-reveal` (700ms) para apariciones y `--motion-focal` (1100ms) para el momento focal.
- **Entrada del hero:** titular, lede y botones suben 1rem y aparecen en 700ms, escalonados 0, 80 y 160ms. Es CSS puro: corre sin JS y termina visible.
- **Momento focal:** la ventana del producto se abre desde un recorte de 14% arriba y 6% a los lados, sube 2.5rem y se aclara de brillo 0.6 a 1 en `--motion-focal`, con 240ms de retraso.
- **Directiva Reveal:** `landingReveal` actúa solo tras renderizar en el navegador. Lo que ya está en el viewport recibe `.is-revealed` sin estado oculto; lo demás recibe `.reveal-pending` (opacidad 0, 1.5rem abajo) y se revela al cruzar el 15% con un margen inferior del 8%. `revealDelay` escalona piezas hermanas, hasta 240ms. Se observa una sola vez.
- **Escenas:** cuelgan de `.is-revealed`, así que se reproducen una vez al entrar, de 400 a 1400ms. Las duraciones de cada escena son propias, con la misma curva.
- **Filete de cabecera:** animación ligada al scroll, solo si el navegador la admite y no se pide movimiento reducido.
- **Sin JS e impresión:** el HTML prerenderizado no lleva clases de estado, así que todo se ve. `.reveal-pending` se anula al imprimir.
- **Movimiento reducido:** Reveal no añade ninguna clase, el CSS anula `.reveal-pending` y `.is-revealed`, y hero y solución del registro declaran `animation: none`. Sin `.is-revealed` las escenas se quedan en su estado final.

**The End State Default Rule.** El estado sin clases de una pieza animada es el final. El estado oculto o previo solo existe bajo `.reveal-pending`, que añade JS; apagar JS o el movimiento nunca esconde contenido.

**The Top-Level Animation Rule.** En el CSS de un componente, `animation` se declara a nivel superior, con un override `reduce` o tras un gate `.is-revealed`, no dentro de `@media`. En el build minificado, un `animation` que abre su bloque dentro de `@media` conserva el nombre original mientras el keyframe sí se renombra, y la animación se pierde en silencio. Si dudas, comprueba `dist`: el nombre del `animation` y el del `@keyframes` deben coincidir.

## Do's and Don'ts

### Do:
- **Do** separa lo contiguo dentro de una pieza con 1px de `base-300` y usa solo dos planos, `base-100` y `base-200`.
- **Do** referencia color con `var(--color-*)`; deriva texto secundario y Campo Encendido con `color-mix` sobre `base-content`.
- **Do** reserva el Campo Encendido para la respuesta y `success` para los estados hecho y cifrado.
- **Do** aplica iconos con la clase `icon` y sus variantes `icon-sm` e `icon-lg`, con `aria-hidden` cuando acompañan a un texto.
- **Do** añade cualquier tamaño nuevo que se reutilice a `tokens.css` antes de usarlo en más de un sitio.
- **Do** respeta `prefers-reduced-motion` en cualquier animación de contenido, y deja que el estado sin clases sea el final.
- **Do** declara `animation` a nivel superior en el CSS de componente, con override `reduce` o gate `.is-revealed`.
- **Do** muestra el producto con capturas reales con datos de ejemplo, enmarcadas con contorno y radio de caja, cada una con su `.webp.json` de procedencia.
- **Do** etiqueta como ejemplo todo dato de demostración.

### Don't:
- **Don't** estructures una superficie de marketing como rejilla de cards con icono del mismo tamaño; una tile lleva una captura real o una escena en código y alterna 7 y 5 columnas. Esta restricción no aplica a las cards del dashboard.
- **Don't** pongas sombra a lo que vive en el plano de la página, incluidas la ventana del producto y las tiles.
- **Don't** animes escenas en bucle: se reproducen una vez al entrar.
- **Don't** cargues otra familia, uses la clase `font-mono` ni añadas un segundo tema sin migrar antes `tokens.css`.
- **Don't** uses emojis, iconos coloridos, gradientes decorativos ni animaciones de celebración como confetti o shake.
- **Don't** uses clases de color de Tailwind como `text-red-500`, prefijos `dark:` ni colores hexadecimales en CSS de componentes.
- **Don't** nombres clases propias como componentes de DaisyUI (`.hero`, `.stack`, `.card`, `.menu`): heredan su layout.
- **Don't** añadas antetítulos sobre los titulares.
