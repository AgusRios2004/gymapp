# 🗺️ ROADMAP — GymApp

> Vista de meses. Para "qué toca en las próximas semanas" ver [`sprints/`](./sprints/). Para "por qué se decidió X" ver [`adr/`](./adr/). Para "qué se construye en esta capa" ver [`prd/`](./prd/).
> **Última actualización:** 06/09/2026 (saneamiento de docs + recalendarización Sprint 1)

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
| **1 — Admin** | 🔵 En curso | 07/09 → 04/10/2026 | [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md) | [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) |
| **2 — Entrenador** | ⬜ Sin fecha | A definir tras QA Sesión 02 (03/10) | Falta escribir `prd/PRD_ENTRENADOR.md` | — |
| **3 — Alumno** | ⬜ Sin fecha | Después de Capa 2 | Falta escribir `prd/PRD_ALUMNO.md` | — |

Las fechas de Capa 2 y 3 son deliberadamente "sin fecha" — no las inventamos hasta que la Capa 1 cierre y sepamos la velocidad real del equipo. Cuando eso pase, actualizar esta tabla, no antes.

---

## ⏱️ Capacidad del proyecto — leer antes de poner cualquier fecha

GymApp es un **proyecto de pasatiempo**. La capacidad real (declarada el 06/09/2026) es **~2 hs/día de lunes a viernes y ~4 hs/día los fines de semana** — techo de 18 hs/semana, y se planifica sobre **~12,5 hs/semana efectivas** para absorber los días que se saltean.

Cualquier fecha de este roadmap sale de dividir el esfuerzo estimado por esas 12,5 hs/semana. **No planificar sobre días hábiles completos ni sobre 5 hs/día** — así se estimó Sprint 1 la primera vez y quedaba en 2 semanas cuando en realidad son 4.

> Por qué se fijó este número y qué alternativas se descartaron: [ADR-0004](./adr/0004-capacidad-de-planificacion.md).

---

## ⚠️ Nota sobre numeración de Sprints

`PRD_REFACTOR.md` habla internamente de "SPRINT 0" (bugs críticos), "SPRINT 1" (UX) y "SPRINT 2" (diseño) como fases lógicas del backlog. El documento operativo real, [`sprints/06-09-2026-sprint-1-refactor-core-admin.md`](./sprints/06-09-2026-sprint-1-refactor-core-admin.md), agrupa las tres fases del PRD en un solo sprint calendario de 2 semanas llamado "Sprint 1". **No son el mismo número por casualidad que coincidan** — son dos numeraciones distintas (fases de backlog vs. sprints calendario). Si se abre un Sprint 2 real, tenerlo en cuenta para no confundirlo con el "SPRINT 2" interno del PRD.

---

## Hitos

- [x] Capa 1 — QA Sesión 01 (05/09/2026): relevamiento de bugs, decisión de light mode.
- [x] Capa 1 — saneamiento de documentación (06/09/2026): duplicados de `docs/` eliminados, `CLAUDE.md`/`GEMINI.md` sincronizados, backlog auditado contra el código, sprint recalendarizado sobre la capacidad real.
- [ ] Capa 1 — Sprint 1 cierra (04/10/2026) con QA Sesión 02 sin bugs críticos ni de experiencia.
- [ ] Capa 1 — merge a `main`.
- [ ] Capa 2 — escribir `prd/PRD_ENTRENADOR.md` (alcance de rutinas inteligentes + LLM).
- [ ] Capa 2 — primer sprint.
- [ ] Capa 3 — escribir `prd/PRD_ALUMNO.md`.

---

## Al cerrar una capa

1. Mover su PRD a [`archive/`](./archive/) (queda como referencia histórica, no como fuente de verdad).
2. Actualizar la tabla de arriba con las fechas reales (no las estimadas).
3. Si se tomó alguna decisión de arquitectura relevante durante la capa que no esté en `adr/`, documentarla ahí antes de olvidarla.
