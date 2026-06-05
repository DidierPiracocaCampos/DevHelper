# M1 · Proyectos

Gestion de proyectos y sus issues en el home. La card "Proyectos" lleva el listado horizontal con buscador, filtro y alta. La card "Tareas" muestra las issues del proyecto seleccionado con filtro y alta. El detalle de issue se abre en una ruta dedicada abierta en nueva pestana del navegador. Archivos y passwords propios de la issue. Borrado en cascada.

## Dependencias

- M7-T0 (ScopeContext con 3 niveles: global, project, issue).
- M7-T1 (filtro).
- M7-T2 (inputs).
- M3 (Archivos) — reusa `<ui-file-list>` en detalle de issue.
- M4 (Contrasenas) — reusa `<ui-password-list>` en detalle de issue.

## Tareas

- [ ] M1.1 Modelar `ProjectI` (`id, name, description?, color?, createdAt, updatedAt`) y `IssueI` (`id, projectId, title, description, solution?, solutionComments?, status, createdAt, updatedAt`).
- [ ] M1.2 Extender `ScopeContext` (M7-T0) con la tercera forma: `{ kind: 'issue', projectId, issueId }`. Path derivado: `['projects', projectId, 'issues', issueId, 'files' | 'passwords']`.
- [ ] M1.3 `ProjectRepository` con path `['projects']` → `users/{uid}/projects`. Mixins: `withCollection, withAddDoc, withUpdateDoc, withDocDelete`.
- [ ] M1.4 `IssueRepository` con path computado `['projects', projectId, 'issues']`. Mixins: `withCollection, withAddDoc, withUpdateDoc, withDocDelete`. Recibe `projectId` por input/signal.
- [ ] M1.5 `<ui-status-flag>` componente: pill/badge con color segun `status` (open / in_progress / resolved / closed).
- [ ] M1.6 `<ui-project-header>` con buscador, boton filtro (T1) y boton `+` anadir proyecto.
- [ ] M1.7 `<ui-project-list>`: pildoras horizontales con scroll. Click selecciona. La activa se resalta.
- [ ] M1.8 `<ui-add-project>` modal con form: nombre (requerido), descripcion, color.
- [ ] M1.9 `<ui-issue-list>` con filtro (T1) y boton `+` anadir issue. Muestra titulo, status flag y fecha.
- [ ] M1.10 `<ui-add-issue>` modal con form: titulo, descripcion, estado inicial (`open` por defecto).
- [ ] M1.11 `<ui-issue-detail>` vista: header (titulo + `<ui-status-flag>` arriba derecha), descripcion, solucion, comentarios de solucion, archivos (`<ui-file-list>` scope issue), contrasenas (`<ui-password-list>` scope issue), footer con acciones.
- [ ] M1.12 Acciones del detalle: Guardar (actualiza metadata), Eliminar (confirm + borrado recursivo: files en Storage + metadata + passwords), Exportar a `.md` o `.txt` (dropdown, solo metadata).
- [ ] M1.13 Pagina `/projects/:projectId/issues/:issueId` con carga lazy. Se abre en nueva pestana del navegador desde el listado de issues (`target="_blank"` / `window.open`).
- [ ] M1.14 `ProjectsStore` (servicio) con `selectedProject = signal<ProjectI | null>`. Sincroniza `ScopeContext` a `project` o `issue` segun el contexto de navegacion.
- [ ] M1.15 FilterSchemas: `ProjectFilterSchema` (name, color) y `IssueFilterSchema` (status, createdAt) para T1.
- [ ] M1.16 Toast/confirm consistentes en alta, edicion, borrado y export de proyecto e issue.
- [ ] M1.17 Tests: repos, ProjectsStore, componentes, formato de export, borrado recursivo.
