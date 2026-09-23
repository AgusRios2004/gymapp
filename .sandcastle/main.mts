// spec-driven — el rol del harness de commons.
//
// A diferencia de los roles de upstream, este no toma issues sueltas: toma
// SPECS APROBADAS de specs/ y ejecuta el pipeline completo del harness.
//
//   Fase 1 (Plan)      opus, 1 iteración. Lee las specs en estado `aprobada`
//                      que todavía no están implementadas, arma el grafo de
//                      dependencias y emite <plan> JSON validado con Zod.
//                      Ramas deterministas: sandcastle/spec-NNNN. Una spec con
//                      la rama ya empezada vuelve con la fase donde quedó.
//
//   Fase 2 (por spec)  En secuencia, salteando lo que la rama ya tiene hecho:
//                        test-author  sonnet — tests rojos citando cada AC-ID
//                        implementer  sonnet — los pone en verde, RGR
//                        verify.sh    lo corre el orquestador, no el agente
//                        reviewer     opus, 1 iteración, SIN escribir —
//                                     emite JSON tipado con los hallazgos
//                        fixer        modelo del implementer — un test rojo
//                                     y un arreglo por hallazgo, y de nuevo
//                                     verify.sh + reviewer. Hasta
//                                     agents.max_fix_rounds vueltas.
//                      Las specs corren en paralelo entre sí.
//
//   Fase 3 (Merge)     el orquestador, no un agente. Fusiona SOLO las ramas
//                      cuya última revisión no dejó hallazgos alta, en una
//                      rama de integración: git merge + verify.sh por rama,
//                      revierte la que rompe, y fast-forward de la base al
//                      final. El merger (sonnet) entra solo si hay conflicto.
//
//   Controles por rol  Lo que los prompts prohíben, el orquestador lo chequea
//                      con git sobre la rama — sin tokens y sin depender de
//                      que el agente obedezca:
//                        test-author  solo toca archivos de test, y la suite
//                                     queda en rojo
//                        implementer  no modifica los tests del test-author
//                        todos        nadie toca specs/ antes del merge
//                        reviewer     la rama queda en el mismo commit
//
//   Lo que no se puede resolver solo queda en .sandcastle/pendientes/, y el
//   planner no vuelve a tocar esa spec hasta que un humano borre el archivo.
//
// Diferencias de diseño con `parallel-planner-with-review`:
//
//   1. El reviewer NO edita. Un agente que escribe no puede ser el que
//      verifica. Acá emite hallazgos y el merge los respeta.
//   2. Todo hallazgo tiene que citar un AC violado o un escenario de falla
//      concreto. Los de opinión se descartan por schema antes de llegar al
//      humano — es la respuesta a la fatiga de revisión.
//   3. Los comandos salen de harness.config.yml. Nada de npm hardcodeado.
//   4. TARGET_BRANCH se pasa de verdad (upstream tiene ese bug: ver PARCHES.md).
//   5. Cada rol elige proveedor en harness.config.yml (claude, pi, codex): los
//      modelos de arriba son los defaults, no una obligación. El reviewer es
//      la excepción — siempre Claude.
//   6. Cada fase deja tiempo, iteraciones y tokens en .sandcastle/mediciones.jsonl.
//
// Uso:
//   npx tsx .sandcastle/main.mts
//
// Requiere el harness instalado en el repo (commons/harness/install.sh).

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { z } from "zod";

// sandcastle solo lee .sandcastle/.env para inyectarlo DENTRO del sandbox al
// llamar run(); nunca lo carga en este proceso. Sin esto, todo lo que lee de
// process.env acá abajo (RAMA_BASE, MAX_ITERACIONES) ve siempre el default.
process.loadEnvFile(".sandcastle/.env");

// ---------------------------------------------------------------------------
// Configuración: un solo lector, el mismo que usan verify.sh y spec_coverage.py
// ---------------------------------------------------------------------------

const cfg = (clave: string, porDefecto = ""): string => {
  try {
    return execFileSync(
      "python3",
      [".harness/scripts/harness_config.py", clave, "--default", porDefecto],
      { encoding: "utf-8" },
    ).trim();
  } catch {
    return porDefecto;
  }
};

// Comandos reales del proyecto, inyectados en los prompts.
const COMANDOS = {
  TEST_COMMAND: cfg("commands.test", "npm test"),
  TYPECHECK_COMMAND: cfg("commands.typecheck"),
  LINT_COMMAND: cfg("commands.lint"),
  VERIFY_COMMAND: "bash .harness/scripts/verify.sh",
};

// Alias de modelo -> identificador concreto.
//
// Verificado 07/09/2026 contra la doc vigente de la API (ver
// .harness/schemas-verificados.md): con la familia Claude 5 ya lanzada,
// "opus"/"sonnet" apuntan a los últimos modelos con ese nombre —
// claude-opus-5 / claude-sonnet-5, no a los 4.8/4.6. Mismo costo o menor por
// token que sus predecesores. El harness usa alias justamente para que este
// mapeo sea el único lugar que hay que tocar cuando salga la próxima
// generación.
const MODELOS: Record<string, string> = {
  opus: "claude-opus-5",
  sonnet: "claude-sonnet-5",
  haiku: "claude-haiku-4-5-20251001",
};

// Proveedor por rol. El valor de `agents.<rol>` es `[proveedor:]modelo`:
//
//   opus                     → Claude Code, alias resuelto con MODELOS
//   claude:claude-opus-5     → Claude Code, id completo
//   pi:<modelo>              → pi (@mariozechner/pi-coding-agent), p. ej. Gemini
//   codex:<modelo>           → Codex CLI (OpenAI)
//
// Sin prefijo es Claude, así una config vieja sigue significando lo mismo.
// Es la idea del flujo de Spotify llevada al rol entero: el modelo caro
// planifica y revisa, uno barato escribe tests e implementación.
//
// Lo que se pierde fuera de Claude: los hooks de .claude/settings.json son de
// Claude Code, así que pi y codex NO corren hook_stop (G2) ni hook_pre_read
// (barrera de I/O). La G2 la repone el orquestador corriendo verify.sh sobre
// la rama después del implementer — ver "compuerta del orquestador" abajo.
type Proveedor = "claude" | "pi" | "codex";
const PROVEEDORES: readonly Proveedor[] = ["claude", "pi", "codex"];

