# spec-driven

El rol del harness de `commons`. No es una copia de upstream: es nuestro, y ya
trae resueltos los seis problemas de `roles/PARCHES.md`.

Toma **specs aprobadas** en vez de issues sueltas, y ejecuta el pipeline completo:

```
plan (opus) → test-author (sonnet) → implementer (sonnet) → verify.sh → reviewer (opus, read-only) → merge (orquestador)
                                                                              │        ▲
                                                                  hallazgos   ▼        │
                                                               fixer (implementer) → verify.sh
                                                               hasta agents.max_fix_rounds vueltas
```

## Qué lo diferencia de `parallel-planner-with-review`

| | upstream | spec-driven |
|:---|:---|:---|
| Entrada | issues del gestor | specs en estado `aprobada` |
| Tests | los escribe el implementer | los escribe un agente aparte, **antes** |
| Reviewer | edita la rama | read-only, emite JSON tipado |
| Hallazgos | vuelven al humano | vuelven a un fixer, con un test rojo por hallazgo |
| Merge | un agente, sobre la rama base | el orquestador: `git merge` + `verify.sh` por rama en una rama de integración, fast-forward al final. Agente solo si hay conflicto |
| Reglas de los prompts | texto | chequeadas con `git diff` por el orquestador |
| Corrida cortada | se repite desde cero | se retoma desde la fase en que quedó |
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
$EDITOR .sandcastle/Dockerfile        # descomentar el RUNTIME del stack
npx sandcastle docker build-image
```

El `Dockerfile` trae fijo lo común (git, Claude Code, usuario `agent`) y
comentados los runtimes que ya se usaron en el workspace: Java 21 (gymapp) y
Python con uv (bot-finance). Node no necesita bloque: viene en la imagen base.
Si `commands.install` de tu config usa una herramienta que no está en la imagen,
el `onSandboxReady` falla en la primera fase.

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
5. **`commands.test` tiene que estar agrupado** si es compuesto:
   `"( (cd back && mvn test) && (cd front && npm test) )"`. `main.mts` lo chequea
   al arrancar y no sigue si no lo está (ver "Reglas para los prompts").

## Controles del orquestador

Lo que los prompts prohíben, `main.mts` lo verifica con git sobre la rama, sin
gastar tokens y sin depender de que el agente obedezca (R3 aplicada al propio
pipeline). Cualquier violación manda la spec a `.sandcastle/pendientes/` con
los archivos involucrados.

| Después de | Se chequea |
|:---|:---|
| test-author | que solo tocó archivos de test (`spec_coverage.test_glob` o bajo `paths.tests`), y que la suite **falla**: tests nuevos que pasan sin implementación no prueban lo que falta |
| implementer | que no modificó ni borró los tests del test-author (agregar tests propios sí puede) |
| implementer y fixer | que nadie tocó `specs/` |
| reviewer | que la rama sigue en el mismo commit |

El test-author corre con `HARNESS_GATE_SCOPE=solo-lint`: antes, su hook `Stop`
le exigía la suite en verde, que es lo contrario de su trabajo, y los logs de
los dos pilotos lo muestran peleando contra eso en cada spec.

## Merge

Lo hace el orquestador, no un agente:

1. Crea `sandcastle/integracion-<timestamp>` desde la rama base, en un sandbox.
2. Por cada rama aprobada: `git merge --no-ff`, `verify.sh`, y si queda en rojo
   vuelve al commit anterior y la rama va a pendientes.
3. Si git no puede resolver solo (conflicto), entra el merger (`merge-prompt.md`)
   para ese merge puntual. Si no lo resuelve, se aborta.
4. La spec pasa a `estado: implementada` con un `sed` sobre la línea del
   frontmatter, en un commit `spec-NNNN: implementada`.
5. Al final, fast-forward de la base en el host. Si la base se movió durante la
   corrida o el árbol del host choca, no se fuerza nada: la rama de integración
   queda con las specs verificadas y el comando para mergearla.

Antes, un agente con `maxIterations: 1` mergeaba directo sobre la base del host
y el prompt le pedía releer los logs del reviewer "por las dudas". En gymapp
quedó un `fix(tests): resolver colisiones entre specs 0003 y 0004 tras el
merge` hecho a mano.

## Mediciones

Cada fase agrega una línea a `.sandcastle/mediciones.jsonl` (ignorado por git):
spec, fase, agente, segundos, iteraciones y tokens (entrada, caché, salida),
cuando el proveedor los reporta. Es el entregable de T-08 que nunca se había
escrito:

```bash
jq -s 'group_by(.fase) | map({fase: .[0].fase, n: length, seg: (map(.segundos) | add)})' .sandcastle/mediciones.jsonl
```

## Vuelta de corrección

Un hallazgo de la revisión vuelve al implementer, no al humano.

1. El reviewer devuelve hallazgos. Cada uno recibe un id: `H-NNNN-<vuelta>-<n>`.
2. Los de las severidades de `agents.fix_severidades` van a un **fixer**, que usa
   el proveedor y el modelo de `agents.implementer`. Por cada hallazgo escribe
   primero un test rojo que reproduce el `escenario_de_falla` y cita el id, y
   después el arreglo. Un commit por hallazgo: `spec-NNNN: fix H-…`.
3. El orquestador corre `verify.sh`. En verde, revisión nueva desde cero; en rojo,
   otra vuelta del fixer con la salida de la compuerta y los mismos hallazgos.
4. Se repite hasta que la revisión no deja nada que corregir, o hasta
   `agents.max_fix_rounds`.

Si se agotan las vueltas:

| Queda | Resultado |
|:---|:---|
| algún hallazgo `alta` | no se mergea; la rama queda para el humano con el último JSON |
| `verify.sh` en rojo | no se mergea; ídem, con la salida de la compuerta |
| solo `media`/`baja` | se mergea, y los hallazgos quedan en el log de la corrida |

El reviewer sigue siendo read-only: el fixer es otro agente, y su arreglo lo
revisa una revisión nueva. Si el fixer no logra reproducir un hallazgo, no toca el
código y lo deja en un commit vacío (`no reproducible — …`) que el reviewer lee
en la vuelta siguiente.

```yaml
agents:
  max_fix_rounds: 2              # 0 = sin vuelta: un alta bloquea directo
  fix_severidades: "alta,media"  # qué entra al fixer; bloquear lo hace solo alta
