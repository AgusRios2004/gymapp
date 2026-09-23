# Tareas — spec 0007: rediseño de la ficha y de "Asignar rutina"

> Spec: [`0007-rediseno-ficha-y-asignar-rutina.md`](./0007-rediseno-ficha-y-asignar-rutina.md) · Estado de la spec: `aprobada`
> Solo frontend. Tamaños **relativos** entre sí (chica / media / grande), sin base histórica para estimar en horas.

| # | Tarea | Archivos | Depende de | AC | Tamaño |
|:---:|:---|:---|:---:|:---|:---:|
| T1 | **Armado de tests de la ficha.** Test de `ClientDetailPage` con las queries mockeadas (cliente, pagos, rutinas del alumno) y un helper de render con router y `QueryClient`. Sin cambios de UI todavía: el test del `h1` (AC-0007-01) queda rojo contra el encabezado actual | `pages/ClientDetailPage.test.tsx` | — | (base de AC-0007-01 a 06) | chica |
| T2 | **Encabezado de la ficha.** Link "‹ Alumnos"/breadcrumb, avatar con iniciales, `h1` en Title Case, etiquetas de estado y cuota, `dl` con DNI, teléfono, rutina actual y último pago, y botón "Asignar rutina" responsive (spec §A.1–4) | `pages/ClientDetailPage.tsx`, `pages/ClientDetailPage.test.tsx` | T1 | AC-0007-01 a 05 | media |
| T3 | **Pestañas subrayadas.** Fila de pestañas dentro de la card del encabezado (desktop) y con scroll propio más difuminado (mobile), `aria-selected`, sin íconos en mobile (spec §A.5) | `pages/ClientDetailPage.tsx`, `pages/ClientDetailPage.test.tsx` | T2 | AC-0007-06 | chica |
| T4 | **Métricas sin cortes.** Valor principal con `whitespace-nowrap` y la meta en su propia línea en `RecompositionWidget` (spec §A.6) | `components/physical/RecompositionWidget.tsx`, `components/physical/RecompositionWidget.test.tsx` | — | AC-0007-07 | chica |
| T5 | **Lista de plantillas en el modal.** Reemplazar el `SearchableSelect` por buscador + `radiogroup` de tarjetas, con la etiqueta "Actual", estado vacío y "sin coincidencias" (spec §B.7–8) | `components/routines/AssignRoutineModal.tsx`, `components/routines/AssignRoutineModal.test.tsx` | — | AC-0007-08 a 10 | media |
| T6 | **Acciones y layout del modal.** Botones renombrados y su lógica (deshabilitados sin plantilla, "Asignar y cargar otra" limpia sin cerrar, error sin cerrar), hoja inferior en mobile con pie fijo, pie en una línea en desktop, ESC/cerrar (spec §B.9–13) | `components/routines/AssignRoutineModal.tsx`, `components/routines/AssignRoutineModal.test.tsx` | T5 | AC-0007-11 a 15 | grande |
| T7 | **Verificación visual y cierre.** Recorrer el checklist "Verificación visual" de la spec a 375px y 1440px (ficha y modal, desde `/clients` y desde la ficha), marcar D-01/D-02 en el doc del Sprint 3 y pasar la spec a `implementada` | `docs/sprints/16-09-2026-sprint-3-mobile-frontend.md`, `specs/0007-*.md` | T2–T6 | — | chica |

## Orden

```
T1 ──► T2 ──► T3 ──┐
T4 ────────────────┼──► T7
T5 ──► T6 ─────────┘
```

Hay tres ramas independientes: la ficha (T1 → T2 → T3), el widget (T4) y el modal (T5 → T6). Se pueden hacer en cualquier orden entre sí.

## Choques de archivo a tener en cuenta

- **`ClientDetailPage.tsx`:** lo tocan T2 y T3, en ese orden. No lo toca ninguna otra tarea.
- **`AssignRoutineModal.tsx`:** lo tocan T5 y T6, en ese orden.
- **`RecompositionWidget.tsx`:** ya tiene un cambio sin commitear en `main` (M-34, `flex-wrap` del encabezado del widget). **Commitearlo antes de arrancar**, así T4 parte de esa versión.
- **`Button.tsx`:** ninguna tarea lo toca (el cambio de verde está fuera de alcance).