const agenteDe = (rol: string, porDefecto: string) => {
  const valor = cfg(`agents.${rol}`, porDefecto);
  const sep = valor.indexOf(":");
  const prefijo = sep === -1 ? "claude" : valor.slice(0, sep);
  const modelo = sep === -1 ? valor : valor.slice(sep + 1);

  if (!PROVEEDORES.includes(prefijo as Proveedor) || !modelo) {
    console.error(
      `✗ agents.${rol}: "${valor}" no se entiende.\n` +
        `  Formato: [proveedor:]modelo, con proveedor en ${PROVEEDORES.join(" | ")}.`,
    );
    process.exit(1);
  }

  return {
    rol,
    proveedor: prefijo as Proveedor,
    // Los alias solo existen para Claude: "pi:opus" es un id que pi no conoce.
    modelo: prefijo === "claude" ? (MODELOS[modelo] ?? modelo) : modelo,
  };
};

// HARNESS_GATE_SCOPE va acá, en el AgentProvider, y NO en las opciones de
// run(). RunOptions.env existe y tipa igual, pero el 09/09/2026 se verificó
// que no llega al proceso del hook Stop: el planner leyó su propio hook_stop.sh
// dentro del sandbox y reportó que la variable no estaba puesta. La doc de
// ClaudeCodeOptions.env dice "injected by this agent provider", que es
// exactamente el alcance que hace falta: por rol, no por corrida.
const SIN_GATE_DE_SPECS = { env: { HARNESS_GATE_SCOPE: "no-specs" } };

// El test-author entrega una suite en rojo a propósito: el gate completo lo
// bloqueaba en cada Stop y lo empujaba a escribir implementación (está en los
// logs de bot-finance y gymapp). Solo lint; el rojo correcto lo chequea
// procesarSpec() con sandbox.exec.
const SOLO_LINT = { env: { HARNESS_GATE_SCOPE: "solo-lint" } };

const crearAgente = (
  a: ReturnType<typeof agenteDe>,
  env: Record<string, string> = {},
) => {
  switch (a.proveedor) {
    case "pi":
      return sandcastle.pi(a.modelo, { env });
    case "codex":
      return sandcastle.codex(a.modelo, { env });
    case "claude":
      return sandcastle.claudeCode(a.modelo, { env });
  }
};

const ROL = {
  planner: agenteDe("planner", "opus"),
  testAuthor: agenteDe("test_author", "sonnet"),
  implementer: agenteDe("implementer", "sonnet"),
  reviewer: agenteDe("reviewer", "opus"),
  // Clave propia desde que el implementer puede ser otro proveedor: antes
  // heredaba agents.implementer, y un implementer barato no tiene por qué
  // arrastrar al merger, que resuelve conflictos sobre la rama base.
  merger: agenteDe("merger", "sonnet"),
};

// El reviewer es la única garantía dura de "no escribe", y esa garantía es
// permissionMode: "plan", que solo existe en Claude Code. pi y codex corren
// con permisos totales en AFK: un reviewer ahí es un segundo implementer, que
// es exactamente el bug de upstream que este rol vino a arreglar.
if (ROL.reviewer.proveedor !== "claude") {
  console.error(
    `✗ agents.reviewer: "${ROL.reviewer.proveedor}:${ROL.reviewer.modelo}" no se permite.\n` +
      `  El reviewer tiene que ser Claude: su read-only depende de permissionMode: "plan".`,
  );
  process.exit(1);
}

const AGENTE = {
  // El planner no escribe código: gatearlo con spec_coverage es exigirle tests
  // por specs que recién está eligiendo. Ver hook_stop.sh.
  planner: crearAgente(ROL.planner, SIN_GATE_DE_SPECS.env),
  testAuthor: crearAgente(ROL.testAuthor, SOLO_LINT.env),
  implementer: crearAgente(ROL.implementer),
  // permissionMode: "plan" — verificado 07/09/2026 (v0.12.0 instalada): es el
  // único lever real de sandcastle para esto, mapea al --permission-mode de
  // Claude Code y reemplaza el --dangerously-skip-permissions por defecto.
  // No hay allowedTools/disallowedTools en RunOptions.
  //
  // Pero QUÉ bloquea "plan" puertas adentro de Claude Code nunca se confirmó
  // contra la doc (.harness/schemas-verificados.md lo deja anotado como
  // "asumido, no confirmado"). HARNESS_READONLY=1 cierra eso sin depender del
  // supuesto: hook_readonly_guard.sh (PreToolUse, harness/scripts/) bloquea
  // Edit/Write/NotebookEdit él mismo, con el mismo mecanismo que ya hace duras
  // el resto de las compuertas. Doble garantía a propósito — si mañana
  // permissionMode resulta no bloquear escritura, el hook igual lo hace.
  //
  // El reviewer es read-only: si el implementer dejó un AC sin test, su trabajo
  // es EMITIR ese hallazgo, no quedar bloqueado por él sin poder arreglarlo.
  // El gate de specs sobre la rama lo sigue aplicando el merger.
  reviewer: sandcastle.claudeCode(ROL.reviewer.modelo, {
    permissionMode: "plan",
    env: { ...SIN_GATE_DE_SPECS.env, HARNESS_READONLY: "1" },
  }),
  merger: crearAgente(ROL.merger),
};

const RAMA_BASE = process.env.SANDCASTLE_TARGET_BRANCH || "main";
const MAX_ITERACIONES = Number(process.env.SANDCASTLE_MAX_ITERATIONS || 5);

// TARGET_BRANCH ahora es un prompt-arg built-in de sandcastle (>=0.12.0):
// lo resuelve solo a partir de la rama que esté checkouteada en el host al
// momento de cada run(), y pasarlo a mano por promptArgs rompe con
// PromptError. Como ya no hay forma de fijarlo por código, esta chequea que
// el host esté parado donde SANDCASTLE_TARGET_BRANCH dice antes de arrancar,
// para no mergear contra la rama equivocada por un checkout olvidado.
const RAMA_ACTUAL = execFileSync("git", ["branch", "--show-current"], {
  encoding: "utf-8",
}).trim();
if (RAMA_ACTUAL !== RAMA_BASE) {
  console.error(
    `✗ Estás parado en "${RAMA_ACTUAL}", pero SANDCASTLE_TARGET_BRANCH=${RAMA_BASE}.\n` +
      `  git checkout ${RAMA_BASE} antes de correr sandcastle.`,
  );
  process.exit(1);
}

// Instalar dependencias dentro del sandbox. Se lee de la config para que sirva
// igual en un repo Python, Java o Node.
//
// timeoutMs subido de el default (60s): cada fase levanta un contenedor
// nuevo sin caché de uv/pip persistida, y un "uv sync" en frío (baja el
// intérprete + todas las deps) tiró HookTimeoutError a los 60000ms el
// 09/09/2026 y tumbó el proceso entero (excepción no atrapada, no un fallo
// prolijo de la spec). 5 min de margen.
const hooks = {
  sandbox: {
    onSandboxReady: cfg("commands.install")
      ? [{ command: cfg("commands.install"), timeoutMs: 300_000 }]
      : [],
  },
};