```

### Por qué el fixer no resume sesión entre vueltas

Cada vuelta es un `sandbox.run()` nuevo: relee la spec, `AGENTS.md` y los
commits desde cero por `!` en el prompt en vez de continuar la conversación de
la vuelta anterior con `resumeSession`. Se evaluó usar `resumeSession` (o el
`.resume()` de `RunResult`) para que el fixer recuerde qué probó en la vuelta 1
al entrar a la vuelta 2, y se descartó por una razón concreta, no por pereza:
la documentación de `RunOptions` dice explícitamente que `resumeSession` es
**incompatible con `maxIterations > 1`**, y el fixer necesita `maxIterations: 50`
— arregla varios hallazgos en una misma vuelta, cada uno con su propio ciclo
RED/GREEN/COMMIT.

Usarlo igual exigiría partir cada hallazgo en su propia corrida de
`maxIterations: 1` encadenada por `resume`, en vez de una corrida por vuelta —
un rediseño del bucle, no un cambio chico. Releer la spec y los commits por
`!` ya es barato (son `cat`/`git log`, no el archivo completo), así que el
ahorro de tokens de la sesión resumida es incierto contra el costo de romper
un pipeline que hoy funciona. Se deja anotado acá para no reabrirlo sin este
contexto.

## Retomar una corrida cortada

Una rama `sandcastle/spec-NNNN` que ya existe no saca a la spec del plan: el
planner la devuelve con la `fase` desde donde sigue, y `main.mts` saltea lo hecho.

| La rama tiene | Fase | Qué corre |
|:---|:---|:---|
| nada, o no existe | `tests` | todo |
| solo commits `spec-NNNN: tests` | `implement` | implementer → revisión |
| algún otro commit | `review` | `verify.sh` → revisión |

El planner deduce la fase de los asuntos de los commits, así que el orquestador
la corrige con hechos: sin commits por delante de la base siempre es `tests`, con
commits nunca vuelve a `tests`, y una `review` con la rama en rojo pasa a
`implement`.

Una corrida matada a mitad de la revisión se retoma desde la revisión.

## `.sandcastle/pendientes/`

Lo que el pipeline no pudo resolver solo. Un archivo `spec-NNNN.*` saca a esa spec
del plan, en esta corrida y en las siguientes:

- **Lo escribe el orquestador** cuando la spec se traba: hallazgos o compuerta
  roja después de la última vuelta del fixer, test-author sin commits, un error
  del pipeline, una violación de los controles del orquestador, o una rama
  aprobada que el merge no pudo meter en la base. El JSON trae el
  motivo, la rama y los últimos hallazgos.
- **Lo puede crear un humano** para abandonar una spec a mano:
  `echo "abandonada" > .sandcastle/pendientes/spec-0003.abandonada`.
- **Borrarlo devuelve la spec al pipeline**, desde la fase en la que haya quedado
  su rama. Para empezarla de cero, borrá también la rama.

Sin esta marca, una spec trabada se replanifica en cada vuelta y quema una
revisión de opus por vuelta sin cambiar nada. El directorio se ignora a sí mismo
(trae su propio `.gitignore`): es estado de la máquina, no del repo.

## Límite de uso del proveedor

Si un agente choca el límite de uso (`You've hit your session limit`), `main.mts`
corta la corrida entera con código de salida 3 y un mensaje claro, en vez de
contar la spec como fallida y pasar a la vuelta siguiente. Todo lo que sigue
también es un agente y lo va a chocar. Las ramas quedan como están y la próxima
corrida retoma cada spec desde su fase.

