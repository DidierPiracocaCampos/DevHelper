# M2 · Calendario

Vista semanal navegable con grid de 7 dias, listado de eventos del dia seleccionado, alta, edicion, vista y borrado de eventos. Eventos globales del usuario.

## Dependencias

- M7-T2 (inputs en signals) — para los formularios de los modales.

## Tareas

- [ ] M2.1 Modelar `EventI`: `id, name, startAt (Timestamp), comments, createdAt, updatedAt`. Sin `projectId`.
- [ ] M2.2 `EventRepository` extiende `ApiBase<EventI>` con mixins `withCollection, withAddDoc, withUpdateDoc, withDocDelete`. Path fijo `['events']` → `users/{uid}/events`.
- [ ] M2.3 `CalendarStore` (servicio): `weekStart = signal<Date>`, `selectedDay = signal<Date>`, computeds `weekDays` (7 dias), `eventsOfSelectedDay`.
- [ ] M2.4 `<ui-calendar>` componente: cabecera con mes en espanol, botones `Anterior / Hoy / Siguiente`, grid de 7 dias (L-D). Dia actual con borde destacado, dias con eventos con punto/contador.
- [ ] M2.5 `<ui-event-list>` componente: listado de eventos del dia seleccionado con nombre y hora. Click en evento abre modal de vista.
- [ ] M2.6 Boton `+` anadir evento (en cabecera) que abre `<ui-event-form>` modal en modo alta.
- [ ] M2.7 `<ui-event-form>` modal con campos: nombre, hora de inicio (`time`), comentarios (`textarea`). Reutiliza inputs de T2.
- [ ] M2.8 `<ui-event-view>` modal con nombre, fecha completa, hora y comentarios, mas botones Editar y Borrar.
- [ ] M2.9 Edicion: `<ui-event-form>` reutilizable en modo edicion (prefill). Llama a `updateDoc` con re-validacion.
- [ ] M2.10 Borrado con `ConfirmService` + toast.
- [ ] M2.11 Toast en alta, edicion y borrado.
- [ ] M2.12 Pagina `<app-calendar>` y ruta `/calendar` con carga lazy (standalone).
- [ ] M2.13 Tests: repository (path/CRUD), CalendarStore (navegacion, seleccion), componentes (alta/edicion/borrado, formato de fecha/hora).
