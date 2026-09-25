# Sprint 3 — Pasada completa de mobile + frontend

> **Origen:** pedido directo del usuario (16/09/2026), adelantado sobre el calendario — Sprint 1 y Sprint 2 ya cerraron todas sus tareas (ver sus docs), y sirve al mismo objetivo que la QA Sesión 03 (17/10): cerrar Capa 1 sin bugs de experiencia. No es un sprint nuevo del PRD, es trabajo extra aprovechando capacidad sobrante — igual que T-19/T-22/T-23 en su momento.
> **Estándar de referencia:** [ADR-0009](../adr/0009-estandar-mobile.md) y [`DESIGN_SYSTEM.md` § 6.1 Mobile](../DESIGN_SYSTEM.md).
> **Modo de ejecución:** `/loop` autopaced. Ver reglas de ejecución más abajo antes de tocar código.
> **Estado:** ✅ Completado (21/09/2026) — pasada visual a 375px hecha el 22/09/2026 (M-32 a M-37)

---

## 🎯 Objetivo

Pasar **todas** las vistas del frontend por el checklist de [ADR-0009](../adr/0009-estandar-mobile.md) (breakpoints, sin scroll horizontal de página, tablas con `overflow-x-auto`, targets táctiles ≥44px, formularios que colapsan en mobile) y corregir lo que no cumpla.

## ⚖️ Regla de ejecución (importante para el loop)

Hay dos tipos de tarea, y se tratan distinto:

- **🔧 Mecánica** (aplicar una regla ya escrita en el ADR — envolver una tabla, agrandar un botón, colapsar un grid): el loop la resuelve solo, sin pedir aprobación. Es la aplicación de un estándar ya acordado, no una decisión de diseño nueva.
- **🎨 Necesita mockup**: si corregir algo mobile implica inventar un layout nuevo (ej. "esta tabla debería ser una lista de cards en mobile" en vez de scrollear), eso **es** una decisión de diseño — va a un Design canvas (`/design`) y **se deja publicado para que el usuario lo apruebe**, no se implementa solo. Anotar acá el link del mockup y dejar la tarea en 🟡 hasta que el usuario la apruebe.

Después de cada tarea (mecánica o aprobada): `bash .harness/scripts/verify.sh` en verde antes de marcarla ✅, commit propio por tarea (mismo patrón que Sprint 1/2).

---

## 📋 Bugs ya encontrados en la auditoría (16/09/2026) — 🔧 mecánicos

