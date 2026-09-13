# 0004 — Capacidad de planificación: ~12,5 hs/semana, no días hábiles

**Fecha:** 06/09/2026
**Estado:** Activa

## Contexto

El Sprint 1 se escribió el 06/09/2026 estimando ~50 hs de trabajo y cerrando en 2 semanas, con esta línea al pie del resumen de estimación:

> A razón de 5 hs/día efectivas de desarrollo → **10 días hábiles = 2 semanas**. ✅

La aritmética cerraba y el rango 06/09 → 19/09 tiene efectivamente 10 días hábiles. El problema es que la premisa era falsa: **GymApp es un proyecto de pasatiempo, no una asignación full-time.** La capacidad real que puede sostener el dev es ~2 hs/día de lunes a viernes y ~4 hs/día los fines de semana.

Con la premisa equivocada, el sprint prometía en 2 semanas algo que necesita 4. Eso no es un error cosmético de fechas: arrastra al `ROADMAP.md` (que estimaba el arranque de la Capa 2 tras el QA del 19/09) y a cualquier compromiso que se derive de ahí.

Además, los hitos caían en días no laborables — kick-off domingo 06/09, mid-sprint review sábado 12/09, QA de cierre sábado 19/09 — lo que sugiere que se generaron contando días de calendario sin mirar a qué día caían.

## Decisión

Toda fecha de sprint se calcula sobre **~12,5 hs/semana efectivas**.

Ese número sale de un techo de 18 hs/semana (5 × 2 hs + 2 × 4 hs) al que se le descuenta ~30% por días que se saltean. Se planifica sobre el número descontado, no sobre el techo.

Corolarios:

- **Nunca planificar sobre "días hábiles"** ni sobre una cifra de hs/día tipo jornada laboral.
- Los hitos y checkpoints van en **días que efectivamente se trabajan**, preferentemente domingo (el día de más horas disponibles).
- Si dos semanas seguidas se caen, **se recorta alcance antes que estirar la fecha**.

## Alternativas consideradas

**Planificar sobre el techo de 18 hs/semana.** Descartada: no deja margen. Una semana con un imprevisto rompe el plan y obliga a recalendarizar, que es exactamente el costo que este ADR busca evitar. Los 5,5 hs/semana de diferencia son el amortiguador.

**Partir el Sprint 1 en dos sprints de 2 semanas** (bugs críticos / UX + diseño). Tiene a favor un ciclo de feedback más corto, y encaja con las tres fases lógicas que el `PRD_REFACTOR.md` ya llama "SPRINT 0/1/2". Descartada por ahora: `ROADMAP.md` documenta explícitamente la decisión de agrupar esas fases en un único sprint calendario, y no se quiso revertir una decisión deliberada sólo para acomodar el cambio de fechas. Los checkpoints semanales dentro del sprint cumplen la función de corte. **Si un sprint futuro vuelve a pasar de 3 semanas, reconsiderar esta alternativa.**

**No documentar nada y sólo corregir las fechas.** Descartada: la estimación irreal ya se produjo una vez de forma espontánea. Sin una regla escrita, el próximo sprint la repite.

## Consecuencias

- Un sprint de ~50 hs dura **4 semanas**, no 2. El Sprint 1 pasa a 07/09 → 04/10/2026.
- El arranque de la Capa 2 (Entrenador) se corre: depende del QA Sesión 02, que pasa del 19/09 al 03/10.
- `ROADMAP.md` incorpora una sección "Capacidad del proyecto" que hay que leer **antes de poner cualquier fecha**. Es el lugar donde vive el número; este ADR explica por qué.
- Las estimaciones en horas de las tareas **no cambian** por este ADR — lo que cambia es cuántas horas entran por semana. Una tarea de 4 hs sigue siendo de 4 hs.
- Cuando el Sprint 1 cierre, la retrospectiva debe comparar velocidad real contra estas 12,5 hs/semana. Si la real es sistemáticamente distinta, **se escribe un ADR nuevo que reemplace a este** — no se edita este archivo (ver regla de oro en [`README.md`](./README.md)).

## Referencias

- Sprint recalendarizado: [`../sprints/06-09-2026-sprint-1-refactor-core-admin.md`](../sprints/06-09-2026-sprint-1-refactor-core-admin.md) → sección "Capacidad real"
- Auditoría que originó la decisión: [`../notes/BITACORA_QA.md`](../notes/BITACORA_QA.md) → "Auditoría de Documentación y Código — 06 Sep 2026", hallazgos DOC-03 y DOC-04
