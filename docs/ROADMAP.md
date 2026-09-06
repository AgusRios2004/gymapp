# 🗺️ ROADMAP — GymApp

> Vista de meses. Para "qué toca en las próximas 2 semanas" ver [`sprints/`](./sprints/). Para "por qué se decidió X" ver [`adr/`](./adr/). Para "qué se construye en esta capa" ver [`prd/`](./prd/).
> **Última actualización:** 06/09/2026

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
| **1 — Admin** | 🔵 En curso | 06/09 → 19/09/2026 | [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md) | [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) |
| **2 — Entrenador** | ⬜ Sin fecha | A definir tras QA Sesión 02 (19/09) | Falta escribir `prd/PRD_ENTRENADOR.md` | — |
| **3 — Alumno** | ⬜ Sin fecha | Después de Capa 2 | Falta escribir `prd/PRD_ALUMNO.md` | — |

Las fechas de Capa 2 y 3 son deliberadamente "sin fecha" — no las inventamos hasta que la Capa 1 cierre y sepamos la velocidad real del equipo. Cuando eso pase, actualizar esta tabla, no antes.

---

## ⚠️ Nota sobre numeración de Sprints

`PRD_REFACTOR.md` habla internamente de "SPRINT 0" (bugs críticos), "SPRINT 1" (UX) y "SPRINT 2" (diseño) como fases lógicas del backlog. El documento operativo real, [`sprints/06-09-2026-sprint-1-refactor-core-admin.md`](./sprints/06-09-2026-sprint-1-refactor-core-admin.md), agrupa las tres fases del PRD en un solo sprint calendario de 2 semanas llamado "Sprint 1". **No son el mismo número por casualidad que coincidan** — son dos numeraciones distintas (fases de backlog vs. sprints calendario). Si se abre un Sprint 2 real, tenerlo en cuenta para no confundirlo con el "SPRINT 2" interno del PRD.

---

## Hitos

- [x] Capa 1 — QA Sesión 01 (05/09/2026): relevamiento de bugs, decisión de light mode.
- [ ] Capa 1 — Sprint 1 cierra (19/09/2026) con QA Sesión 02 sin bugs críticos ni de experiencia.
- [ ] Capa 1 — merge a `main`.
- [ ] Capa 2 — escribir `prd/PRD_ENTRENADOR.md` (alcance de rutinas inteligentes + LLM).
- [ ] Capa 2 — primer sprint.
- [ ] Capa 3 — escribir `prd/PRD_ALUMNO.md`.

---

## Al cerrar una capa

1. Mover su PRD a [`archive/`](./archive/) (queda como referencia histórica, no como fuente de verdad).
2. Actualizar la tabla de arriba con las fechas reales (no las estimadas).
3. Si se tomó alguna decisión de arquitectura relevante durante la capa que no esté en `adr/`, documentarla ahí antes de olvidarla.
