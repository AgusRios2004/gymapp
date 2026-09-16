---
id: 0005
titulo: SearchableSelect reutilizable y selector de cliente en pagos
estado: implementada             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 14/09/2026
adrs_relacionados: [ADR-0001, ADR-0002]
---

## Objetivo

Que elegir un cliente al registrar un pago no obligue a recorrer un `<select>` con cientos de nombres: se escribe parte del nombre, apellido o DNI y se elige de una lista filtrada. El componente queda reutilizable para los demás selects largos de la app.

Cubre las tareas T-15 y T-16 del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md).

## Restricciones

- **Regla del PRD** ([`PRD_REFACTOR.md`](../docs/prd/PRD_REFACTOR.md), FE-03): todo select con más de 10 opciones usa `SearchableSelect`, con filtro por texto y DNI.
- **Light mode y marca emerald** ([ADR-0001](../docs/adr/0001-color-de-marca-emerald.md), [ADR-0002](../docs/adr/0002-tema-visual-light-mode.md)): mismo estilo que `components/ui/Input.tsx` (borde `slate-200`, foco `emerald-500`).
- **Sin dependencias nuevas:** el repo no tiene librería de combobox; el componente se escribe a mano.
- **Se ejecuta en modo interactivo**, no con Sandcastle (plan del sprint).
- No cambia contratos de backend ni servicios: `PaymentsPage` sigue usando `getAllClientsList(true)` y `createMonthlyPayment`.

## Comportamiento esperado

### `SearchableSelect<T>` (`components/ui/SearchableSelect.tsx`)

Props, a partir de FE-03 del PRD:

```ts
interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => number | string;
  searchBy?: (item: T, query: string) => boolean; // default: getLabel contiene query
  label?: string;
  placeholder?: string;
  emptyMessage?: string;   // default: "Sin resultados"
  disabled?: boolean;
}
```

1. Es un **combobox accesible**: un input con `role="combobox"`, asociado a su `label`, que abre una lista `role="listbox"` de opciones `role="option"`.
2. Al enfocar o hacer click en el input se abre la lista con **todas** las opciones. Escribir filtra la lista con `searchBy`.
3. La búsqueda por defecto **no distingue mayúsculas ni tildes** (`"ramon"` encuentra `"Ramón"`).
4. Click en una opción, o Enter sobre la opción resaltada, llama a `onChange(item)`, cierra la lista y muestra `getLabel(item)` en el input.
5. Teclado: ↓/↑ mueven el resaltado, Enter elige, Escape cierra sin cambiar el valor.
6. Si el filtro no deja opciones, la lista muestra `emptyMessage` y Enter no elige nada.
7. Si el usuario borra todo el texto de un valor elegido, se llama a `onChange(null)`.
8. Al cerrar sin elegir (click afuera, Escape, Tab), el input vuelve a mostrar el label del valor actual (o queda vacío si no hay valor). El texto a medio escribir no queda como si fuera un valor.
9. Si `value` cambia desde afuera (por ejemplo, un reset del formulario), el input lo refleja.

### `PaymentsPage` — selector de cliente

10. El `<select>` de cliente del modal "Registrar Pago Mensual" se reemplaza por `SearchableSelect` con label "Cliente".
11. Cada opción muestra nombre, apellido y DNI, y la marca de deudor que ya existe (`⚠️ (DEUDOR)`).
12. Se busca por nombre, apellido o DNI. En el DNI se ignoran puntos y espacios (`"40.123"` encuentra `40123456`).
13. Enviar el pago usa el `id` del cliente elegido, igual que hoy. Sin cliente elegido no se envía (validación existente).
14. Al confirmar un pago con éxito el selector vuelve a quedar vacío (reset existente).

## Casos de borde

