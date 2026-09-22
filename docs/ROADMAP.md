# 🗺️ ROADMAP — GymApp

> Vista de meses. Para "qué toca en las próximas semanas" ver [`sprints/`](./sprints/). Para "por qué se decidió X" ver [`adr/`](./adr/). Para "qué se construye en esta capa" ver [`prd/`](./prd/).
> **Última actualización:** 13/09/2026 (Sprint 1 partido: el diseño pasa al Sprint 2 — [ADR-0006](./adr/0006-partir-sprint-1-diseno-a-sprint-2.md))

---

## Las 3 capas

El producto se construye en 3 capas progresivas, cada una desbloquea la siguiente **solo si la anterior pasa QA sin bugs críticos** (regla fijada en [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md)):

```
CAPA 1 — ADMIN       Gestión operativa completa (clientes, pagos, rutinas, asistencia, clases)
CAPA 2 — ENTRENADOR  Rutinas inteligentes + LLM
CAPA 3 — ALUMNO      Consumo de su propio plan
```

---

## Estado y fechas

| Capa | Estado | Período | PRD | Sprint(s) |
|:---|:---:|:---|:---|:---|
| **1 — Admin** | 🔵 En curso | 07/09 → 18/10/2026 | [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md) | [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) (bugs críticos + pipeline, → 04/10) · [Sprint 2](./sprints/05-10-2026-sprint-2-diseno-light-mode.md) (diseño + UX, → 18/10) · [Sprint 3](./sprints/16-09-2026-sprint-3-mobile-frontend.md) (mobile, adelantado, sirve a la QA Sesión 03) |
| **2 — Entrenador** | ⬜ Sin fecha | A definir tras QA Sesión 03 (17/10) | [`prd/PRD_ENTRENADOR.md`](./prd/PRD_ENTRENADOR.md) (borrador, 21/09/2026 — adelantado, no se empieza a construir hasta cerrar Capa 1) | — |
| **3 — Alumno** | ⬜ Sin fecha | Después de Capa 2 | Falta escribir `prd/PRD_ALUMNO.md` | — |

Las fechas de Capa 2 y 3 son deliberadamente "sin fecha" — no las inventamos hasta que la Capa 1 cierre y sepamos la velocidad real del equipo. Cuando eso pase, actualizar esta tabla, no antes.

---

## ⏱️ Capacidad del proyecto — leer antes de poner cualquier fecha

GymApp es un **proyecto de pasatiempo**. La capacidad real (declarada el 06/09/2026) es **~2 hs/día de lunes a viernes y ~4 hs/día los fines de semana** — techo de 18 hs/semana, y se planifica sobre **~12,5 hs/semana efectivas** para absorber los días que se saltean.

Cualquier fecha de este roadmap sale de dividir el esfuerzo estimado por esas 12,5 hs/semana. **No planificar sobre días hábiles completos ni sobre 5 hs/día** — así se estimó Sprint 1 la primera vez y quedaba en 2 semanas cuando en realidad son 4.

> Por qué se fijó este número y qué alternativas se descartaron: [ADR-0004](./adr/0004-capacidad-de-planificacion.md).

---

## ⚠️ Nota sobre numeración de Sprints

`PRD_REFACTOR.md` habla internamente de "SPRINT 0" (bugs críticos), "SPRINT 1" (UX) y "SPRINT 2" (diseño) como fases lógicas del backlog. El documento operativo real, [`sprints/06-09-2026-sprint-1-refactor-core-admin.md`](./sprints/06-09-2026-sprint-1-refactor-core-admin.md), agrupaba las tres fases del PRD en un solo sprint calendario llamado "Sprint 1"; desde el 13/09/2026 el diseño ("SPRINT 2" del PRD) quedó en el [Sprint 2 calendario](./sprints/05-10-2026-sprint-2-diseno-light-mode.md), que además recibe parte de la UX. **No son el mismo número por casualidad que coincidan** — son dos numeraciones distintas (fases de backlog vs. sprints calendario). Si se abre un Sprint 2 real, tenerlo en cuenta para no confundirlo con el "SPRINT 2" interno del PRD.

---

## Hitos

- [x] Capa 1 — QA Sesión 01 (05/09/2026): relevamiento de bugs, decisión de light mode.
- [x] Capa 1 — saneamiento de documentación (06/09/2026): duplicados de `docs/` eliminados, `CLAUDE.md`/`GEMINI.md` sincronizados, backlog auditado contra el código, sprint recalendarizado sobre la capacidad real.
- [x] Capa 1 — harness de commons + Sandcastle `spec-driven` instalados (12/09/2026, [ADR-0005](./adr/0005-harness-commons-y-sandcastle-spec-driven.md)).
- [x] Capa 1 — Fase 0: pipeline de agentes probado con la spec 0001 (20/09/2026).
- [x] Capa 1 — Sprint 3 (mobile, adelantado): 13 filas de auditoría cerradas, 31 bugs corregidos contra ADR-0009 (21/09/2026) — pendiente una pasada visual en navegador a 375px.
- [ ] Capa 1 — Sprint 1 cierra (04/10/2026) con QA Sesión 02 sin bugs críticos.
- [ ] Capa 1 — Sprint 2 cierra (18/10/2026) con QA Sesión 03 sin bugs críticos ni de experiencia. **Cierre de Capa 1.**
- [x] Capa 2 — escribir `prd/PRD_ENTRENADOR.md` (alcance de rutinas inteligentes + LLM, 21/09/2026 — borrador adelantado, ver [ADR-0010](./adr/0010-capa2-revision-humana-obligatoria.md)).
- [ ] Capa 2 — primer sprint (no arranca hasta cerrar Capa 1 en QA Sesión 03).
- [ ] Capa 3 — escribir `prd/PRD_ALUMNO.md`.

---

## Al cerrar una capa

1. Mover su PRD a [`archive/`](./archive/) (queda como referencia histórica, no como fuente de verdad).
2. Actualizar la tabla de arriba con las fechas reales (no las estimadas).
3. Si se tomó alguna decisión de arquitectura relevante durante la capa que no esté en `adr/`, documentarla ahí antes de olvidarla.
