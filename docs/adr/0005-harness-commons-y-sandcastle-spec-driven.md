# 0005 — Harness de commons y Sandcastle `spec-driven` en vez del loop propio

**Fecha:** 12/09/2026
**Estado:** Activa

## Contexto

`gymapp/.sandcastle/` tenía un orquestador propio: un solo agente (`pi` con `gemini-3.6-flash`) corriendo en loop sin sandbox (`noSandbox()`), con un `prompt.md` que mezclaba roadmap, reglas y tareas, y que commiteaba sobre una rama fija (`feature/gym-completion`). No había compuerta: nada impedía que el agente cerrara una vuelta con el build roto.

El 07/09/2026 ese directorio se extrajo a `~/WorkSpace/commons/sandcastle-template/`, y el 08/09 se armó alrededor una librería compartida con tres capas: skills, harness (contrato + compuertas) y el rol `spec-driven`. El piloto corrió en `bot-finance` y ahí salieron los bugs reales del pipeline (reviewer que nunca bloqueaba un merge, timeouts de instalación, gate de specs sobre agentes que no escriben), ya corregidos en commons.

Mantener el loop viejo en gymapp significaba tener dos formas de orquestar agentes en el workspace, y la de gymapp era la que no tenía ninguno de esos arreglos.

## Decisión

gymapp usa el harness de `commons` y el rol `roles/spec-driven` de Sandcastle. El loop propio se borra (queda en el historial de git).

- `harness.config.yml` es el único archivo propio del harness. Scripts, hooks y prompts se refrescan desde commons (`install.sh --update`); no se parchean en este repo.
- La compuerta (`verify.sh`) corre lo mismo en tres lugares: hooks de Claude Code, a mano y CI.
- Antes de activar la compuerta se dejó ESLint del frontend en cero errores, para que arranque en verde y un rojo signifique algo.
- `.sandcastle/Dockerfile` es propio de gymapp: agrega JDK 21 a la imagen base de Node, porque commons todavía no trae plantilla de Dockerfile.

## Alternativas consideradas

**Reemplazar solo el loop por `single-agent/` de commons.** Descartada: es prácticamente el mismo loop que ya había, sin compuerta ni revisión. Cambia el archivo pero no el problema.

**Instalar el harness y dejar Sandcastle para después.** Descartada por decisión del dev: el motivo de la pasada era dejar de usar el Sandcastle obsoleto. Igual el rol no puede producir nada útil hasta que existan specs aprobadas y base de tests (ver Consecuencias).

**Instalar con los hooks activos y el lint en rojo.** Descartada: el hook `Stop` bloquea el cierre de cada sesión mientras la compuerta falle, y 13 errores preexistentes la dejaban en rojo permanente.

## Consecuencias

- Cada sesión de Claude Code en este repo corre la compuerta completa al terminar (~20 s en local) y bloquea lecturas enteras de archivos de más de 350 líneas.
- El trabajo autónomo pasa a tomar **specs aprobadas** de `specs/`, no tareas del doc de sprint. Una tarea del sprint que se quiera delegar a Sandcastle primero se escribe como spec con AC-IDs.
- **Sandcastle todavía no puede correr una spec de punta a punta en gymapp.** Faltan:
  - un perfil de test del backend que no dependa de la MySQL local (`GymappApplicationTests` levanta el contexto completo contra la base del `.env`, que no existe dentro del sandbox ni en CI);
  - un test runner en el frontend (no hay vitest), sin el cual el test-author no puede escribir tests de FE;
  - credenciales de Claude en `.sandcastle/.env` (`CLAUDE_CODE_OAUTH_TOKEN` o `ANTHROPIC_API_KEY`).
- El CI (`.github/workflows/harness.yml`) va a fallar en el paso de tests hasta resolver el primer punto.

## Referencias

- Librería: `~/WorkSpace/commons/README.md`, `commons/harness/README.md`, `commons/sandcastle-template/roles/spec-driven/README.md`
- Config del proyecto: [`../../harness.config.yml`](../../harness.config.yml)
- Contexto para agentes: [`../../AGENTS.md`](../../AGENTS.md)