- **Lista vacía** (`options = []`): al abrir muestra `emptyMessage`, no rompe.
- **Clientes con `dni` null** (creados antes de la spec 0001): no rompen la búsqueda y se encuentran por nombre. Es el mismo bug que AC-0002-11 cubrió en el POS.
- **Nombres repetidos** (dos "Juan Pérez"): se distinguen por el DNI en la opción, y se elige por `getKey`, no por el label.
- **Query con espacios al principio o al final:** se ignoran.
- **Muchas opciones** (`getAllClientsList` trae hasta 1000): la lista tiene alto máximo con scroll; la opción resaltada con el teclado queda visible.
- **Texto escrito y click en "Confirmar Pago" sin elegir:** no hay valor, el pago no se envía (punto 8).
- **Modal cerrado y reabierto sin pagar:** el cliente elegido se conserva, igual que con el `<select>` actual.
- **Selector dentro de `Modal`:** la lista no queda cortada por el `overflow` del modal.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0005-01 | `SearchableSelect` con 12 opciones renderiza un `combobox` accesible por su label; al hacer click muestra un `listbox` con las 12 `option`. |  |
| AC-0005-02 | Escribir `"ramon"` con opciones `"Ramón Díaz"`, `"RAMONA Paz"` y `"Luis Gil"` deja visibles solo las dos primeras. |  |
| AC-0005-03 | Click en una opción llama a `onChange` una vez con ese objeto (verificado por `getKey`), cierra el `listbox` y el input muestra su label. |  |
| AC-0005-04 | Con el foco en el input, ↓ ↓ Enter llama a `onChange` con la segunda opción visible; Escape con la lista abierta la cierra sin llamar a `onChange`. |  |
| AC-0005-05 | Con un filtro que no deja opciones, se muestra "Sin resultados" (o el `emptyMessage` dado) y Enter no llama a `onChange`. |  |
| AC-0005-06 | Con un valor elegido, borrar todo el texto llama a `onChange(null)`. Escribir texto sin elegir y sacar el foco no llama a `onChange` y el input vuelve a mostrar el label del valor actual. |  |
| AC-0005-07 | Si el `value` que recibe cambia de un objeto a `null` desde afuera, el input queda vacío. |  |
| AC-0005-08 | En `PaymentsPage`, el modal de pago muestra un `combobox` "Cliente" y ya no hay un `<select>` de clientes. |  |
| AC-0005-09 | En `PaymentsPage`, con clientes `Nora Vega (DNI 60111222)`, `Nora Ruiz (DNI 70999888)` y uno con `dni: null`, escribir `"60.111"` deja visible solo a Nora Vega; escribir `"nora"` muestra a las dos Noras sin error. |  |
| AC-0005-10 | En `PaymentsPage` como PROFESSOR, elegir un cliente con el buscador, elegir la cuota y confirmar llama a `createMonthlyPayment` con el `idClient` de ese cliente. |  |
| AC-0005-11 | En `PaymentsPage`, escribir un nombre en el buscador sin elegir ninguna opción, elegir la cuota y confirmar **no** llama a `createMonthlyPayment`. |  |

## Fuera de alcance

- **Selector de profesor en pagos y POS:** hoy son pocos profesores (menos de 10); la regla del PRD no aplica. Se migra cuando crezca la lista o en el Sprint 2.
- **Buscador de cliente del POS** (`ProductsPage`): ya tiene su propio buscador, corregido en la spec 0002 (AC-0002-11). Migrarlo a `SearchableSelect` es unificar, no arreglar; va aparte.
- **Otros selects largos** (`AssignRoutineModal`, `ClassesPage`, `ClientsPage`, `CreateExerciseModal`, rutinas): se migran uno por uno cuando se toquen. La spec 0003 está modificando `ClassesPage` en paralelo y tocarlo acá chocaría.
- **Búsqueda contra el backend** (paginada, con debounce): `getAllClientsList` ya trae hasta 1000 clientes y el filtro local alcanza para el volumen actual.
- **Mensaje del backend en el toast de error de pago** (`"❌ Error al registrar el pago"` genérico): es T-10.
- **Selección múltiple:** no se pidió; la spec 0003 resuelve los días con otro control.

## Notas de handoff

**Qué se asumió:**
- `onChange` acepta `null` (el PRD lo tipa como `T`), para poder limpiar el valor (punto 7).
- La búsqueda ignora tildes además de mayúsculas; el PRD solo dice "filtro por texto/DNI".
- La lista se renderiza entera, sin virtualizar ni cortar a N resultados. Con 1000 clientes filtrados en memoria no debería notarse.
- La lista flota en posición absoluta debajo del input; si `Modal` corta por `overflow`, se ajusta el modal, no se usa un portal.

**Decisiones de aprobación (14/09/2026, Agustín):**
1. La búsqueda **ignora tildes y mayúsculas** (AC-0005-02).
2. Cada opción muestra **nombre, apellido, DNI y la marca `⚠️ (DEUDOR)`** (punto 11).

**Qué es lo más probable que salga mal:**
- **Romper los tests de la spec 0002.** `PaymentsPage.test.tsx` (AC-0002-12) elige el cliente con `user.selectOptions` sobre el `<select>`. Al desaparecer el `<select>` esos tests fallan por la razón equivocada: hay que cambiar solo cómo eligen el cliente, sin tocar lo que verifican del selector de profesor.
- **El blur que se come el click.** Si la lista se cierra en `onBlur` del input, el `mousedown` sobre una opción saca el foco antes del `click` y la opción nunca se elige. Pasa en el navegador y a veces no en jsdom: probarlo a mano además del test (`onMouseDown` con `preventDefault` en las opciones).
- **`isDebtor` en el label rompe la búsqueda por nombre** si `searchBy` usa `getLabel` y el label incluye `"⚠️ (DEUDOR)"`: buscar "deudor" encontraría clientes. `PaymentsPage` tiene que pasar su propio `searchBy`.
