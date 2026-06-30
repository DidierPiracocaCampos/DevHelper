# FilterBar + integración con password-list

> Diseño aprobado el 2026-06-30. Cierra la integración del módulo `shared/filter` (existente pero sin consumidores) con el caso de uso CU-08 (gestión de passwords).

## 1. Contexto

`src/app/shared/filter/` ya implementa `FilterService`, `FilterModal` y `FilterChip` (commit `64fde96`). Ningún componente los consume. `<ui-card-button icon="filter_alt" />` aparece como placeholder en `home.html:6` y `password-list.html:53` sin handler.

Objetivo: que el usuario pueda acotar la lista global de passwords por `name`, `secure` y `createdAt`, ver los filtros activos como chips y limpiarlos individualmente o todos a la vez.

## 2. Decisiones de scope

- **Solo password-list** en esta iteración. File-list queda fuera.
- **Sin persistencia entre recargas.** El estado del filtro vive en memoria (signal).
- **FilterBar wrapper** en `shared/filter/filter-bar/`. Reutilizable mañana para otros consumidores.
- **API basada en outputs**: `<filter-bar [schema] (apply) (clear) />`. El padre decide qué hacer con los filtros.
- **`FilterService` singleton** (`providedIn: 'root'`). El estado es global, la barra lo lee/escribe.
- **PasswordRepository** añade el mixin `withQuery`. Expone `getFilteredCollection(options)`.
- **PasswordI** gana `createdAt: Timestamp`. Backwards compat: los docs existentes no tendrán el campo; las queries que filtran por `createdAt` los excluyen silenciosamente. Aceptable para MVP (un solo usuario por cuenta).

## 3. Cambios por archivo

### 3.1 Nuevos

| Path                                                              | Contenido                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/app/shared/filter/filter-bar/filter-bar.ts`                  | Componente wrapper standalone, OnPush, signals, `inject(FilterService)`.                                    |
| `src/app/shared/filter/filter-bar/filter-bar.html`                | Botón `filter_alt` + `@for` de chips + `<filter-modal>`.                                                   |
| `src/app/shared/filter/filter-bar/filter-bar.css`                 | `:host { display: contents }`. Sin estilos propios.                                                        |
| `src/app/shared/filter/filter-bar/filter-bar.spec.ts`             | Tests del wrapper (render, eventos, remove).                                                               |
| `src/app/home/service/password-filter.schema.ts`                  | `FilterSchema<PasswordI>` con tres campos: name, secure, createdAt.                                        |

### 3.2 Modificados

| Path                                                              | Cambio                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/app/shared/filter/filter.service.ts`                         | `@Injectable({ providedIn: 'root' })`. API sin cambios.                                                                      |
| `src/app/shared/filter/index.ts`                                  | Exportar `FilterBar`.                                                                                                        |
| `src/app/home/service/passwords.repository.ts`                    | Añadir mixin `withQuery` a la cadena. `getFilteredCollection(options: Signal<QueryOptions>)` queda disponible.                |
| `src/app/home/domain/password.interface.ts`                       | Añadir `createdAt?: Timestamp`. Opcional para no romper docs existentes.                                                     |
| `src/app/home/components/password-list/password-list.ts`          | Inyectar `FilterService`. Reemplazar `this.collection = this._repo.getCollection()` por una collection que consume `getFilteredCollection(filterService.queryOptions)`. Definir `filterSchema` y handlers `onFiltersApply`/`onFiltersClear`. |
| `src/app/home/components/password-list/password-list.html`        | Reemplazar `<ui-card-button icon="filter_alt" />` por `<filter-bar [schema]="filterSchema" (apply) (clear) />`.               |
| `firestore.rules`                                                 | Permitir `createdAt: timestamp` en `users/{uid}/passwords` (y mantener `name`, `password: {cipher, iv}`, `secure`).          |
| `docs/estado-actual.md`                                           | Marcar el FALTA de filtro en password-list como PARCIAL/OK tras implementación.                                              |

## 4. Componente `FilterBar<T>`

```ts
@Component({
  selector: 'filter-bar',
  imports: [FilterModal, FilterChip, UiCardButton],
  templateUrl: './filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar<T> {
  private _filter = inject(FilterService);

  schema = input.required<FilterSchema<T>>();
  activeFilters = input<ActiveFilters>([]);

  apply = output<ActiveFilters>();
  clear = output<void>();

  protected readonly state = this._filter.state;
  protected isOpen = signal(false);

  protected fieldFor(key: string): AnyFilterField | undefined {
    return this.schema().fields.find((f) => (f as FilterField<T>).key === key);
  }

  protected open(): void {
    this.isOpen.set(true);
  }

  protected onApply(filters: ActiveFilters): void {
    this._filter.apply(this.schema(), filters);
    this.apply.emit(this._filter.state());
  }

  protected onClear(): void {
    this._filter.reset();
    this.clear.emit();
  }

  protected onRemove(key: string): void {
    this._filter.remove(key);
    this.apply.emit(this._filter.state());
  }
}
```

Template (estructura):

```html
<div class="flex items-center gap-2 flex-wrap">
  @for (f of state(); track f.key) {
    @let field = fieldFor(f.key);
    @if (field) {
      <filter-chip [field]="field" [value]="f" (remove)="onRemove($event)" />
    }
  }
  <ui-card-button icon="filter_alt" (click)="open()" />
</div>

<filter-modal
  [schema]="schema()"
  [initialFilters]="state()"
  [title]="'Filtros'"
  [(isOpen)]="isOpen"
  (apply)="onApply($event)"
  (clear)="onClear()"
/>
```