| ID | Bug | Archivo | Estado |
|:---:|:---|:---|:---:|
| M-01 | Dos tablas sin `overflow-x-auto` (el contenedor usa `overflow-hidden`, el contenido se recorta en mobile) | `pages/ProductsPage.tsx` (líneas ~242 y ~401) | ✅ |
| M-02 | Botones de acción de la card de clase (editar/borrar) con target táctil ~24-28px, por debajo del mínimo de 44px | `pages/ClassesPage.tsx` | ✅ |
| M-03 | Grid de 3 columnas del form "Nuevo Registro Físico" no colapsa en mobile | `pages/ClientDetailPage.tsx` (línea ~497) | ✅ |
| M-04 | Links "Gestionar Stock →" / "Ver Alumnos →" de los banners de alerta sin padding, target táctil ~16-20px de alto | `pages/DashboardPage.tsx` | ✅ |
| M-05 | `Button` size="sm" usaba `h-9` (36px), por debajo del mínimo de 44px — afecta a las 19 llamadas con `size="sm"` en todo el frontend (11 archivos) | `components/ui/Button.tsx` | ✅ |
| M-06 | Toggle de estado activo/inactivo con hit area de 20×36px (el propio switch visual) | `components/clients/ClientItem.tsx` | ✅ |
| M-07 | Pills de filtro (Todos/Activos/Inactivos/Deudores) ~36-40px de alto y el `<select>` de "por página" ~28px, ambos por debajo de 44px | `pages/ClientsPage.tsx` | ✅ |
| M-08 | Tabs de la ficha de cliente (`px-5 py-2.5 text-xs`) ~36-40px de alto | `pages/ClientDetailPage.tsx` | ✅ |
| M-09 | Botón de borrar registro físico con hit area ~32px y además solo visible con `group-hover` — inaccesible en touch (sin hover) | `pages/ClientDetailPage.tsx` | ✅ |
| M-10 | Botones +250ml/+500ml/-250ml (`py-2.5 text-xs`) ~36px de alto | `components/HydrationTracker.tsx` | ✅ |
| M-11 | Botón submit "Guardar Registro de Comida" (~40px) y botón "Eliminar" de comida sin padding (~16px de alto) | `components/ClientNutritionTab.tsx` | ✅ |
| M-12 | `<select>` de "Tipo de Cuota" del modal de registrar pago (`p-2`) ~40px de alto | `pages/PaymentsPage.tsx` | ✅ |
| M-13 | Tabs Inventario/Punto de Venta/Historial Ventas (`px-6 py-2 text-sm`) ~36px de alto | `pages/ProductsPage.tsx` | ✅ |
| M-14 | Botones editar/borrar de la tabla de inventario (`p-2`, ícono 18px) ~34px de hit area | `pages/ProductsPage.tsx` | ✅ |
| M-15 | Botón de quitar ítem del carrito (POS) sin padding, ~16px de hit area | `pages/ProductsPage.tsx` | ✅ |
| M-16 | Botón "Ver registro histórico completo" sin padding, ~14px de hit area (nota: además no tiene `onClick`, queda sin funcionalidad — no es un tema mobile, no se implementó) | `pages/AttendancePage.tsx` | ✅ |
| M-17 | Botones editar/borrar de las cards de plan (`p-2`, ícono 18px) ~34px de hit area | `pages/MonthlyTypesPage.tsx` | ✅ |
| M-18 | Botón dar de baja/reactivar profesor (`p-2`, ícono 18px) ~34px de hit area | `pages/StaffPage.tsx` | ✅ |
| M-19 | Link "Volver al Login" sin padding, ~20px de hit area | `pages/RegisterPage.tsx` | ✅ |
| M-20 | `Input.tsx` (`py-2.5`) quedaba en ~40px de alto — afecta a los 13 archivos que usan el componente compartido `Input` | `components/ui/Input.tsx` | ✅ |
| M-21 | Input y opciones del combobox (`py-2.5`/`py-2`) ~40px/36px de alto — usado en Pagos, Productos, asignar rutina, etc. | `components/ui/SearchableSelect.tsx` | ✅ |
| M-22 | Botón cerrar (✕, sin padding) y `<select>` de día (`h-10`) por debajo de 44px | `components/routines/AssignRoutineModal.tsx` | ✅ |
| M-23 | Botón cerrar (✕, sin padding) ~16px de hit area | `components/routines/RoutineDetailsModal.tsx` | ✅ |
| M-24 | Botón cerrar (`p-2`, ícono 20px) ~36px y toggle activo/inactivo (20×56px) por debajo de 44px de alto | `components/clients/ClientModal.tsx` | ✅ |
| M-25 | Fila de ejercicio sin `flex-wrap` (podía recortarse en mobile, el modal usa `overflow-hidden`) + botón cerrar, "Eliminar Día", botón "+", reordenar y borrar ejercicio todos por debajo de 44px | `components/routines/CreateRoutineModal.tsx` | ✅ |
| M-26 | Checkbox "Rutina Activa" (20×20px sin envolver), botón cerrar, borrar día, "Eliminar Rutina", "+ AGREGAR", select/inputs de ejercicio y reordenar/borrar — todos por debajo de 44px | `components/routines/EditRoutineModal.tsx` | ✅ |
| M-27 | Botón hamburguesa mobile (`p-2.5`, ícono 22px) ~42px de alto | `layouts/MainLayout.tsx` | ✅ |
| M-28 | Botón "Cerrar Sesión" (`py-2.5 text-xs`) ~36px de alto | `components/ui/SIdebar.tsx` | ✅ |
| M-29 | Ítems de navegación del sidebar (`px-3.5 py-2.5 text-xs`) ~36px de alto | `components/ui/SidebarItem.tsx` | ✅ |
| M-30 | Botones ver/editar/borrar de las cards de rutina (`p-2`, ícono 16px) ~32px de hit area | `pages/RoutinesPage.tsx` | ✅ |
| M-31 | Input "Nombre" y select "Grupo Muscular" (`py-2`, sin `text-sm`) ~40px de alto | `components/exercises/CreateExerciseModal.tsx` | ✅ |

### Pasada visual a 375px (22/09/2026)