// Vuelta de corrección después de la revisión.
//
// max_fix_rounds: cuántas veces el fixer puede intentar antes de dejarle la
// rama al humano. 0 apaga la vuelta y deja el comportamiento anterior (un
// hallazgo alta bloquea directo).
//
// fix_severidades: qué hallazgos entran al fixer. Bloquear el merge lo sigue
// haciendo solo `alta`: una `media` que sobrevive a todas las vueltas se
// mergea igual y queda logueada.
const MAX_RONDAS_FIX = Number(cfg("agents.max_fix_rounds", "2"));
const SEVERIDADES_FIX = new Set(
  cfg("agents.fix_severidades", "alta,media")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
if (!Number.isInteger(MAX_RONDAS_FIX) || MAX_RONDAS_FIX < 0) {
  console.error(`✗ agents.max_fix_rounds tiene que ser un entero >= 0.`);
  process.exit(1);
}
for (const s of SEVERIDADES_FIX) {
  if (!["alta", "media", "baja"].includes(s)) {
    console.error(`✗ agents.fix_severidades: "${s}" no es una severidad (alta | media | baja).`);
    process.exit(1);
  }
}

// commands.test tiene que aguantar que alguien le pegue "2>&1 | tail" al
// final: un prompt, un agente que quiere ver solo la cola, un hook. Si el
// comando es "a && b" sin agrupar, el pipe se engancha solo a "b", y con "a"
// en rojo la expansión del prompt aborta con PromptError. Pasó en la primera
// corrida de gymapp (13/09/2026). Chequeo estático, no ejecución: correr la
// suite al arrancar cuesta minutos y el rojo es un estado válido.
const aguantaPipeExterno = (cmd: string): boolean => {
  let profundidad = 0;
  let comilla: string | null = null;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i]!;
    if (comilla) {
      if (c === "\\" && comilla === '"') i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === "'" || c === '"') comilla = c;
    else if (c === "\\") i++;
    else if (c === "(" || c === "{") profundidad++;
    else if (c === ")" || c === "}") profundidad--;
    else if (profundidad === 0) {
      if (c === ";" || c === "\n") return false;
      if (c === "|" && cmd[i + 1] === "|") return false;
      // "&" separa comandos, salvo en redirecciones: 2>&1, &>archivo.
      if (c === "&" && cmd[i - 1] !== ">" && cmd[i - 1] !== "<" && cmd[i + 1] !== ">") {
        return false;
      }
    }
  }
  return true;
};
if (!aguantaPipeExterno(COMANDOS.TEST_COMMAND)) {
  console.error(
    `✗ commands.test no aguanta un pipe externo: "${COMANDOS.TEST_COMMAND}"\n` +
      `  Un "| tail" agregado al final se pegaría solo al último tramo.\n` +
      `  Agrupalo entero, con espacio después del paréntesis: "( ${COMANDOS.TEST_COMMAND} )"`,
  );
  process.exit(1);
}

// Specs que esperan a un humano. Un archivo spec-NNNN.* acá saca a esa spec
// del plan: lo escribe el orquestador cuando algo no se pudo resolver solo
// (hallazgos que sobrevivieron al fixer, rama en rojo, error de pipeline), y
// lo puede crear un humano para abandonar una spec a mano. Borrar el archivo
// la devuelve al pipeline, desde la fase en la que haya quedado la rama.
//
// Sin esto, una spec trabada se replanifica en cada vuelta y quema una
// revisión de opus por vuelta sin cambiar nada.
const DIR_PENDIENTES = ".sandcastle/pendientes";

const tienePendiente = (id: string): boolean =>
  existsSync(DIR_PENDIENTES) &&
  readdirSync(DIR_PENDIENTES).some((f) => f.startsWith(`spec-${id}.`));

const guardarPendiente = (id: string, contenido: Record<string, unknown>): string => {
  mkdirSync(DIR_PENDIENTES, { recursive: true });
  // Se ignora a sí mismo: es estado de esta máquina, y un repo instalado
  // antes de que existiera este directorio no lo tiene en su .gitignore.
  writeFileSync(`${DIR_PENDIENTES}/.gitignore`, "*\n");
  const ruta = `${DIR_PENDIENTES}/spec-${id}.json`;
  writeFileSync(
    ruta,
    JSON.stringify({ spec: id, fecha: new Date().toISOString(), ...contenido }, null, 2) + "\n",
  );
  return ruta;
};

const gitHost = (...args: string[]): string =>
  execFileSync("git", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const commitsAdelante = (rama: string): number => {
  try {
    return Number(gitHost("rev-list", "--count", `${RAMA_BASE}..${rama}`));
  } catch {
    return 0; // la rama no existe todavía
  }
};

const estaMergeada = (rama: string): boolean => {
  try {
    gitHost("merge-base", "--is-ancestor", rama, RAMA_BASE);
    return true;
  } catch {
    return false;
  }
};

const shaDe = (ref: string): string => {
  try {
    return gitHost("rev-parse", "--verify", "--quiet", ref);
  } catch {
    return "";
  }
};

// Comillas de shell para lo que va dentro de un sandbox.exec.
const sh = (s: string): string => `'${s.replace(/'/g, `'\\''`)}'`;

// ---------------------------------------------------------------------------
// Controles por rol. Lo que los prompts dicen "no hagas", chequeado con git
// sobre la rama. Una regla que el agente puede ignorar sin que nada lo note
// no es una compuerta (R3) — y estas cuatro se verifican gratis.
// ---------------------------------------------------------------------------

// Un glob de test_glob a regex, con la semántica de Path.glob que usa
// spec_coverage.py: `**/` es cero o más directorios, `*` no cruza `/`.
const globARegex = (glob: string): RegExp => {
  let r = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!;
    if (c === "*" && glob[i + 1] === "*") {
      i++;
      if (glob[i + 1] === "/") {
        i++;
        r += "(?:.*/)?";
      } else {
        r += ".*";
      }
    } else if (c === "*") r += "[^/]*";
    else if (c === "?") r += "[^/]";
    else r += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${r}$`);
};

const lista = (valor: string): string[] =>
  valor.split(/[\s]+/).map((v) => v.trim()).filter(Boolean);

// Archivo de test = matchea spec_coverage.test_glob, o vive bajo paths.tests
// (fixtures, resources, conftest: no matchean el glob pero son del test-author).
const GLOBS_TEST = lista(cfg("spec_coverage.test_glob")).map(globARegex);
const DIRS_TEST = lista(cfg("paths.tests"));
const DIR_SPECS = cfg("paths.specs", "specs/");

