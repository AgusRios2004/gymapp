# Tareas — 0005 — SearchableSelect reutilizable y selector de cliente en pagos

Spec: [`0005-searchable-select.md`](./0005-searchable-select.md)

Tamaño relativo (S/M), no horas. Todo frontend: vitest + Testing Library + `user-event`, servicios mockeados. Modo interactivo (skill `implementar`), una tarea por vez.

---

## T1 — Componente `SearchableSelect`

**Toca:** `components/ui/SearchableSelect.tsx` (nuevo), `components/ui/SearchableSelect.test.tsx` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0005-01, 02, 03, 04, 05, 06, 07

- Genérico `<T>`, sin `any`. Normalización de búsqueda en un helper local (`normalize = s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()`), exportado para reutilizarlo en `searchBy` propios.
- ARIA: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; lista `role="listbox"`, opciones `role="option"` con `aria-selected`. `label` asociado con `htmlFor`/`useId`.
- Estado interno: `query`, `isOpen`, `highlightedIndex`. `query` se sincroniza con `value` al cerrar y cuando `value` cambia (AC-0005-07).
- Opciones con `onMouseDown={e => e.preventDefault()}` para que el blur no cancele el click.
- Estilo de input copiado de `Input.tsx`; lista `bg-white border-slate-200 shadow-lg max-h-60 overflow-auto`, resaltado `bg-emerald-50 text-emerald-700`. Resaltado visible con `scrollIntoView({ block: 'nearest' })` (guardar contra jsdom, donde no existe).

---

## T2 — Selector de cliente en `PaymentsPage`

**Toca:** `pages/PaymentsPage.tsx`, `pages/PaymentsPage.test.tsx`
**Depende de:** T1
**Tamaño:** S
**Cubre:** AC-0005-08, 09, 10, 11

- `selectedClient` pasa de `string` (id) a `Client | null`; `request.idClient = selectedClient.id`; `resetForm` lo pone en `null`.
- `getLabel`: `` `${name} ${lastName}${dni ? ` · DNI ${dni}` : ''}${isDebtor ? ' ⚠️ (DEUDOR)' : ''}` ``.
- `searchBy` propio: nombre + apellido normalizados, y DNI con `replace(/[.\s]/g, '')` contra la query sin puntos ni espacios. No usar el label (incluye "DEUDOR").
- **Primero** actualizar los tests existentes de AC-0002-12 para elegir el cliente con el combobox (escribir + click en la opción) y verificar que siguen pasando por la razón correcta. Recién después agregar los de AC-0005.
- No tocar el selector de profesor ni el de cuota.
