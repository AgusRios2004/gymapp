# spec-driven

El rol del harness de `commons`. No es una copia de upstream: es nuestro, y ya
trae resueltos los seis problemas de `roles/PARCHES.md`.

Toma **specs aprobadas** en vez de issues sueltas, y ejecuta el pipeline completo:

```
plan (opus) → test-author (sonnet) → implementer (sonnet) → reviewer (opus, read-only) → merge
```

## Qué lo diferencia de `parallel-planner-with-review`

| | upstream | spec-driven |
|:---|:---|:---|
| Entrada | issues del gestor | specs en estado `aprobada` |
| Tests | los escribe el implementer | los escribe un agente aparte, **antes** |
| Reviewer | edita la rama | read-only, emite JSON tipado |
| Merge | todo lo que tenga commits | solo lo que pasó la revisión |
| Comandos | `npm run test` hardcodeado | de `harness.config.yml` |
| `TARGET_BRANCH` | no se pasa (bug) | se pasa |

Las dos decisiones que más cambian el resultado:

**El test-author está separado del implementer.** Si el mismo agente escribe el
test y el código que lo hace pasar, el test se adapta al código. Separarlos es la
versión barata de tener dos personas.

**El reviewer no puede editar.** Un agente que arregla lo que encuentra deja sus
propios cambios sin revisar. Acá emite hallazgos y el merge los respeta: un
hallazgo de severidad `alta` bloquea la rama.

Y todo hallazgo tiene que citar un AC violado **o** un escenario de falla
concreto. Los de opinión se descartan por schema antes de llegar a un humano —
es la respuesta directa a la fatiga de revisión: el bot que comenta todo se
ignora a las dos semanas.

## Instalación

Requiere el harness instalado (`commons/harness/install.sh`), porque los prompts
leen los comandos de `harness.config.yml` y corren `verify.sh`.

```bash
cd ~/WorkSpace/mi-proyecto
mkdir -p .sandcastle
cp ~/WorkSpace/commons/sandcastle-template/roles/spec-driven/* .sandcastle/
npm i -D @ai-hero/sandcastle zod
```

En `package.json`:

```json
"scripts": { "sandcastle": "npx tsx .sandcastle/main.mts" }
```

## Antes de la primera corrida

1. **Verificá el mapeo de modelos** en `main.mts` (`MODELOS`). Los
   identificadores cambian entre versiones; el harness usa alias
   (`opus`/`sonnet`/`haiku`) justamente para que ese objeto sea el único lugar a
   tocar. Un modelo inexistente falla ruidosamente; uno viejo que todavía
   responde te cobra por un modelo peor sin avisar.
2. **Verificá la API de `@ai-hero/sandcastle` instalada** contra
   `node_modules/@ai-hero/sandcastle/README.md`. Este `main.mts` se escribió
   contra la forma de la v0.12.0: `run`, `createSandbox`, `Output.object`.
3. **Confirmá `RAMA_BASE`.** Por defecto `main`; se cambia con
   `SANDCASTLE_TARGET_BRANCH`.
4. **Tiene que haber al menos una spec en `aprobada`.** Sin eso el planner sale
   con la lista vacía y la corrida termina en el acto, que es lo correcto.

## Proveedores por rol

La idea del flujo de Spotify, llevada del I/O al rol entero: no todo tiene que
correr en Claude. El modelo caro planifica y revisa; uno barato escribe tests e
implementa. Se elige por rol en `harness.config.yml`:

```yaml
agents:
  planner: opus                      # sin prefijo = Claude
  test_author: "pi:<modelo>"         # pi, p. ej. con Gemini
  implementer: "codex:<modelo>"      # Codex CLI, OpenAI
  reviewer: opus                     # SIEMPRE Claude
  merger: sonnet
```

`main.mts` imprime el proveedor y el modelo de cada rol al arrancar: mirá esa
tabla antes de dejarlo corriendo.

### Reglas

- **El reviewer es Claude, sin excepción.** Su read-only es `permissionMode: "plan"`,
  que solo existe en Claude Code. Si le ponés otro proveedor, la corrida no arranca.
- **Los alias `opus`/`sonnet`/`haiku` son solo de Claude.** Para `pi:` y `codex:`
  va el id tal cual lo acepta ese CLI (`pi --model …`, `codex -m …`).
- **`merger` tiene clave propia** (default `sonnet`). Antes heredaba de
  `implementer`; separado para que un implementer barato no arrastre al merger.

### Qué se pierde fuera de Claude, y cómo se repone

Los hooks del harness son de Claude Code. **pi y codex no los corren:**

| Hook | Qué hacía | Con pi/codex |
|:---|:---|:---|
| `hook_stop.sh` (G2) | No deja cerrar con el suite en rojo | Lo repone el orquestador: después del implementer corre `verify.sh` con `sandbox.exec`. Si falla, la rama no pasa a revisión |
| `hook_post_edit.sh` | Lint rápido tras cada edición | Se pierde. Lo atrapa el `verify.sh` de arriba, pero al final y no en el momento |
| `hook_pre_read.sh` | Barrera de I/O | Se pierde, y no importa: la barrera existe para no llenar de contexto al modelo caro, y estos son los baratos |

La compuerta del orquestador corre para **todos** los proveedores, Claude
incluido: `hook_stop.sh` tiene una guarda anti-bucle que al segundo intento deja
cerrar en rojo, así que tampoco con Claude era una garantía.

### Antes de usar pi o codex

1. **El CLI tiene que estar en la imagen de Docker.** La del harness solo trae
   Claude Code. En `.sandcastle/Dockerfile`, antes de `USER`:

   ```dockerfile
   RUN npm install -g @mariozechner/pi-coding-agent   # para pi:
   RUN npm install -g @openai/codex                   # para codex:
   ```

   Después: `npx sandcastle docker build-image`.
2. **Las claves van en `.sandcastle/.env`**, que es lo que sandcastle inyecta en
   el contenedor: `GEMINI_API_KEY` (pi con Gemini), `OPENAI_API_KEY` (codex).
   Claude sigue necesitando `CLAUDE_CODE_OAUTH_TOKEN` o `ANTHROPIC_API_KEY`
   para el planner y el reviewer.

### Sin verificar todavía

Escrito el 12/09/2026 contra los tipos de v0.12.0 (`pi()`, `codex()`,
`Sandbox.exec()`), sin una corrida real. Lo que puede fallar primero:

- **El formato del id de modelo en pi.** Sandcastle lo pasa tal cual a
  `pi --model`; no está confirmado si pi espera `gemini-…` o `google/gemini-…`.
- **Que un modelo no-Claude respete los prompts.** Sobre todo emitir
  `<promise>COMPLETE</promise>` y los commits con prefijo `spec-NNNN:`. Si no
  emite la señal, el loop gasta todas sus `maxIterations`.
- **El planner fuera de Claude.** Se permite, pero depende de que emita un `<plan>`
  JSON limpio (ya se cayó una vez con Claude el 09/09/2026). Empezá cambiando
  `test_author` o `implementer`, no el planner.

## Variables de entorno

| Variable | Default | Para qué |
|:---|:---|:---|
| `SANDCASTLE_TARGET_BRANCH` | `main` | Rama base de los diffs y del merge |
| `SANDCASTLE_MAX_ITERATIONS` | `5` | Vueltas de plan→ejecución→merge |

## Límite conocido

El reviewer es read-only **por prompt y por `maxIterations: 1`**, no por
restricción de herramientas: no es una garantía dura. Si la versión instalada del
paquete permite limitar las herramientas por corrida, aplicalo en el `run()` del
reviewer — está marcado con un comentario en `main.mts`.