const esDeTest = (archivo: string): boolean =>
  GLOBS_TEST.some((g) => g.test(archivo)) ||
  DIRS_TEST.some((d) => archivo.startsWith(d.endsWith("/") ? d : `${d}/`));

type Cambio = { estado: string; archivo: string };

// `git diff --name-status desde hasta`: A/M/D/R + ruta (la nueva, si es R).
const cambiosEntre = (desde: string, hasta: string): Cambio[] => {
  const salida = gitHost("diff", "--name-status", "--no-renames", desde, hasta);
  if (!salida) return [];
  return salida.split("\n").map((l) => {
    const [estado = "", ...resto] = l.split("\t");
    return { estado, archivo: resto.join("\t") };
  });
};

const baseDe = (rama: string): string => gitHost("merge-base", RAMA_BASE, rama);

// Nadie toca specs/ antes del merge: cambiar el contrato para que el código
// pase es la falla más cara del pipeline y la más silenciosa.
const violacionesSpecs = (rama: string): string[] =>
  cambiosEntre(baseDe(rama), rama)
    .filter((c) => c.archivo.startsWith(DIR_SPECS))
    .map((c) => `${c.estado} ${c.archivo}`);

// El commit de tests del test-author: el último `spec-NNNN: tests` de la rama.
const commitDeTests = (spec: SpecPlan): string => {
  try {
    const log = gitHost("log", "--format=%H %s", `${RAMA_BASE}..${spec.rama}`);
    const linea = log.split("\n").find((l) => l.slice(41).startsWith(`spec-${spec.id}: tests`));
    return linea ? linea.slice(0, 40) : "";
  } catch {
    return "";
  }
};

// ---------------------------------------------------------------------------
// Mediciones. T-08 pedía tiempo, costo y fricción por fase como "el
// entregable real", y nunca quedó escrito. Ahora lo escribe cada corrida.
// ---------------------------------------------------------------------------

const MEDICIONES = ".sandcastle/mediciones.jsonl";

type ConIteraciones = {
  iterations?: readonly { usage?: sandcastle.IterationUsage }[];
};

const medir = async <T,>(
  spec: string,
  fase: string,
  agente: { proveedor: string; modelo: string } | null,
  fn: () => Promise<T>,
): Promise<T> => {
  const inicio = Date.now();
  let ok = true;
  let resultado: T | undefined;
  try {
    resultado = await fn();
    return resultado;
  } catch (e) {
    ok = false;
    throw e;
  } finally {
    const r = resultado as ConIteraciones | undefined;
    const usos = (r?.iterations ?? []).map((i) => i.usage).filter((u) => u !== undefined);
    const suma = (k: keyof sandcastle.IterationUsage) => usos.reduce((t, u) => t + u[k], 0);
    const fila = {
      fecha: new Date(inicio).toISOString(),
      spec,
      fase,
      agente: agente ? `${agente.proveedor}:${agente.modelo}` : null,
      segundos: Math.round((Date.now() - inicio) / 100) / 10,
      iteraciones: r?.iterations?.length ?? null,
      tokens: usos.length
        ? {
            entrada: suma("inputTokens"),
            cache_escritura: suma("cacheCreationInputTokens"),
            cache_lectura: suma("cacheReadInputTokens"),
            salida: suma("outputTokens"),
          }
        : null,
      ok,
    };
    try {
      appendFileSync(MEDICIONES, JSON.stringify(fila) + "\n");
    } catch {
      // Medir nunca tumba una corrida.
    }
  }
};

// Límite de uso del proveedor ("You've hit your session limit"). Llega como
// AgentError del run que lo chocó. El 13/09/2026 en gymapp el test-author lo
// chocó, el orquestador lo contó como una spec fallida más y pasó a la vuelta
// siguiente, donde el planner lo volvió a chocar y el proceso murió con una
// excepción no atrapada. Se corta la corrida entera: nada de lo que sigue
// puede andar hasta que el límite se renueve.
const PATRON_LIMITE = /(session|usage|weekly|rate) limit|limit reached|quota exceeded/i;

const esLimiteDeUso = (e: unknown): boolean =>
  PATRON_LIMITE.test(e instanceof Error ? e.message : String(e));

const cortarPorLimite = (e: unknown): never => {
  const texto = e instanceof Error ? e.message : String(e);
  const linea = texto.split("\n").find((l) => PATRON_LIMITE.test(l))?.trim() ?? texto;
  console.error(
    `\n✗ Límite de uso del proveedor: ${linea}\n` +
      `  Corrida cortada. Las ramas sandcastle/spec-* quedan como están: al volver\n` +
      `  a correr, cada spec se retoma desde la fase en la que quedó.`,
  );
  process.exit(3);
};

// ---------------------------------------------------------------------------
// Contratos entre fases. Son la interfaz tipada del pipeline: si un agente no
// puede producir esto, la corrida se corta en vez de seguir con basura.
// ---------------------------------------------------------------------------

const planSchema = z.object({
  specs: z.array(
    z.object({
      id: z.string(),
      titulo: z.string(),
      rama: z.string(),
      // Dónde retomar si la rama ya existe. El orquestador lo contrasta con
      // la rama real antes de usarlo: ver faseInicial().
      fase: z.enum(["tests", "implement", "review"]).optional(),
    }),
  ),
});

const hallazgoSchema = z.object({
  archivo: z.string(),
  linea: z.number().int().nonnegative(),
  severidad: z.enum(["alta", "media", "baja"]),
  // Un hallazgo vale si cita un AC violado O un escenario de falla concreto.
  // Los dos en null = opinión, y se descarta abajo.
  ac_violado: z.string().nullable(),
  escenario_de_falla: z.string().nullable(),
  afirmacion: z.string(),
});

const revisionSchema = z.object({
  spec: z.string(),
  hallazgos: z.array(hallazgoSchema),
});

type Hallazgo = z.infer<typeof hallazgoSchema>;

// Últimas líneas de un sandbox.exec, con el código de salida adelante. Es lo
// que se inyecta en los prompts como TEST_RESULT / VERIFY_RESULT.
const resumenDeSalida = (r: { exitCode: number; stdout: string; stderr: string }): string => {
  const lineas = `${r.stdout}\n${r.stderr}`.trim().split("\n").slice(-40);
  return [`exit code: ${r.exitCode}`, ...lineas].join("\n");
};

const esAccionable = (h: Hallazgo): boolean =>
  Boolean(h.ac_violado) || Boolean(h.escenario_de_falla);

type SpecPlan = z.infer<typeof planSchema>["specs"][number];
type Fase = "tests" | "implement" | "review";
type SalidaExec = { exitCode: number; stdout: string; stderr: string };
type HallazgoConId = Hallazgo & { id: string };