## Reglas para los prompts

- **Nada que tarde más de 30 s va en un `` !`…` ``.** sandcastle 0.12.0 corta cada
  expansión de shell de un prompt a los 30 s (`PROMPT_EXPANSION_TIMEOUT_MS`, no
  configurable) y aborta la fase con `PromptExpansionTimeoutError`. Tests,
  `verify.sh`, builds: los corre `main.mts` con `sandbox.exec`, que no tiene ese
  límite, y los pasa por `promptArgs` (`TEST_RESULT`, `VERIFY_RESULT`). En los
  prompts quedan solo lecturas rápidas: `cat`, `git log`, `git diff`, `ls`.
- **Una expansión tiene que salir con código 0.** Si puede no encontrar nada
  (`grep`, `ls` de un directorio que no existe), cerrala con `|| true`.
- **`commands.test` compuesto va agrupado entero** entre `( … )`. Quien le agrega
  `2>&1 | tail` (un prompt, un agente) se lo pega solo al último tramo si no lo
  está, y con el primer tramo en rojo el prompt aborta. Pasó en gymapp el
  13/09/2026; `main.mts` lo rechaza al arrancar.

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

1. **El CLI tiene que estar en la imagen de Docker.** El `Dockerfile` del rol
   trae las dos líneas comentadas (`pi` y `codex`) en el bloque "RUNTIME, parte
   root". Descomentá la que uses y reconstruí: `npx sandcastle docker build-image`.
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

## La garantía de solo-lectura del reviewer

sandcastle no tiene `allowedTools`/`disallowedTools` (confirmado contra la v0.12.0
instalada, ver `.harness/schemas-verificados.md`). El único lever es
`permissionMode: "plan"`, aplicado al `AGENTE.reviewer` — pero qué bloquea ese
modo puertas adentro de Claude Code nunca se confirmó contra la doc.

Por eso hay una segunda garantía, independiente de esa suposición:
`HARNESS_READONLY=1` en el env del reviewer activa `hook_readonly_guard.sh`
(`harness/scripts/`, instalado por `harness/install.sh`), que bloquea
Edit/Write/NotebookEdit por `PreToolUse` sin importar lo que haga `permissionMode`
puertas adentro. Es el mismo mecanismo que ya hace duras las otras compuertas del
harness — un hook, no un párrafo. Ningún otro rol tiene `HARNESS_READONLY` puesto.

**Esto requiere el harness instalado con los hooks activos** (`.claude/settings.json`
con la entrada `PreToolUse` de `hook_readonly_guard.sh`). Los dos pilotos no la
tenían hasta el 22/09/2026 porque `install.sh --update` no tocaba los hooks.

Y como ni el modo plan ni el hook cubren un `git commit` por Bash, hay una
tercera capa que no depende de nada de eso: el orquestador compara el commit de
la rama antes y después del reviewer. Si cambió, la spec no sigue.