## 5. `FilterSchema<PasswordI>`

```ts
// src/app/home/service/password-filter.schema.ts
import { FilterSchema, FilterField } from '../../shared/filter';
import { PasswordI } from '../domain/password.interface';

export const passwordFilterSchema: FilterSchema<PasswordI> = {
  entity: 'passwords',
  fields: [
    { key: 'name',      label: 'Nombre', control: 'text',    ops: ['==', '!='] },
    { key: 'secure',    label: 'Seguro', control: 'boolean', ops: ['=='] },
    { key: 'createdAt', label: 'Creado', control: 'date',    ops: ['==', '>', '>=', '<', '<='] },
  ] as const,
} as FilterSchema<PasswordI>;
```

## 6. Flujo de datos

```
User click "Filtros"
  -> FilterBar.isOpen.set(true)
  -> FilterModal se abre con initialFilters = filterService.state()
  -> user configura y "Aplicar"
  -> FilterModal emite apply
  -> FilterBar.onApply: filterService.apply(schema, filters)
  -> filterService.queryOptions (computed) recalcula
  -> password-list collection (resource) re-fires
  -> getFilteredCollection(options) ejecuta query
  -> lista se reduce

User click X en chip
  -> FilterChip emite remove(key)
  -> FilterBar.onRemove: filterService.remove(key)
  -> queryOptions recalcula -> lista se expande

User click "Limpiar" en modal
  -> FilterModal emite clear
  -> FilterBar.onClear: filterService.reset() + clear.emit()
  -> lista = todo
```

## 7. Edge cases

- **Filtro vacío**: `filterService.queryOptions()` devuelve `{}`; `withQuery` no aplica `where`; resultado idéntico a `getCollection()`. Sin rama especial.
- **Fecha como input HTML**: `<input type="date">` emite string `YYYY-MM-DD`. Convertir a `Date` (o `Timestamp.fromDate(...)`) al pasar a `filterService.apply`. `formatValue` en `filter-chip.ts:30` ya maneja `Date` o string parseable.
- **Backwards compat de `createdAt`**: docs existentes sin el campo. Queries `where('createdAt', '>', X)` los excluyen. Aceptable.
- **Reload**: estado perdido. Decidido: solo memoria. No tocar `sessionStorage`/`localStorage`.
- **`activeFilters` input**: hoy el `FilterBar` lee de `filterService.state()` directamente, no usa el input. El input se mantiene para futuro (consumidor externo que quiera pre-cargar estado sin pasar por el servicio).

## 8. Tests

### 8.1 Nuevos

- `filter-bar.spec.ts`:
  - render del botón `filter_alt`.
  - click en botón abre modal (isOpen → true).
  - click en chip X llama a `filterService.remove(key)` y emite `apply` con el resto.
  - `apply` del modal llama a `filterService.apply(schema, filters)` y emite `apply` al padre.
  - `clear` del modal llama a `filterService.reset()` y emite `clear`.
  - estado vacío no renderiza chips.

### 8.2 Actualizar

- `password-list.spec.ts`: añadir test de integración que verifique que tras `filterService.apply(...)` la collection expuesta se reduce (mockear `PasswordRepository`).
- `passwords.repository.spec.ts` (si existe, si no, crear mínimo): un test que verifique que `getFilteredCollection` aplica `where(...)` cuando `options().filters` no está vacío.

### 8.4 Conversión de fechas

`FilterModal` emite strings `YYYY-MM-DD` para campos `control: 'date'`. `FilterService.apply` debe transformar esos strings a `Date` antes de almacenar, para que `where('createdAt', '>', Date)` funcione correctamente en Firestore (donde el campo es `Timestamp`). Implementación: en `filter.service.ts`, dentro de `apply()`, mapear cada `ActiveFilter` cuyo campo sea `control: 'date'` y convertir `value` con `new Date(value as string)`. Test unitario dedicado.

### 8.3 Reglas

- Test de `firestore.rules` que valide que un doc con `createdAt: timestamp` se acepta en `users/{uid}/passwords` y que un valor no-timestamp se rechaza.

## 9. Verificación

Orden del AGENTS.md:

```
pnpm run lint
pnpm test
pnpm build
```

## 10. Out of scope (no se hace aquí)

- File-list con filtros.
- Persistencia entre recargas.
- Búsqueda global multi-tipo (CU-10).
- Auto-ocultar password descifrado tras N segundos (CU-08 mejora).
- Resolver el BUG completo de shape `PasswordI` vs `firestore.rules` (title/username/url/notes). Esta iteración solo añade `createdAt`, no cambia el resto.
- Servicio de búsqueda (`SearchService`).

## 11. Riesgos

- **Alineación con `firestore.rules`**: si las reglas no se actualizan en el mismo PR, los nuevos writes con `createdAt` fallarán. Mitigación: el código setea `createdAt` con `serverTimestamp()`; las reglas se actualizan en el mismo cambio.
- **Conversión fecha → Firestore**: `withQuery` pasa el value tal cual a `where(field, op, value)`. Si el value es un string `YYYY-MM-DD` y el campo es `Timestamp`, Firestore compara tipos heterogéneos y puede fallar o no devolver resultados. Mitigación: `FilterService.apply` transforma strings de campos `control: 'date'` a `Date` antes de almacenar. Ver § 8.4.