Hecha con Playwright + Chromium headless (la extensión de Chrome seguía sin conectar): 19 vistas (login, registro, las 11 páginas del menú, ficha de cliente y sus tabs, menú mobile abierto), midiendo scroll horizontal de página, contenido recortado por contenedores `overflow-hidden` y targets táctiles <44px, más revisión de capturas. La métrica de scroll sola daba todo verde porque el `overflow-x-hidden` del `<main>` escondía el desborde en vez de evitarlo — el contenido quedaba cortado.

| ID | Bug | Archivo | Estado |
|:---:|:---|:---|:---:|
| M-32 | Restos del template de Vite: `#root` con `padding: 2rem` y `max-width: 1280px` — comía 64px de ancho en mobile y contradecía el layout 100% de T-22. También tenía `text-align: center`, que centraba por herencia títulos y textos en toda la app de forma inconsistente (unas páginas con `text-left` explícito, otras no). Se borró `App.css` entero; se comparó antes/después en las 19 vistas a 375px y 1440px: lo que está pensado centrado (login, empty states, cards de staff/ejercicios en mobile) tiene `text-center` propio y no cambió | `App.css` (borrado), `App.tsx` | ✅ |
| M-33 | Card de cliente: los 3 botones (`min-w-[100px]` de `Button sm`) y el bloque de datos (`items-start` lo dimensiona al contenido) desbordaban la card; "Editar", el toggle y el DNI quedaban cortados | `components/clients/ClientItem.tsx` | ✅ |
| M-34 | Header del widget de objetivo sin `flex-wrap`: badge del objetivo cortado y botón "Editar Metas" fuera de pantalla | `components/physical/RecompositionWidget.tsx` | ✅ |
| M-35 | El botón hamburguesa (fijo) tapaba el título de Clases, Pagos, Ejercicios, Planes, Asistencia y la tab "Inventario" de Productos — `<main>` sin espacio superior en mobile | `layouts/MainLayout.tsx` | ✅ |
| M-36 | Buscador de Staff aplastado (~80px) al lado de "Nuevo Profesor" | `pages/StaffPage.tsx` | ✅ |
| M-37 | Inputs de búsqueda de Staff y Productos con hit area real de 20-24px (el padding era del contenedor, no del input) | `pages/StaffPage.tsx`, `pages/ProductsPage.tsx` | ✅ |
| M-38 | Íconos pasados como children de `Button` (`<Plus /> Nuevo Plan`) quedaban **arriba** del texto: `Button` envolvía los children en un `<span>` inline y el preflight de Tailwind hace `svg { display: block }`. El span pasa a `inline-flex` y hereda el `gap` del botón | `components/ui/Button.tsx` | ✅ |

## 📋 Auditoría pendiente por pantalla — verificar contra ADR-0009, corregir si hace falta

Páginas ya revisadas de pasada al escribir el ADR (sin bugs nuevos encontrados, pero sin auditoría exhaustiva): `MainLayout.tsx`/`Sidebar` (drawer mobile ya anda bien), `ClassesPage.tsx` grid de días, `RoutinesPage.tsx`, `ExercisesPage.tsx`. El resto no se miró todavía:

