# Casos de Uso

Catálogo de escenarios en los que el desarrollador usuario interactúa con DevHelper: detalle paso a paso, flujos críticos y casos que el producto no soporta.

![Status](https://img.shields.io/badge/Estado-Vivo-000000?style=flat-square)
![Cobertura](https://img.shields.io/badge/CU_cubiertos-12-333333?style=flat-square)
![Prioridad](https://img.shields.io/badge/CU_criticos-8-000000?style=flat-square)
![Prioridad](https://img.shields.io/badge/CU_importantes-3-666666?style=flat-square)

> **Documentos relacionados:** [`proposito-y-alcance.md`](proposito-y-alcance.md) (qué se resuelve y para quién) · [`estado-actual.md`](estado-actual.md) (qué casos ya funcionan) · [`design-context.md`](design-context.md) (cómo se presentan visualmente los flujos al usuario)

---

## Tabla de contenidos

1. [Actores](#1-actores)
2. [Catálogo de casos de uso](#2-catálogo-de-casos-de-uso)
3. [Detalle de casos de uso](#3-detalle-de-casos-de-uso) — CU-01 a CU-11
4. [Flujos críticos](#4-flujos-críticos)
5. [Casos de uso no soportados](#5-casos-de-uso-no-soportados)
6. [Convenciones visuales por caso de uso](#6-convenciones-visuales-por-caso-de-uso)

---

## 1. Actores

| Actor                     | Descripción                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Desarrollador usuario** | Único actor del sistema. Persona con una cuenta propia, uso estrictamente privado. Realiza todas las acciones descritas en este documento. |

> No hay otros actores humanos. Los servicios externos (Firebase Auth, Firebase Storage, pasarela de pago) son infraestructura técnica, no se modelan como actores en este documento.

---

## 2. Catálogo de casos de uso

| ID    | Caso de uso                          | Prioridad MVP |
| ----- | ------------------------------------ | :-----------: |
| CU-01 | Registro / creación de cuenta        |    Crítico    |
| CU-02 | Inicio y cierre de sesión            |    Crítico    |
| CU-03 | Configuración inicial del vault      |    Crítico    |
| CU-04 | Desbloqueo del vault                 |    Crítico    |
| CU-05 | Gestión de proyectos                 |    Crítico    |
| CU-06 | Gestión de tareas (normales y notas) |    Crítico    |
| CU-07 | Adjuntar ficheros                    |    Crítico    |
| CU-08 | Gestión de passwords                 |    Crítico    |
| CU-09 | Gestión de eventos / recordatorios   |  Importante   |
| CU-10 | Búsqueda y recuperación              |    Crítico    |
| CU-11 | Gestión de la membresía              |  Importante   |
| CU-12 | Consultas al asistente local     |  Importante   |

## 3. Detalle de casos de uso

### CU-01 — Registro / creación de cuenta

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario crea una cuenta nueva en DevHelper.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** el usuario no tiene cuenta previa; accede a la pantalla de registro.
- **Flujo principal:**
  1. El usuario accede a la pantalla de registro.
  2. Elige el metodo: email/password o "Continuar con Google".
     3a. Si elige email/password: ingresa email, contrasena y confirma contrasena. Pulsa "Crear cuenta".
     3b. Si elige Google: se abre el flujo OAuth de Firebase / Google. Tras conceder permisos, vuelve a DevHelper.
  3. El sistema valida los datos y crea la cuenta.
  4. El sistema redirige al usuario a la **configuracion inicial del vault** (CU-03).
- **Flujos alternativos:**
  - Email ya registrado -> el sistema muestra un error y sugiere iniciar sesion.
  - Contrasena debil -> el sistema rechaza el registro y exige una contrasena mas robusta.
  - Cancelacion del flujo Google -> el usuario vuelve a la pantalla de registro sin cuenta creada.
- **Postcondiciones:** existe una cuenta activa asociada al email del usuario; la sesion queda abierta y el vault aun no esta configurado.
- **Excepciones:** error de red o de Firebase -> se muestra un mensaje de error reintentable; no se crea la cuenta.

### CU-02 — Inicio y cierre de sesión

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario abre la aplicacion y se autentica; tambien puede cerrar la sesion voluntariamente.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** el usuario tiene una cuenta existente; actualmente no hay sesion abierta.
- **Flujo principal (inicio de sesion):**
  1. El usuario accede a la pantalla de login.
  2. Elige metodo: email/password o "Continuar con Google".
  3. Ingresa sus credenciales o completa el OAuth.
  4. El sistema valida y abre la sesion.
  5. Si el vault ya esta configurado, el sistema pide **desbloquear el vault** (CU-04). Si no, pide **configurarlo** (CU-03).
- **Flujo principal (cierre de sesion):**
  1. El usuario accede a la pantalla de configuracion / perfil.
  2. Pulsa "Cerrar sesion".
  3. El sistema cierra la sesion, borra el estado local de vault y vuelve a la pantalla de login.
- **Flujos alternativos:**
  - Credenciales invalidas -> mensaje de error, posibilidad de reintentar o restablecer contrasena.
  - Sesion recordada -> si la app lo permite, la sesion se restaura automaticamente y se va directo a CU-04.
- **Postcondiciones:** tras login, sesion activa con vault bloqueado o desbloqueado segun el estado; tras logout, sesion cerrada y vault en estado "no desbloqueado".
- **Excepciones:** cuenta deshabilitada o baneada -> el sistema rechaza el login y muestra un mensaje generico.

### CU-03 — Configuración inicial del vault

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario configura por primera vez el cifrado del workspace. Elige un metodo de desbloqueo y se genera la clave maestra.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** cuenta activa; el vault no esta configurado; sesion abierta.
- **Flujo principal:**
  1. El usuario llega al asistente de configuracion inicial del vault.
  2. El sistema presenta las dos opciones: **PIN** o **Passkey**.
  3. El usuario elige una.
     4a. Si elige **PIN**: ingresa el PIN dos veces, confirma. El sistema deriva la clave maestra.
     4b. Si elige **Passkey**: el sistema lanza el flujo WebAuthn del navegador; el usuario registra la passkey. El sistema genera y asocia la clave maestra.
  4. El sistema cifra el estado inicial del workspace y guarda de forma segura la clave maestra.
  5. El sistema pide **crear el primer proyecto** (parte de CU-05).
- **Flujos alternativos:**
  - PIN y confirmacion no coinciden -> se rechaza y se pide reintentar.
  - El navegador no soporta WebAuthn / passkeys -> se desactiva esa opcion y solo se ofrece PIN.
  - El usuario cierra el asistente a mitad -> el vault queda sin configurar; al volver a la app, se retoma CU-03.
- **Postcondiciones:** vault configurado y cifrado; metodo de desbloqueo (PIN o Passkey) asociado a la cuenta; sesion de vault abierta.
- **Excepciones:** perdida del navegador / dispositivo sin passkey sincronizada -> documentado en CU-08 (recuperacion).

### CU-04 — Desbloqueo del vault

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** al iniciar sesion o al volver a la app tras un periodo de inactividad, el usuario desbloquea el vault con su metodo elegido.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** cuenta activa; vault ya configurado; sesion abierta pero vault bloqueado.
- **Flujo principal:**
  1. El sistema muestra la pantalla de desbloqueo.
  2. El usuario elige el metodo (PIN o Passkey) configurado.
  3. Ingresa el PIN o completa el desafio WebAuthn.
  4. El sistema valida y desbloquea el vault.
- **Flujos alternativos:**
  - PIN incorrecto -> contador de intentos++; tras N intentos fallidos, el vault se bloquea temporalmente.
  - Passkey fallida -> idem, contador de intentos.
  - Olvido de PIN o passkey no disponible -> el sistema ofrece el flujo de recuperacion (ver CU-08 excepciones).
- **Postcondiciones:** vault desbloqueado; el usuario puede acceder a proyectos, tareas, ficheros, passwords y eventos.
- **Excepciones:** vault bloqueado por intentos -> se muestra tiempo de espera antes de reintentar; recuperacion solo posible desde flujo documentado en CU-08.

### CU-05 — Gestión de proyectos

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario crea, renombra, archiva o elimina proyectos.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado.
- **Flujo principal (crear):**
  1. El usuario pulsa "Nuevo proyecto".
  2. Ingresa nombre y opcionalmente descripcion.
  3. El sistema valida el limite del plan (1 proyecto en plan gratuito).
     4a. Si esta dentro del limite -> crea el proyecto, lo cifra y lo muestra.
     4b. Si excede el limite -> se muestra el flujo de upgrade a membresia (CU-11).
- **Flujos alternativos (renombrar / archivar / eliminar):**
  - Renombrar: edicion in-line del nombre; persiste al confirmar.
  - Archivar: el proyecto pasa a una vista de "archivados", oculto por defecto. Sus tareas, ficheros y passwords siguen siendo recuperables.
  - Eliminar: el sistema pide confirmacion explicita; tras confirmar, se elimina el proyecto y todo su contenido (tareas, ficheros, passwords asociados). Accion irreversible.
- **Postcondiciones:** el conjunto de proyectos visibles refleja la operacion; el contador de cuota del plan se actualiza.
- **Excepciones:** error al cifrar o persistir -> el sistema revierte la operacion y muestra un mensaje reintentable.

### CU-06 — Gestión de tareas (normales y notas)

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario crea, edita, marca como hecha y elimina tareas dentro de un proyecto.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado; existe al menos un proyecto donde crear la tarea.
- **Flujo principal (crear tarea normal):**
  1. El usuario abre un proyecto y pulsa "Nueva tarea".
  2. Ingresa titulo, descripcion opcional y, si quiere, fecha de vencimiento.
  3. Confirma. La tarea se crea con estado "pendiente".
- **Flujo principal (crear nota):**
  1. Igual que el anterior, pero el usuario marca la tarea como "nota" (sin estado, sin fecha).
  2. La tarea aparece como una entrada de texto libre persistente.
- **Flujos alternativos:**
  - Marcar como hecha: el usuario cambia el estado; la tarea queda visible con un indicador de completada.
  - Editar: cambios en titulo, descripcion o fecha; se persisten al guardar.
  - Eliminar: confirmacion explicita; la tarea y sus ficheros/passwords asociados se eliminan.
- **Postcondiciones:** el conjunto de tareas del proyecto refleja la operacion; el contador de cuota se actualiza si aplica.
- **Excepciones:** error de validacion (titulo vacio) -> se rechaza y se pide completar; error de persistencia -> reintento.

### CU-07 — Adjuntar ficheros

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario adjunta un fichero a una tarea o al almacen global de ficheros.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado; existe la tarea o se esta en la vista de ficheros globales.
- **Flujo principal:**
  1. El usuario pulsa "Adjuntar fichero".
  2. Selecciona el archivo desde su dispositivo.
  3. El sistema valida tamano y cuota del plan.
  4. El sistema cifra el contenido y lo sube al almacenamiento.
  5. El fichero aparece listado en la tarea o en la vista global.
- **Flujos alternativos:**
  - Tamano excedido -> se rechaza con mensaje claro del limite.
  - Cuota del plan agotada -> se ofrece el flujo de upgrade (CU-11).
  - Subida fallida por red -> se reintenta automaticamente; tras N fallos, se cancela y se notifica.
- **Postcondiciones:** el fichero esta cifrado, almacenado y enlazado a la tarea o a la vista global; el contador de cuota se actualiza.
- **Excepciones:** archivo con tipo no permitido -> rechazo con mensaje; cuota del plan gratuita agotada -> bloqueo y oferta de upgrade.

### CU-08 — Gestión de passwords

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario guarda, consulta, edita y elimina passwords. Aplican tanto a passwords globales como a passwords asociados a una tarea concreta.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado.
- **Flujo principal (guardar nuevo):**
  1. El usuario pulsa "Nuevo password" (global o dentro de una tarea).
  2. Ingresa etiqueta, usuario/URL y el valor del password.
  3. El sistema cifra el password con la clave maestra del vault.
  4. Lo guarda y lo muestra en la lista correspondiente.
- **Flujo principal (consultar):**
  1. El usuario abre la lista correspondiente (global o por tarea).
  2. Selecciona un password.
  3. El sistema descifra bajo demanda y muestra el valor (con un temporizador de auto-ocultar para evitar shoulder-surfing).
- **Flujos alternativos:**
  - Editar: el usuario actualiza cualquiera de los campos; se vuelve a cifrar.
  - Eliminar: confirmacion; el password se elimina de forma irreversible.
- **Postcondiciones:** el conjunto de passwords refleja la operacion.
- **Excepciones / recuperacion:**
  - **Olvido de PIN o passkey perdida:** se documenta un unico flujo de recuperacion. El sistema exige una verificacion secundaria (por ejemplo, un codigo de recuperacion generado en CU-03) y, tras validarla, permite re-establecer el metodo de desbloqueo. **Si el usuario no tiene ese codigo, los passwords son irrecuperables** (cifrado en cliente, no hay backdoor del servidor).
  - **Sesion abierta en dispositivo no reconocido:** el sistema ofrece cerrar todas las demas sesiones.

### CU-09 — Gestión de eventos / recordatorios

![Prioridad](https://img.shields.io/badge/Prioridad-Importante-666666?style=flat-square)

- **Descripcion:** el usuario crea, edita y elimina eventos y recordatorios (siempre globales, no asociados a proyecto ni a tarea).
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado.
- **Flujo principal:**
  1. El usuario accede a la vista de eventos/recordatorios.
  2. Pulsa "Nuevo evento".
  3. Ingresa titulo, fecha/hora y descripcion opcional.
  4. Confirma. El evento se guarda y aparece en la lista y en la vista de calendario.
- **Flujos alternativos:**
  - Editar / eliminar: mismas reglas que en otras entidades.
  - Recordatorio vencido: se muestra como "vencido" hasta que el usuario lo marque como completado o lo reprogramme.
- **Postcondiciones:** el conjunto de eventos refleja la operacion; el sistema de recordatorios queda programado para disparar la notificacion correspondiente.
- **Excepciones:** error al programar la notificacion -> se muestra el evento en la lista con un indicador de "recordatorio no entregado".

### CU-10 — Búsqueda y recuperación

![Prioridad](https://img.shields.io/badge/Prioridad-Crítico-000000?style=flat-square)

- **Descripcion:** el usuario busca una entrada previa (proyecto, tarea, password, evento, fichero) y la abre para reutilizarla.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado.
- **Flujo principal:**
  1. El usuario accede al buscador global.
  2. Escribe una o varias palabras clave.
  3. El sistema busca en proyectos, tareas, passwords (etiqueta y URL, nunca el valor), eventos y nombres de fichero.
  4. Muestra resultados agrupados por tipo.
  5. El usuario selecciona uno y el sistema descifra (si aplica) y muestra el detalle.
- **Flujos alternativos:**
  - Filtros: el usuario puede acotar por tipo (solo tareas, solo passwords, etc.) o por proyecto.
  - Sin resultados -> se muestra un mensaje claro y la opcion de crear una nueva entrada con ese texto como semilla.
- **Postcondiciones:** el usuario encuentra y abre la entrada buscada, o crea una nueva si no existia.
- **Excepciones:** la busqueda en passwords **nunca** incluye el valor cifrado como texto buscable (solo etiqueta y URL), para preservar la confidencialidad.

### CU-11 — Gestión de la membresía

![Prioridad](https://img.shields.io/badge/Prioridad-Importante-666666?style=flat-square)

- **Descripcion:** el usuario consulta su plan actual, sus limites consumidos, y gestiona la suscripcion mensual (upgrade, baja).
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado.
- **Flujo principal (consultar plan):**
  1. El usuario accede a "Plan y facturacion".
  2. El sistema muestra el plan actual (gratuito o de pago), el numero de proyectos, los ficheros usados y los limites correspondientes.
- **Flujo principal (upgrade):**
  1. El usuario pulsa "Hacer upgrade".
  2. El sistema abre el flujo de la pasarela de pago.
  3. Tras un pago exitoso, el sistema actualiza el plan a "pago" y libera los limites adicionales (mas proyectos, mas ficheros).
- **Flujos alternativos:**
  - Pago fallido -> se muestra el motivo y se permite reintentar.
  - Pago exitoso pero limites no actualizados -> el sistema reintenta la sincronizacion; si persiste, soporte.
  - Baja de suscripcion: el usuario confirma la baja; el plan pasa a gratuito al final del ciclo de facturacion; los proyectos/ficheros que excedan el limite gratuito se marcan como "archivados por limite" y quedan ocultos hasta renovar o eliminar.
- **Postcondiciones:** el plan y los limites del usuario reflejan el estado real.
- **Excepciones:** imposibilidad de contactar con la pasarela de pago -> el sistema muestra "estado pendiente" y reintenta mas tarde; no se aplica el cargo hasta confirmacion.

### CU-12 — Consultas al asistente local

![Prioridad](https://img.shields.io/badge/Prioridad-Importante-666666?style=flat-square)

- **Descripcion:** el usuario hace una pregunta estructurada al asistente IA local y recibe una respuesta basada en el contenido de su workspace.
- **Actores:** Desarrollador usuario.
- **Precondiciones:** sesion abierta; vault desbloqueado; asistente IA activado (toggle en home); modelo descargado y cacheado.
- **Flujo principal:**
  1. El usuario abre el card "Asistente IA local" en el home.
  2. Escribe una pregunta estructurada (ej. "qué tareas tengo pendientes").
  3. Pulsa Enter o el boton de busqueda.
  4. El sistema clasifica la intencion de la pregunta.
  5. Recupera los documentos relevantes del workspace descifrado.
  6. Formatea la respuesta con una plantilla determinista.
  7. Muestra la respuesta al usuario.
- **Flujos alternativos:**
  - Pregunta no clasificada → mensaje "no entendi tu pregunta" + sugerencias.
  - Vault bloqueado → error explicito "desbloquea el vault para usar el asistente".
  - Modelo no descargado → estado "descargando" con progress bar.
- **Postcondiciones:** el usuario recibe una respuesta estructurada.
- **Excepciones:** el asistente no genera texto libre, no resume con NLG, no mantiene conversacion.

## 4. Flujos críticos

### 4.1 Flujo crítico: setup inicial del usuario nuevo

![Importancia](https://img.shields.io/badge/Importancia-Máxima-000000?style=flat-square)
![Etapas](https://img.shields.io/badge/Etapas-6-333333?style=flat-square)

Este flujo cubre desde la primera visita hasta el primer proyecto creado. Es el más importante porque sin él, el producto no tiene usuario activo.

```text
1. Bienvenida               → 2. Registro (CU-01)
3. Auth OK                  → 4. Configurar vault (CU-03)
5. Vault listo              → 6. Crear primer proyecto (CU-05)
```

1. El usuario abre DevHelper y aterriza en la pantalla de bienvenida.
2. Pulsa "Crear cuenta" → **[CU-01](#-c-u-01--registro--creación-de-cuenta)**.
3. Completa el registro (email/password o Google).
4. El sistema lo redirige al asistente de **configuración del vault** → **[CU-03](#-c-u-03--configuración-inicial-del-vault)**.
5. Elige metodo (PIN o Passkey) y lo configura. El sistema cifra su workspace vacio.
6. El sistema lo lleva directamente a la creacion de su **primer proyecto** -> **CU-05**.
7. Crea el proyecto (unico permitido en plan gratuito).
8. El sistema muestra el proyecto vacio, listo para anadir la primera tarea o la primera nota.

**Punto de friccion clave:** el paso 5 (configurar el vault). Si el usuario abandona aqui, queda con cuenta sin vault. El diseno debe recordarle al volver.

### 4.2 Flujo critico: volver a la app tras dias y encontrar una nota antigua

Cubre el caso de uso "memoria tecnica persistente" - la razon de ser del producto.

1. El usuario abre DevHelper tras varios dias.
2. **CU-02** restaura la sesion.
3. **CU-04** desbloquea el vault con PIN o Passkey.
4. El usuario va al buscador global -> **CU-10**.
5. Escribe palabras clave del problema o tema que esta recordando.
6. El sistema devuelve resultados agrupados (tareas, passwords, ficheros, eventos).
7. El usuario abre la entrada, lee la nota, y opcionalmente consulta los passwords y ficheros asociados.
8. Encuentra la informacion que necesitaba y la aplica a su problema actual.

**Punto de friccion clave:** el paso 4. Si el usuario olvida el PIN o la passkey no esta disponible, todo el contenido es inaccesible. La generacion y custodia del codigo de recuperacion (CU-08) es critica.

## 5. Casos de uso no soportados

El producto **no** ofrece los siguientes casos de uso. Si un usuario los necesita, la respuesta es "no esta en el alcance" y, opcionalmente, una recomendacion externa.

| Necesidad del usuario                                                 |                                               Estado                                               |
| --------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------: |
| Compartir un proyecto con otro desarrollador                          |             No soportado (ver [`proposito-y-alcance.md`](proposito-y-alcance.md) § 4)              |
| Crear un equipo con roles (admin, editor, lector)                     |                                            No soportado                                            |
| Comentar o co-editar en tiempo real con otra persona                  |                                            No soportado                                            |
| Integrar el workspace con GitHub, Jira o Slack                        |                                       No soportado en el MVP                                       |
| Importar notas desde Notion, Evernote u Obsidian                      |                                       No soportado en el MVP                                       |
| Conectar con Google Calendar o Outlook                                |                                       No soportado en el MVP                                       |
| Pedir a la IA un resumen libre en lenguaje natural (no extractivo) |                                No soportado en esta versión                                |
| Crear más de 1 proyecto en el plan gratuito                           | No soportado (ver [CU-05](#cu-05--gestión-de-proyectos), [CU-11](#cu-11--gestión-de-la-membresía)) |
| Sincronización con un cliente de escritorio nativo                    |                                       No soportado en el MVP                                       |
| Exportar el workspace completo a JSON / PDF                           |                                       No soportado en el MVP                                       |

## 6. Convenciones visuales por caso de uso

Estas convenciones aplican a todos los CU de este documento. El detalle (tokens, componentes, anti-patterns) vive en `docs/design-context.md`.

- **Vault (CU-03, CU-04, CU-08):** las pantallas de create/unlock del vault se muestran como modales a pantalla completa (`modal-fullscreen`-style), centradas. Fondo scureado. Lockout visible (intentos restantes, tiempo restante). Sin rutas de escape fuera del modal.
- **Confirmaciones destructivas (CU-05 eliminar, CU-07 eliminar fichero, CU-08 eliminar password, CU-11 baja):** siempre via `ConfirmService` (`src/app/shared/service/confirm.service.ts`) -> modal con boton destructivo en `error` severity. Nunca con `confirm()` nativo del navegador.
- **Estados de carga (todos los CU):** los componentes usan `LoaderService` global + `loading` input en `ui-button` + `loading loading-infinity` de DaisyUI. No usar spinners locales inconsistentes.
- **Errores (todos los CU):** via `ToastService` con severity (error/warning/info/success). Duracion por defecto. Errores bloqueantes (auth, vault) van como modal o pantalla completa, no como toast.
- **Auto-ocultar contenido sensible (CU-08 view password):** tras revelar un password, auto-cerrar el modal tras N segundos (pendiente implementar, ver `docs/design-context.md` seccion "Mejoras recomendadas"). Hoy el modal queda visible.
- **Acciones bloqueadas por plan (CU-05, CU-11):** cuando el usuario intenta algo que excede el plan free (crear segundo proyecto, subir mas ficheros del limite), se muestra un modal informativo con el CTA de upgrade a membresia. Sin redirigir a un checkout sin previo aviso.
- **Busqueda (CU-10):** resultados agrupados por tipo (proyectos, tareas, passwords, ficheros, eventos) en secciones colapsables. Los passwords solo buscan por label y URL, nunca por el valor cifrado (visible al usuario como politica).