type Resultado =
  | { spec: SpecPlan; estado: "aprobada"; noBloqueantes: HallazgoConId[] }
  | { spec: SpecPlan; estado: "bloqueada" };

// Lo que devuelve el tramo de tests + implementación: la compuerta, o el
// motivo por el que un control lo frenó antes.
type Tramo =
  | { tipo: "gate"; salida: SalidaExec }
  | { tipo: "humano"; motivo: string; extra?: Record<string, unknown> };

// Tests que escribió el test-author y que después alguien modificó o borró.
const testsDelAutorModificados = (spec: SpecPlan, shaTests = ""): string[] => {
  // En esta pasada se sabe el commit exacto; al retomar, se busca por asunto.
  const sha = shaTests || commitDeTests(spec);
  if (!sha) return [];
  const delAutor = new Set(
    cambiosEntre(baseDe(sha), sha)
      .filter((c) => c.estado !== "D" && esDeTest(c.archivo))
      .map((c) => c.archivo),
  );
  return cambiosEntre(sha, spec.rama)
    .filter((c) => c.estado !== "A" && delAutor.has(c.archivo))
    .map((c) => `${c.estado} ${c.archivo}`);
};

// La fase que dice el planner se contrasta con la rama real. El planner la
// deduce leyendo asuntos de commits; el orquestador la corrige con hechos:
// sin commits no hay nada que retomar, y con commits el test-author ya corrió.
// El otro chequeo ("review" con la rama en rojo) necesita un sandbox y se hace
// en procesarSpec().
const faseInicial = (spec: SpecPlan): Fase => {
  const adelante = commitsAdelante(spec.rama);
  const dicha = spec.fase ?? "tests";
  const real: Fase = adelante === 0 ? "tests" : dicha === "tests" ? "implement" : dicha;
  if (adelante > 0) {
    console.log(
      `  · ${spec.id}: la rama ya tiene ${adelante} commit(s), se retoma desde ${real}` +
        (real !== dicha ? ` (el planner dijo ${dicha})` : "") +
        ".",
    );
  }
  return real;
};

// Un sandbox por tramo, cerrado siempre. No se puede tener uno abierto
// durante toda la spec: sandcastle.run() (el que usa el reviewer, porque
// sandbox.run() ignora `output`) reutiliza el worktree de la rama y al
// terminar lo BORRA si está limpio, así que un sandbox que siguiera abierto
// después de la revisión se quedaría sin directorio. Leído en el código de
// v0.12.0 (cleanupWorktree) el 13/09/2026.
const enSandbox = async <T,>(
  rama: string,
  fn: (sandbox: sandcastle.Sandbox) => Promise<T>,
  baseBranch?: string,
): Promise<T> => {
  const sandbox = await sandcastle.createSandbox({ branch: rama, baseBranch, sandbox: docker(), hooks });
  try {
    return await fn(sandbox);
  } finally {
    await sandbox.close();
  }
};

const logCola = (salida: SalidaExec, lineas = 15) => {
  const todo = `${salida.stdout}\n${salida.stderr}`.trim().split("\n");
  for (const l of todo.slice(-lineas)) console.log(`      ${l}`);
};

