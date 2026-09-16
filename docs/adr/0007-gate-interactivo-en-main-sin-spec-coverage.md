# 0007 — Compuerta interactiva en `main` sin `spec_coverage`

**Fecha:** 15/09/2026
**Estado:** Activa

## Contexto

`spec_coverage.py` exige que **toda** spec con `estado: aprobada` en `specs/` tenga sus AC-ID cubiertos por un test en el checkout actual. Aprobar una spec la mergea a `main` de inmediato (commit de docs), pero su implementación vive en otra rama — `sandcastle/spec-NNNN` o un worktree interactivo aparte (p. ej. `gymapp-spec-0005`) — que puede tardar días en volver a mergear.

Mientras tanto, el Stop hook corre la compuerta completa (`HARNESS_GATE_SCOPE=completo`, el default) en **cualquier** sesión interactiva sobre el checkout de `main`, así que `spec_coverage` falla por las AC de esas specs pendientes — incluso en un turno que solo tocó un doc o hizo `git push`, sin escribir una línea de código.

Es el mismo problema que el propio `hook_stop.sh` ya resolvió para el planner y el reviewer de Sandcastle (comentario en el archivo: *"Un agente que no escribe no puede ser bloqueado por lo que no está escrito"*), vía `HARNESS_GATE_SCOPE=no-specs`. No había una excepción equivalente para una sesión interactiva humana trabajando directo sobre `main`.

## Decisión

`gymapp/.claude/settings.local.json` (gitignored, por checkout — no se sube al repo) fija `env.HARNESS_GATE_SCOPE=no-specs` **solo para el checkout de `main`**.

La implementación real de una spec nunca pasa directo por `main`: siempre es en `sandcastle/spec-NNNN` o en un worktree interactivo aparte (convención ya en uso, ver [[spec-0005-worktree]] en memoria y `docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md`). Esos checkouts tienen su propio `.claude/settings.local.json` (ausente o distinto, porque el archivo es local y no viaja con `git worktree add`) y corren la compuerta completa antes de mergear — como se verificó el 15/09/2026 con la T2 de la spec 0005 (38/63 criterios, gate completo en verde salvo las AC de 0003/0004, ajenas). Relajar `main` no relaja lo que de verdad importa: la cobertura de la spec que se está implementando.

## Alternativas consideradas

1. **Hacer que `spec_coverage.py` detecte specs "en curso" en otra rama/worktree y las excluya solo.** Más preciso en teoría, pero exige cruzar refs de git y worktrees desde un script de Python invocado por un hook — mucho más frágil e invasivo para un problema que ya tenía una salida documentada y probada (`HARNESS_GATE_SCOPE`).
2. **No tocar nada y convivir con la fricción.** Descartada: cada Stop en `main` bloqueaba con un fallo que no tenía nada que ver con el turno.
3. **Bajar el gate también en CI** (`.github/workflows/harness.yml`). No se hizo: ese workflow corre `verify.sh` sin flags, así que CI puede seguir marcando `main` en rojo por la misma causa hasta que 0003/0004 mergeen. Tocar `harness.yml` es tocar el kit vendoreado desde `commons/`, y es una decisión aparte si además se quiere CI en verde durante specs en curso.

## Consecuencias

- El Stop hook interactivo en `main` sigue exigiendo lint + typecheck + tests; deja de exigir `spec_coverage` de specs cuya implementación vive en otra rama.
- Si alguna vez se implementa código directo en `main` (rompiendo la convención de ramas/worktrees), esa implementación **no** quedaría gateada por `spec_coverage` en el Stop hook local — sí en CI, que sigue con el gate completo.
- CI en GitHub puede seguir en rojo en pushes a `main` mientras 0003/0004 no mergeen; es un costo aceptado, no resuelto acá.
- Cuando 0003, 0004 (y cualquier spec futura) terminen de mergear, `spec_coverage` en `main` vuelve a estar en 0 criterios faltantes sin que haga falta revertir nada — la excepción es permanente pero solo importa cuando hay una spec aprobada sin implementación mergeada.
