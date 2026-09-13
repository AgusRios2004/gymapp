# 0006 — Partir el Sprint 1: el diseño pasa a un Sprint 2

**Fecha:** 13/09/2026
**Estado:** Activa

## Contexto

El Sprint 1 (07/09 → 04/10/2026) se planificó el 06/09 con ~49,5 hs sobre 4 semanas de ~12,5 hs ([ADR-0004](./0004-capacidad-de-planificacion.md)), incluyendo ~6 hs de buffer.

La Semana 1 no cerró ninguna tarea del backlog. Sus horas se fueron en instalar el harness de commons y reemplazar Sandcastle ([ADR-0005](./0005-harness-commons-y-sandcastle-spec-driven.md)), y eso dejó trabajo nuevo que no estaba en el plan: un perfil de test del backend que no dependa de la MySQL local, test runner en el frontend, y la primera spec corrida de punta a punta (~6 hs, la "Fase 0").

Al 13/09 quedaban 3 semanas (~37,5 hs) contra ~49,5 hs (backlog completo + Fase 0, sin buffer). El Checkpoint 1 del 13/09 no se cumplió.

## Decisión

Partir el sprint en vez de estirar la fecha:

- **Sprint 1** mantiene su cierre del **04/10/2026** y queda en: Fase 0 (T-31..T-35), bugs críticos de backend y frontend, clases multi-día, `SearchableSelect` en pagos (T-15, T-16) y toggle de cliente (T-25). ~34,75 hs + ~2,75 hs de buffer.
- **Sprint 2** (05/10 → 18/10/2026) recibe el diseño global (T-21..T-24, T-26..T-30) y los componentes UX que no son bugs (T-17..T-20). ~19 hs + ~6 hs de buffer.
- Las tareas **conservan su ID** al mover de sprint.
- La **Capa 1 cierra al final del Sprint 2**, con la QA Sesión 03 (17/10). La Capa 2 no arranca antes.
- Sandcastle **no suma capacidad** en el plan hasta tener velocidad medida: las horas de tareas delegadas se cuentan como manuales.

## Alternativas consideradas

**Mover la fecha del Sprint 1 una semana (QA 10/10) y sacar T-27, T-29 y T-30.** Descartada: rompe la regla de ADR-0004 de recortar alcance antes que estirar la fecha, y deja el sprint en 5 semanas, justo el caso en que ADR-0004 pedía reconsiderar partirlo.

**Mantener todo y contar con que Sandcastle absorba el backend.** Descartada: el pipeline no corrió nunca en gymapp. Planificar sobre una velocidad que no se midió es el mismo error que planificar sobre 5 hs/día.

**Partir solo sacando T-20, como se propuso en la conversación.** Descartada al hacer la cuenta semana por semana: la Semana 4 también tiene que absorber la QA Sesión 02 (~2 hs), y así no cerraba. Por eso también salen T-17, T-18 y T-19.

## Consecuencias

- Los criterios de aceptación de diseño (inputs blancos, layout 100%, ESC en todos los modales, toast centrado, buscador en *todos* los selects) se mueven al Sprint 2.
- El merge a `main` deja de ser uno solo al cierre: se trabaja con ramas cortas por bloque, porque Sandcastle necesita partir de `main` con las specs mergeadas.
- La Capa 2 se corre dos semanas: su PRD se escribe después del 18/10, no del 04/10.
- Si el Checkpoint 2 del Sprint 1 (27/09) llega con atraso, el recorte pre-acordado es T-25 → T-16 → T-15, en ese orden. No se mueve la QA.

## Referencias

- [Sprint 1 recalendarizado](../sprints/06-09-2026-sprint-1-refactor-core-admin.md)
- [Sprint 2](../sprints/05-10-2026-sprint-2-diseno-light-mode.md)
- [ROADMAP](../ROADMAP.md)