| ID | Pantalla | Estado |
|:---:|:---|:---:|
| P-01 | `DashboardPage.tsx` | ✅ (encontró M-04, corregido) |
| P-02 | `ClientsPage.tsx` (tabla/lista + filtros) | ✅ (encontró M-05, M-06, M-07, corregidos) |
| P-03 | `ClientDetailPage.tsx` (tabs, gráfico Recharts, resto de la vista) | ✅ (encontró M-08 a M-11, corregidos; gráfico Recharts y tablas de pagos/compras ya cumplían) |
| P-04 | `PaymentsPage.tsx` | ✅ (encontró M-12, corregido; tabla ya tenía overflow-x-auto. Nota fuera de scope: el modal usa colores `gray`/`blue` en vez de la paleta emerald/slate del design system — no es un tema mobile, dejarlo para la pasada de diseño del Sprint 2/QA) |
| P-05 | `ProductsPage.tsx` (además de M-01) | ✅ (encontró M-13, M-14, M-15, corregidos; grid Precio/Stock del modal es 2 columnas cortas, cumple sin cambios. Mismo aparte de colores gray/blue que P-04) |
| P-06 | `AttendancePage.tsx` | ✅ (encontró M-16, corregido; el resto — cards de resultado, grid de actividad — ya cumplía. Mismo aparte de colores gray/blue que P-04/P-05) |
| P-07 | `MonthlyTypesPage.tsx` | ✅ (encontró M-17, corregido; grid de cards y grid Precio/Duración del modal ya cumplían) |
| P-08 | `StaffPage.tsx` | ✅ (encontró M-18, corregido; grid de cards y grid Nombre/Apellido del modal ya cumplían) |
| P-09 | `LoginPage.tsx` / `RegisterPage.tsx` | ✅ (encontró M-19 en RegisterPage, corregido; LoginPage ya cumplía, el grid de 4 campos de RegisterPage ya colapsaba a 1 columna en mobile) |
| P-10 | `DesignSystemShowcasePage.tsx` | ✅ (verificado, cumple sin cambios — solo usa componentes compartidos ya corregidos por M-05, todos los grids ya son responsive) |
| P-11 | Componentes compartidos: `SearchableSelect.tsx`, `ConfirmModal.tsx`, `Modal.tsx`, todos los modales de `components/routines/` y `components/clients/` (`Button.tsx` ya quedó cubierto por M-05) | ✅ (encontró M-20 a M-26, corregidos; `ConfirmModal.tsx` y `Modal.tsx` ya cumplían — solo usan `Button` y `Input`, ya arreglados. `CreateExerciseModal.tsx` queda para P-13 junto con ExercisesPage) |
| P-12 | Segunda pasada de `MainLayout.tsx`/`Sidebar` — confirmar que el estándar del ADR se cumple también ahí (no solo el drawer) | ✅ (encontró M-27, M-28, M-29, corregidos; el drawer en sí, el `overflow-x-hidden` del main y el ancho fijo w-64 ya cumplían) |
| P-13 | `RoutinesPage.tsx` y `ExercisesPage.tsx` — pasada específica contra el checklist completo del ADR (lo de hoy solo miró grids, falta touch targets y demás puntos) | ✅ (encontró M-30 en RoutinesPage y M-31 en CreateExerciseModal.tsx, corregidos; ExercisesPage.tsx ya cumplía sin cambios) |

Cada fila de auditoría (P-XX) puede cerrar sin cambios ("verificado, cumple") o abrir una tarea M-XX/D-XX nueva si encuentra algo — anotarlo en esta tabla al cerrar la fila, no dejarlo suelto en un commit sin rastro.

## 🎨 Tareas que salgan con mockup (D-XX)

Se agregan acá a medida que la auditoría las encuentre. Formato: `| D-XX | Qué pantalla / qué decisión | Link del mockup | 🟡 pendiente aprobación / ✅ aprobado |`.

| ID | Pantalla / decisión | Mockup | Estado |
|:---:|:---|:---|:---:|
| D-01 | Encabezado de la ficha del alumno: nombre arriba y datos abajo, link "‹ Alumnos" en lugar del botón cuadrado, pestañas subrayadas, métricas sin cortes. Se implementa por la [spec 0007](../../specs/0007-rediseno-ficha-y-asignar-rutina.md) | [canvas](https://claude.ai/artifact/HXvma78PG1ePfWCgQL1FRz) (privado) | ✅ aprobado 22/09/2026 — spec 0007 `implementada` 24/09/2026 |
| D-02 | Modal "Asignar rutina": plantillas como lista seleccionable, hoja inferior en mobile, botones renombrados que entran en pantalla. Se implementa por la [spec 0007](../../specs/0007-rediseno-ficha-y-asignar-rutina.md) | [canvas](https://claude.ai/artifact/HXvma78PG1ePfWCgQL1FRz) (privado) | ✅ aprobado 22/09/2026 — spec 0007 `implementada` 24/09/2026 |

---

## ✅ Criterios de cierre del sprint

- [x] Todos los bugs mecánicos encontrados (M-01 a M-38) corregidos y verificados.
- [x] Las 13 filas de auditoría (P-01 a P-13) cerradas — con cambios o confirmando que ya cumplían.
- [x] Ninguna tarea D-XX quedó sin decisión del usuario (no se abrió ninguna — el único caso límite, la fila de ejercicio de `CreateRoutineModal.tsx` sin `flex-wrap`, se resolvió aplicando un patrón ya usado en `EditRoutineModal.tsx`, no una decisión de diseño nueva).
- [x] `verify.sh` en verde en `main` en cada commit.
- [x] Sin scroll horizontal de página en ninguna vista, probado en el viewport de referencia (375px de ancho) — pasada visual del 22/09/2026 con Chromium headless, 19 vistas sin desborde ni contenido recortado tras corregir M-32 a M-37. Verificado también a 1440px que el desktop no cambió.