const procesarSpec = async (spec: SpecPlan): Promise<Resultado> => {
  const argsBase = {
    ...COMANDOS,
    SPEC_ID: spec.id,
    SPEC_TITULO: spec.titulo,
    BRANCH: spec.rama,
  };

  const paraElHumano = (motivo: string, extra: Record<string, unknown> = {}): Resultado => {
    const ruta = guardarPendiente(spec.id, { rama: spec.rama, motivo, ...extra });
    console.log(`  ✗ ${spec.id}: ${motivo}`);
    console.log(`      Queda para un humano: ${ruta}`);
    return { spec, estado: "bloqueada" };
  };

  let fase = faseInicial(spec);

  // --- 2a/2b. Tests, implementación y compuerta, en un sandbox -------------

  const tramo = await enSandbox(spec.rama, async (sandbox): Promise<Tramo> => {
    if (fase === "review") {
      // Retomar la revisión exige una rama en verde: si quedó en rojo (la
      // corrida murió a mitad del implementer después de un commit), se
      // retoma desde el implementer.
      const g = await medir(spec.id, "verify", null, () => sandbox.exec(COMANDOS.VERIFY_COMMAND));
      if (g.exitCode === 0) return { tipo: "gate", salida: g };
      console.log(`  · ${spec.id}: la rama está en rojo, se retoma desde implement.`);
      fase = "implement";
    }

    let testsRecienEscritos = false;
    let shaTests = "";
    if (fase === "tests") {
      // Tests rojos primero. Separado del implementer a propósito: si el
      // mismo agente escribe el test y el código, el test se adapta al código.
      const tests = await medir(spec.id, "test-author", ROL.testAuthor, () =>
        sandbox.run({
          name: `test-author:${spec.id}`,
          maxIterations: 20,
          agent: AGENTE.testAuthor,
          promptFile: "./.sandcastle/test-prompt.md",
          promptArgs: argsBase,
        }),
      );
      if (tests.commits.length === 0) {
        return { tipo: "humano", motivo: "el test-author no commiteó nada." };
      }
      testsRecienEscritos = true;
      shaTests = tests.commits.at(-1)?.sha ?? "";

      // Control: el test-author solo escribe tests. "Si al terminar hay algo
      // nuevo en el código de producción, fallaste" era una frase del prompt.
      const fuera = cambiosEntre(baseDe(spec.rama), spec.rama).filter((c) => !esDeTest(c.archivo));
      if (fuera.length) {
        return {
          tipo: "humano",
          motivo:
            `el test-author tocó ${fuera.length} archivo(s) que no son de test ` +
            `(ni spec_coverage.test_glob ni paths.tests). No pasa al implementer.`,
          extra: { archivos: fuera.map((c) => `${c.estado} ${c.archivo}`) },
        };
      }
    }

    // La salida de los tests se corre ACÁ con sandbox.exec y entra al prompt
    // como TEST_RESULT, en vez de un !`{{TEST_COMMAND}}` dentro del prompt:
    // sandcastle 0.12.0 corta las expansiones de shell a los 30 s
    // (PROMPT_EXPANSION_TIMEOUT_MS, no configurable) y aborta la fase. exec no
    // tiene ese límite. Encontrado en gymapp el 13/09/2026, donde la suite de
    // Spring Boot pasa los 30 s dentro del sandbox.
    const testsRojos = await medir(spec.id, "tests-rojos", null, () =>
      sandbox.exec(COMANDOS.TEST_COMMAND),
    );

    // Control: tests recién escritos que ya pasan no prueban nada que falte.
    // O la spec ya estaba implementada, o los tests no ejercitan lo que piden
    // los AC. En los dos casos, mandar al implementer es pagar por nada.
    if (testsRecienEscritos && testsRojos.exitCode === 0) {
      return {
        tipo: "humano",
        motivo: "los tests del test-author pasan sin implementación: no prueban lo que falta.",
        extra: { tests: resumenDeSalida(testsRojos) },
      };
    }

    await medir(spec.id, "implementer", ROL.implementer, () =>
      sandbox.run({
        name: `implementer:${spec.id}`,
        maxIterations: 100,
        agent: AGENTE.implementer,
        promptFile: "./.sandcastle/implement-prompt.md",
        promptArgs: { ...argsBase, TEST_RESULT: resumenDeSalida(testsRojos) },
      }),
    );

    // Control: el implementer no modifica ni borra los tests del test-author.
    // Agregar tests propios sí puede. Solo se mira cuando el implementer
    // corrió en esta pasada: al retomar desde review, los cambios del fixer
    // sobre el test de un ac_violado son legítimos.
    const tocados = testsDelAutorModificados(spec, shaTests);
    if (tocados.length) {
      return {
        tipo: "humano",
        motivo:
          `el implementer modificó ${tocados.length} test(s) del test-author. ` +
          `Un test que molesta es un hallazgo, no un obstáculo.`,
        extra: { archivos: tocados },
      };
    }

    // Compuerta del orquestador. Con Claude la G2 la aplica hook_stop.sh,
    // pero tiene guarda anti-bucle (al segundo intento deja cerrar en rojo),
    // y pi/codex no corren hooks de Claude Code en absoluto. Correr verify.sh
    // acá, fuera del agente, es lo único que no depende del proveedor: una
    // rama en rojo no llega al reviewer, que es el agente caro.
    const g = await medir(spec.id, "verify", null, () => sandbox.exec(COMANDOS.VERIFY_COMMAND));
    return { tipo: "gate", salida: g };
  });

  if (tramo.tipo === "humano") {
    return paraElHumano(tramo.motivo, tramo.extra);
  }

  const specsTocadas = violacionesSpecs(spec.rama);
  if (specsTocadas.length) {
    return paraElHumano("la rama modifica specs/. El contrato no se cambia para que el código pase.", {
      archivos: specsTocadas,
    });
  }

  const gate = tramo.salida;
  if (gate.exitCode !== 0) {
    logCola(gate);
    return paraElHumano(
      `verify.sh falló después del implementer (${ROL.implementer.proveedor}). No pasa a revisión.`,
      { verify: resumenDeSalida(gate) },
    );
  }

  // --- 2c/2d. Revisión y vuelta de corrección ------------------------------

  let gateActual: SalidaExec = gate;
  let aCorregir: HallazgoConId[] = [];
  let reales: HallazgoConId[] = [];

  for (let ronda = 0; ; ronda++) {
    if (gateActual.exitCode === 0) {
      // Revisión read-only.
      //
      // No escribe: permissionMode: "plan" en AGENTE.reviewer lo aplica a
      // nivel del binario (--permission-mode plan), y maxIterations: 1 más el
      // prompt lo refuerzan.
      //
      // sandcastle.run() de nivel superior, NO sandbox.run(): confirmado el
      // 09/09/2026 que sandbox.run() ignora por completo la opción `output`
      // — nunca llama a extractStructuredOutput, así que revision.output daba
      // siempre undefined sin tirar error (2 specs seguidas lo confirmaron:
      // el reviewer emitía hallazgos "alta" reales y el merge igual seguía de
      // largo). branchStrategy "branch" reutiliza la rama que ya dejaron
      // test-author/implementer/fixer, sin crear una nueva.
      const antesDelReviewer = shaDe(spec.rama);
      const revision = await medir(spec.id, `reviewer-${ronda + 1}`, ROL.reviewer, () =>
        sandcastle.run({
          hooks,
          sandbox: docker(),
          branchStrategy: { type: "branch", branch: spec.rama },
          name: `reviewer:${spec.id}`,
          maxIterations: 1,
          agent: AGENTE.reviewer,
          promptFile: "./.sandcastle/review-prompt.md",
          // Misma razón que TEST_RESULT: la compuerta ya corrió, se reusa su
          // salida en vez de volver a correrla dentro del prompt. En gymapp
          // verify.sh tarda ~50 s y el reviewer moría por
          // PromptExpansionTimeoutError aunque la rama estuviera en verde.
          promptArgs: { ...argsBase, VERIFY_RESULT: resumenDeSalida(gateActual) },
          output: sandcastle.Output.object({ tag: "revision", schema: revisionSchema }),
        }),
      );

      // Control: el reviewer no escribe. permissionMode "plan" y
      // hook_readonly_guard.sh cubren Edit/Write, pero no un `git commit` o un
      // `sed -i` por Bash, ni un repo con los hooks viejos (los dos pilotos no
      // tenían el guard instalado). Lo que no falla nunca: la rama tiene que
      // quedar en el mismo commit.
      if (shaDe(spec.rama) !== antesDelReviewer) {
        return paraElHumano(
          "el reviewer commiteó en la rama: violó el read-only. Revisá sus commits antes de seguir.",
          { antes: antesDelReviewer, despues: shaDe(spec.rama) },
        );
      }

      // Log incondicional: el 08/09/2026 un merge pasó pese a 2 hallazgos
      // "alta" del reviewer sin que se pudiera diagnosticar por qué graves
      // dio 0 en el orquestador. Esta línea existe para que la próxima vez
      // que pase se note en el momento.
      console.log(
        `  · ${spec.id}: revisión ${ronda + 1} devolvió ` +
          `${revision.output?.hallazgos?.length ?? "null"} hallazgo(s)`,
      );

      // Sin output no hay revisión, y "sin revisión" no puede leerse como
      // "sin hallazgos": es exactamente el bug del 08/09.
      if (!revision.output) {
        return paraElHumano("el reviewer no devolvió una revisión válida.");
      }

      // Tipado explícito: el output de Output.object llega sin inferir.
      const todos: Hallazgo[] = revision.output.hallazgos;
      const opinion = todos.filter((h) => !esAccionable(h));
      if (opinion.length) {
        console.log(
          `  · ${spec.id}: ${opinion.length} hallazgo(s) de opinión descartados ` +
            `(sin AC violado ni escenario de falla).`,
        );
      }

      // Id estable por revisión: el fixer lo cita en el test y en el commit,
      // y es lo que permite rastrear un arreglo hasta el hallazgo que lo pidió.
      reales = todos
        .filter(esAccionable)
        .map((h, i) => ({ ...h, id: `H-${spec.id}-${ronda + 1}-${String(i + 1).padStart(2, "0")}` }));
      aCorregir = reales.filter((h) => SEVERIDADES_FIX.has(h.severidad));
      const graves = reales.filter((h) => h.severidad === "alta");

      if (aCorregir.length === 0) {
        if (graves.length) {
          // Solo pasa si `alta` quedó afuera de fix_severidades.
          return paraElHumano(`${graves.length} hallazgo(s) alta y el fixer no los toma.`, {
            hallazgos: graves,
          });
        }
        return { spec, estado: "aprobada", noBloqueantes: reales };
      }
    }

    // --- ¿Queda otra vuelta? ------------------------------------------------

    const graves = reales.filter((h) => h.severidad === "alta");

    if (ronda >= MAX_RONDAS_FIX) {
      if (gateActual.exitCode !== 0) {
        logCola(gateActual);
        return paraElHumano(
          `verify.sh sigue en rojo después de ${MAX_RONDAS_FIX} vuelta(s) del fixer.`,
          { hallazgos: aCorregir, verify: resumenDeSalida(gateActual) },
        );
      }
      if (graves.length) {
        for (const h of graves) {
          console.log(`      ${h.id} ${h.archivo}:${h.linea} [${h.ac_violado ?? "sin AC"}] ${h.afirmacion}`);
        }
        return paraElHumano(
          `${graves.length} hallazgo(s) alta después de ${MAX_RONDAS_FIX} vuelta(s) del fixer. No se mergea.`,
          { hallazgos: reales },
        );
      }
      // Solo quedan hallazgos que no bloquean: se mergea y quedan en el log.
      return { spec, estado: "aprobada", noBloqueantes: reales };
    }

    // --- Fixer ---------------------------------------------------------------

    console.log(
      `  ↻ ${spec.id}: vuelta ${ronda + 1}/${MAX_RONDAS_FIX} del fixer, ` +
        `${aCorregir.length} hallazgo(s)` +
        (gateActual.exitCode !== 0 ? ", verify.sh en rojo" : "") +
        ".",
    );

    gateActual = await enSandbox(spec.rama, async (sandbox) => {
      await medir(spec.id, `fixer-${ronda + 1}`, ROL.implementer, () =>
        sandbox.run({
          name: `fixer:${spec.id}`,
          maxIterations: 50,
          agent: AGENTE.implementer,
          promptFile: "./.sandcastle/fix-prompt.md",
          promptArgs: {
            ...argsBase,
            HALLAZGOS: JSON.stringify(aCorregir, null, 2),
            VERIFY_RESULT: resumenDeSalida(gateActual),
            RONDA: `${ronda + 1} de ${MAX_RONDAS_FIX}`,
          },
        }),
      );
      return medir(spec.id, "verify", null, () => sandbox.exec(COMANDOS.VERIFY_COMMAND));
    });

    const specsDelFixer = violacionesSpecs(spec.rama);
    if (specsDelFixer.length) {
      return paraElHumano("el fixer modificó specs/. El contrato no se cambia para que el código pase.", {
        archivos: specsDelFixer,
      });
    }
  }
};

