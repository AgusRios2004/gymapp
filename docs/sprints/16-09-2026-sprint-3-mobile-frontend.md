# Sprint 3 — Pasada completa de mobile + frontend

> **Origen:** pedido directo del usuario (16/09/2026), adelantado sobre el calendario — Sprint 1 y Sprint 2 ya cerraron todas sus tareas (ver sus docs), y sirve al mismo objetivo que la QA Sesión 03 (17/10): cerrar Capa 1 sin bugs de experiencia. No es un sprint nuevo del PRD, es trabajo extra aprovechando capacidad sobrante — igual que T-19/T-22/T-23 en su momento.
> **Estándar de referencia:** [ADR-0009](../adr/0009-estandar-mobile.md) y [`DESIGN_SYSTEM.md` § 6.1 Mobile](../DESIGN_SYSTEM.md).
> **Modo de ejecución:** `/loop` autopaced. Ver reglas de ejecución más abajo antes de tocar código.
> **Estado:** 🔵 En curso

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
| P-09 | `LoginPage.tsx` / `RegisterPage.tsx` | ⬜ |
| P-10 | `DesignSystemShowcasePage.tsx` | ⬜ |
| P-11 | Componentes compartidos: `SearchableSelect.tsx`, `ConfirmModal.tsx`, `Modal.tsx`, todos los modales de `components/routines/` y `components/clients/` (`Button.tsx` ya quedó cubierto por M-05, no volver a auditarlo acá) | ⬜ |
| P-12 | Segunda pasada de `MainLayout.tsx`/`Sidebar` — confirmar que el estándar del ADR se cumple también ahí (no solo el drawer) | ⬜ |
| P-13 | `RoutinesPage.tsx` y `ExercisesPage.tsx` — pasada específica contra el checklist completo del ADR (lo de hoy solo miró grids, falta touch targets y demás puntos) | ⬜ |

Cada fila de auditoría (P-XX) puede cerrar sin cambios ("verificado, cumple") o abrir una tarea M-XX/D-XX nueva si encuentra algo — anotarlo en esta tabla al cerrar la fila, no dejarlo suelto en un commit sin rastro.

## 🎨 Tareas que salgan con mockup (D-XX)

Ninguna todavía — se agregan acá a medida que la auditoría las encuentre. Formato: `| D-XX | Qué pantalla / qué decisión | Link del mockup | 🟡 pendiente aprobación / ✅ aprobado |`.

---

## ✅ Criterios de cierre del sprint

- [ ] Todos los bugs mecánicos encontrados (M-01 a M-07 y los que salgan de la auditoría) corregidos y verificados.
- [ ] Las 13 filas de auditoría (P-01 a P-13) cerradas — con cambios o confirmando que ya cumplían.
- [ ] Ninguna tarea D-XX quedó sin decisión del usuario (aprobada o descartada).
- [ ] `verify.sh` en verde en `main` en cada commit.
- [ ] Sin scroll horizontal de página en ninguna vista, probado al menos en el viewport de referencia (375px de ancho).
