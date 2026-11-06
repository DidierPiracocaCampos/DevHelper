---
version: 1
slug: "src-app-landing-pages-landing-landing-html"
primary_target: "src/app/landing/pages/landing/landing.html"
related_targets: ["src/app/landing/components"]
---

Scope: landing `/` (mode: Persuade). Header, secciones y footer del módulo landing.
Audience/job: desarrollador individual que vuelve a topar con problemas ya resueltos. Action: crear cuenta. Proof: tareas de ejemplo etiquetadas, buscador de demostración funcional, desglose exacto de lo que se cifra.
Constraints: identidad existente (tema devhelper, Roboto, Material Symbols, DaisyUI); sin precios, clientes ni métricas; no afirmar cifrado total ni "todo open source".
Unresolved: términos legales y /about siguen afirmando más cifrado del implementado.

## Direction contract

THESIS: La página es una tarea de DevHelper abierta a gran escala; recordar lo resuelto es la promesa. Rechaza el hero partido con captura y las rejillas de cards bajo título centrado.

OWN-WORLD: Superficies base-100/base-200 separadas por filetes de 1px base-300, esquinas de campo pequeñas, Roboto en tamaños grandes con tracking ajustado, un único acento success para el estado "hecha". Registros, campos y filas, nunca cards con icono.

STORY: El visitante reconoce el error que ya resolvió, prueba a buscar en la demo, ve qué cabe en una tarea, aprende exactamente qué se cifra y qué no, y crea su workspace.

FIRST VIEWPORT: Arriba, h1 enorme "Este error ya lo resolviste." a la izquierda, lede y Crear mi workspace a la derecha. Debajo, a todo el ancho, el registro de ejemplo: barra de búsqueda, título, Problema, Solución (el campo más luminoso) y adjuntos.

FORM: "La página es una tarea", candidata 3 de mi lista ordenada. seed:d9994c24a2aa9432. Interacción firma: buscar en tareas de ejemplo; la Solución se enciende al aparecer.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