// ---------------------------------------------------------------------------
// Merge determinista
//
// Antes lo hacía un agente (sonnet, maxIterations: 1) directamente sobre la
// rama base del host, con un prompt que le pedía releer los logs del reviewer
// por desconfianza. Mergear, correr la compuerta y revertir si falla es
// mecánico: lo hace el orquestador, en una rama de integración, y la base se
// mueve con un fast-forward solo al final. El agente entra únicamente cuando
// git no puede resolver solo — un conflicto.
// ---------------------------------------------------------------------------

type ResultadoMerge = { fusionadas: string[]; rechazadas: [string, string][] };

const mergear = async (aprobadas: SpecPlan[]): Promise<ResultadoMerge> => {
  const resultado: ResultadoMerge = { fusionadas: [], rechazadas: [] };
  const integracion = `sandcastle/integracion-${Date.now()}`;

  await enSandbox(
    integracion,
    async (sandbox) => {
      const ex = (cmd: string) => sandbox.exec(cmd);

      for (const spec of aprobadas) {
        const antes = (await ex("git rev-parse HEAD")).stdout.trim();
        const volver = async () => {
          await ex("git merge --abort 2>/dev/null; true");
          await ex(`git reset --hard ${antes}`);
        };

        const m = await ex(
          `git merge --no-ff ${sh(spec.rama)} -m ${sh(`Merge ${spec.rama}: spec ${spec.id} — ${spec.titulo}`)}`,
        );
        if (m.exitCode !== 0) {
          const conflicto = (await ex("git rev-parse -q --verify MERGE_HEAD")).exitCode === 0;
          if (!conflicto) {
            await volver();
            resultado.rechazadas.push([spec.id, `git merge falló: ${resumenDeSalida(m)}`]);
            continue;
          }
          console.log(`  · ${spec.id}: conflicto al mergear, entra el merger.`);
          await medir(spec.id, "merger", ROL.merger, () =>
            sandbox.run({
              name: `merger:${spec.id}`,
              maxIterations: 10,
              agent: AGENTE.merger,
              promptFile: "./.sandcastle/merge-prompt.md",
              promptArgs: {
                ...COMANDOS,
                SPEC_ID: spec.id,
                SPEC_TITULO: spec.titulo,
                BRANCH: spec.rama,
                CONFLICTO: resumenDeSalida(m),
              },
            }),
          );
          const sigue = (await ex("git rev-parse -q --verify MERGE_HEAD")).exitCode === 0;
          const limpio = (await ex("git diff --quiet HEAD")).exitCode === 0;
          if (sigue || !limpio) {
            await volver();
            resultado.rechazadas.push([spec.id, "el merger no resolvió el conflicto."]);
            continue;
          }
        }

        const g = await medir(spec.id, "verify-merge", null, () => ex(COMANDOS.VERIFY_COMMAND));
        if (g.exitCode !== 0) {
          logCola(g);
          await volver();
          resultado.rechazadas.push([
            spec.id,
            `verify.sh en rojo después de mergearla sobre las anteriores: ${resumenDeSalida(g)}`,
          ]);
          continue;
        }

        // El único cambio a specs/ del pipeline, y es sed: una línea del
        // frontmatter, sin un agente de por medio.
        const marca = await ex(
          `f=$(ls ${sh(DIR_SPECS)}${spec.id}-*.md 2>/dev/null | grep -v '\\.tasks\\.md$' | head -1) && ` +
            `[ -n "$f" ] && sed -i '0,/^estado:/{s/^\\(estado:[[:space:]]*\\)aprobada/\\1implementada/}' "$f" && ` +
            `git add "$f" && git commit -q -m ${sh(`spec-${spec.id}: implementada`)}`,
        );
        if (marca.exitCode !== 0) {
          console.log(`  ⚠ ${spec.id}: mergeada, pero no pude pasar la spec a implementada.`);
        }
        resultado.fusionadas.push(spec.id);
      }
    },
    RAMA_BASE,
  );

  if (resultado.fusionadas.length === 0) {
    try {
      gitHost("branch", "-D", integracion);
    } catch {
      // Si quedó un worktree colgado, la rama queda; no es grave.
    }
    return resultado;
  }

  // Fast-forward de la base en el host. Si alguien commiteó en la base
  // durante la corrida, o el árbol del host tiene cambios que chocan, no se
  // fuerza nada: la rama de integración queda para el humano.
  try {
    if (gitHost("branch", "--show-current") !== RAMA_BASE) throw new Error("el host cambió de rama");
    gitHost("merge", "--ff-only", integracion);
    gitHost("branch", "-D", integracion);
  } catch (e) {
    const motivo = e instanceof Error ? e.message.split("\n")[0] : String(e);
    console.error(
      `\n✗ No pude avanzar ${RAMA_BASE} a ${integracion} con fast-forward (${motivo}).\n` +
        `  Las specs ${resultado.fusionadas.join(", ")} están mergeadas y verificadas ahí.\n` +
        `  git merge ${integracion}`,
    );
  }
  return resultado;
};

