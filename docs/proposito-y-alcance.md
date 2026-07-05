# Propósito y Alcance

Documento fundacional de DevHelper. Define qué es, qué problema resuelve, a quién va dirigido, qué incluye y qué queda fuera.

> **Documentos relacionados:** [`casos-de-uso.md`](casos-de-uso.md) (cómo se usa) · [`estado-actual.md`](estado-actual.md) (qué existe hoy) · [`design-context.md`](design-context.md) (cómo se ve y se siente)

---

## Tabla de contenidos

1. [Propósito](#1-propósito)
2. [Audiencia objetivo](#2-audiencia-objetivo)
3. [Alcance (in scope)](#3-alcance-in-scope)
4. [Fuera de alcance (out of scope)](#4-fuera-de-alcance-out-of-scope)
5. [Propuesta de valor](#5-propuesta-de-valor)
6. [Modelo de monetización](#6-modelo-de-monetización-límites-del-mvp)
7. [Métricas de éxito sugeridas](#7-métricas-de-éxito-sugeridas)
8. [Identidad visual (resumen)](#8-identidad-visual-resumen)

---

## 1. Propósito

DevHelper es un **workspace personal cifrado** para que un desarrollador pueda registrar, organizar y recuperar su conocimiento de trabajo sin tener que saltar entre múltiples aplicaciones (notas, gestor de contraseñas, calendario, almacenamiento).

Su problema central es la **memoria técnica personal persistente**: a lo largo de meses y años de trabajo, un desarrollador se encuentra repetidamente con errores, decisiones de arquitectura, credenciales, archivos recurrentes y compromisos temporales que termina perdiendo o re-buscando una y otra vez. DevHelper existe para que ese conocimiento se acumule en un único lugar cifrado y esté disponible cuando se necesita.

> **En una frase:** un vault cifrado donde vive tu conocimiento técnico de trabajo, accesible cuando reaparece el mismo problema.

---

## 2. Audiencia objetivo

| Tipo                   | Definición                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Primario**           | Un desarrollador individual, en uso estrictamente privado.                                    |
| **Secundario**         | No aplica en esta versión (no hay roles, ni cuentas de terceros, ni administración delegada). |
| **Restricción de uso** | Una cuenta = una persona. La cuenta no se comparte.                                           |

---

## 3. Alcance (in scope)

El producto cubre, dentro de un único workspace cifrado por usuario:

### 3.1 Estructura del workspace

```text
Workspace (único por usuario)
├── Proyectos (unidades principales de organización)
│   └── Tareas dentro de cada proyecto
│       ├── Ficheros adjuntos a la tarea
│       └── Passwords asociados a la tarea
└── Elementos globales (visibles desde cualquier proyecto)
    ├── Ficheros globales
    ├── Passwords globales
    └── Eventos / Recordatorios (siempre globales)
```

### 3.2 Tipos de tarea

| Tipo               | Características                                            | Uso                                |
| ------------------ | ---------------------------------------------------------- | ---------------------------------- |
| **Tarea "normal"** | Estado (pendiente / hecha) + fecha de vencimiento opcional | Tareas accionables con seguimiento |
| **Tarea "nota"**   | Texto libre persistente, sin estado ni vencimiento         | Contexto, código, links, apuntes   |

### 3.3 Capacidades funcionales

- Autenticación del usuario con email/password o Google (Firebase Auth).
- Vault cifrado (AES-GCM) protegido por PIN o Passkey, que cubre los datos sensibles del workspace.
- Gestión de proyectos, tareas, ficheros, passwords y eventos con la estructura descrita.
- Búsqueda y recuperación de entradas previamente registradas.
- Límites del plan gratuito y ampliación mediante membresía mensual (ver [sección 6](#6-modelo-de-monetización-límites-del-mvp)).

### 3.4 Asistente IA local (opcional, opt-in)

- Asistente Q&A estructurado que responde a consultas sobre el workspace del usuario.
- 100% client-side: el modelo y los datos nunca salen del dispositivo.
- Activable manualmente desde un card dedicado en el home. Por defecto desactivado.
- Limitado a preguntas estructuradas (lista de pendientes, búsqueda por proyecto/tag, etc.).
- No genera texto libre, no mantiene conversación, no resume con NLG.
- Detalles en `docs/superpowers/specs/2026-07-05-ai-assistant-local-design.md`.

---

## 4. Fuera de alcance (out of scope)

Quedan **explícitamente fuera** de esta versión:

| Descartado                             | Razón                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Colaboración y compartición**        | No hay compartir proyectos, ni equipos, ni roles, ni co-edición. El workspace es 100% individual.                  |
| **Integraciones externas en el MVP**   | No hay GitHub, Jira, Slack, Google Calendar, ni importadores de Notion/Evernote. Todo se crea dentro de DevHelper. |
| **Más de 1 proyecto en plan gratuito** | Ver [sección 6](#6-modelo-de-monetización-límites-del-mvp) sobre los límites.                                      |

> **No prometido al usuario:** cualquiera de estos features puede aparecer en versiones futuras, pero **no se aceptan compromisos de roadmap** sobre ellos en esta versión.

---

## 5. Propuesta de valor

DevHelper se diferencia de la combinación habitual **Notion + 1Password + Google Calendar + Drive** en un único punto:

> **Un solo workspace cifrado donde proyectos, tareas, ficheros, passwords y eventos conviven bajo el mismo vault.**

No es "mejor en X que la competencia", es **la eliminación de la fragmentación**: el desarrollador no tiene que decidir en qué app vive cada tipo de información, ni copiar passwords de un gestor a una nota, ni vincular manualmente un recordatorio con un archivo y con una tarea. Todo está en un mismo lugar, todo está cifrado, y la estructura (proyecto → tarea → ficheros + passwords) refleja el flujo real de trabajo de un dev.

> **Sustituye a:** 4+ aplicaciones (notas + gestor de passwords + calendario + Drive) por un único lugar cifrado y privado.

---

## 6. Modelo de monetización (límites del MVP)

DevHelper se ofrece en modelo **freemium**:

| Plan                  | Límites                                                                                     | Precio       |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| **Plan gratuito**     | 1 solo proyecto activo · Límites de almacenamiento y/o cantidad de ficheros                 | Gratis       |
| **Membresía mensual** | Ampliación del número de proyectos · Ampliación de los límites de ficheros / almacenamiento | Pago mensual |

> Este modelo aplica también como límite de "out of scope": más allá del MVP, la ampliación del propio modelo comercial (planes enterprise, versión mobile, etc.) no forma parte de esta versión.

---

## 7. Métricas de éxito sugeridas

Para saber si el producto cumple su propósito, se proponen como métricas iniciales:

| Métrica          | Qué mide                                                                   | Proxy                           |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------- |
| **Activación**   | % de cuentas nuevas que crean su primer proyecto y primera tarea en 7 días | Empezar es fácil                |
| **Persistencia** | Tareas creadas por usuario activo semanal                                  | La memoria se está acumulando   |
| **Recuperación** | Frecuencia con la que un usuario reabre / consulta tareas antiguas         | La memoria se está reutilizando |
| **Conversión**   | % de usuarios gratuitos que pasan a membresía mensual                      | El modelo freemium funciona     |
| **Retención**    | % de usuarios activos a 30 y 90 días del registro                          | El producto retiene             |

> Estas métricas son **sugeridas y se afinarán** durante la fase de implementación; no son parte del alcance del MVP pero orientan las decisiones de diseño.

---

## 8. Identidad visual (resumen)

El diseño refleja el propósito: un espacio serio, denso y privado. La implementación concreta del sistema de diseño (tokens, componentes, paleta, bugs conocidos) vive en [`docs/design-context.md`](design-context.md). A modo de resumen:

| Aspecto         | Decisión                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Tema**        | Único `devhelper` (dark) sobre DaisyUI 5. Sin modo claro. Sin alternador.                      |
| **Sensación**   | Denso, monoespaciado, tipo IDE. Sin emojis en UI, sin adornos, sin animaciones de celebración. |
| **Iconografía** | Única: Material Symbols Outlined.                                                              |
| **Privacidad**  | La UI se siente "cerrada por defecto" (vault, modales de unlock, lockout del PIN).             |

> **Privacidad y consistencia visual son parte del alcance:** cualquier decisión de UI que las debilite debe documentarse en [`docs/design-context.md`](design-context.md).

---

Ver también: [README](../README.md) · [casos de uso](casos-de-uso.md) · [estado actual](estado-actual.md) · [design context](design-context.md)