// ---------------------------------------------------------------------------
// Bucle principal
// ---------------------------------------------------------------------------

console.log(`spec-driven — rama base: ${RAMA_BASE}`);
console.log(`tests: ${COMANDOS.TEST_COMMAND}`);
for (const a of Object.values(ROL)) {
  console.log(`  ${a.rol.padEnd(12)} ${a.proveedor}:${a.modelo}`);
}
console.log(
  `  ${"fixer".padEnd(12)} = implementer, hasta ${MAX_RONDAS_FIX} vuelta(s) ` +
    `sobre: ${[...SEVERIDADES_FIX].join(", ") || "(nada)"}`,
);

try {
  for (let vuelta = 1; vuelta <= MAX_ITERACIONES; vuelta++) {
    console.log(`\n=== Vuelta ${vuelta}/${MAX_ITERACIONES} ===\n`);

    // --- Fase 1: Plan ------------------------------------------------------

    const plan = await medir("-", "planner", ROL.planner, () =>
      sandcastle.run({
        hooks,
        sandbox: docker(),
        name: "planner",
        maxIterations: 1, // requerido por Output.object
        agent: AGENTE.planner,
        promptFile: "./.sandcastle/plan-prompt.md",
        // TARGET_BRANCH ya no se pasa: es built-in desde 0.12.0 (ver RAMA_ACTUAL
        // arriba) y pasarlo a mano tira PromptError.
        output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
      }),
    );

    // El prompt ya le muestra los pendientes al planner; esto es por si igual
    // elige uno. Una spec en pendientes replanificada quema una revisión por
    // vuelta sin cambiar nada.
    const specs = plan.output.specs.filter((s: SpecPlan) => {
      if (!tienePendiente(s.id)) return true;
      console.log(`  · ${s.id}: tiene un archivo en ${DIR_PENDIENTES}/, se saltea.`);
      return false;
    });

    if (specs.length === 0) {
      console.log("No hay specs aprobadas para trabajar. Listo.");
      break;
    }

    console.log(`${specs.length} spec(s) para trabajar en paralelo:`);
    for (const s of specs) console.log(`  ${s.id}: ${s.titulo} → ${s.rama}`);

    // --- Fase 2: por spec, en paralelo ------------------------------------

    const resultados = await Promise.allSettled(specs.map(procesarSpec));

    // Un límite de uso corta todo antes de mirar lo demás: el merger también
    // es un agente y lo va a chocar. Las specs que llegaron a aprobarse en
    // esta vuelta se retoman desde la revisión en la próxima corrida.
    for (const r of resultados) {
      if (r.status === "rejected" && esLimiteDeUso(r.reason)) cortarPorLimite(r.reason);
    }

    // --- Evaluación --------------------------------------------------------

    const aprobadas: SpecPlan[] = [];

    for (const [i, r] of resultados.entries()) {
      const spec = specs[i]!;

      if (r.status === "rejected") {
        // Un error de pipeline (PromptError, timeout de hook, docker) no se
        // arregla replanificando: se repetiría igual en la vuelta siguiente.
        const motivo = r.reason instanceof Error ? r.reason.message : String(r.reason);
        const ruta = guardarPendiente(spec.id, { rama: spec.rama, motivo: `error: ${motivo}` });
        console.error(`  ✗ ${spec.id} falló: ${motivo}`);
        console.error(`      Queda para un humano: ${ruta}`);
        continue;
      }
      if (r.value.estado === "bloqueada") continue; // ya se logueó y se guardó

      const { noBloqueantes } = r.value;
      if (noBloqueantes.length) {
        console.log(`  ⚠ ${spec.id}: ${noBloqueantes.length} hallazgo(s) no bloqueante(s) sin corregir:`);
        for (const h of noBloqueantes) {
          console.log(`      ${h.id} [${h.severidad}] ${h.archivo}:${h.linea} ${h.afirmacion}`);
        }
      }
      console.log(`  ✓ ${spec.id}: lista para mergear.`);
      aprobadas.push(spec);
    }

    if (aprobadas.length === 0) {
      console.log("\nNinguna rama pasó la revisión. Nada que mergear.");
      continue;
    }

    // --- Fase 3: Merge -----------------------------------------------------

    const mergeadas = await mergear(aprobadas);

    // Lo que no entró queda marcado: sin esto, la vuelta siguiente la retoma
    // desde la revisión, la aprueba otra vez y el merge la vuelve a rechazar.
    // Incluye las que se mergearon en la integración pero la base no avanzó.
    const noEntraron = [
      ...mergeadas.rechazadas,
      ...aprobadas
        .filter((s) => mergeadas.fusionadas.includes(s.id) && !estaMergeada(s.rama))
        .map((s): [string, string] => [s.id, `mergeada en la integración, pero ${RAMA_BASE} no avanzó`]),
    ];
    for (const [id, motivo] of noEntraron) {
      const spec = aprobadas.find((s) => s.id === id)!;
      const ruta = guardarPendiente(id, { rama: spec.rama, motivo });
      console.log(`  ✗ ${id}: no entró a ${RAMA_BASE} — ${motivo}\n      Queda para un humano: ${ruta}`);
    }

    console.log(`\n${aprobadas.filter((s) => estaMergeada(s.rama)).length} rama(s) mergeada(s).`);
  }
} catch (e) {
  if (esLimiteDeUso(e)) cortarPorLimite(e);
  throw e;
}

console.log("\nListo.");
