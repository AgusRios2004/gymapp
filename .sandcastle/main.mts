// spec-driven — el rol del harness de commons.
//
// A diferencia de los roles de upstream, este no toma issues sueltas: toma
// SPECS APROBADAS de specs/ y ejecuta el pipeline completo del harness.
//
//   Fase 1 (Plan)      opus, 1 iteración. Lee las specs en estado `aprobada`
//                      que todavía no están implementadas, arma el grafo de
//                      dependencias y emite <plan> JSON validado con Zod.
//                      Ramas deterministas: sandcastle/spec-NNNN.
//
//   Fase 2 (por spec)  En un sandbox por rama, en secuencia:
//                        test-author  sonnet — tests rojos citando cada AC-ID
//                        implementer  sonnet — los pone en verde, RGR
//                        verify.sh    lo corre el orquestador, no el agente
//                        reviewer     opus, 1 iteración, SIN escribir —
//                                     emite JSON tipado con los hallazgos
//                      Las specs corren en paralelo entre sí.
//
//   Fase 3 (Merge)     sonnet. Fusiona SOLO las ramas cuya revisión no dejó
//                      hallazgos de severidad alta.
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
//
// Uso:
//   npx tsx .sandcastle/main.mts
//
// Requiere el harness instalado en el repo (commons/harness/install.sh).

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { execFileSync } from "node:child_process";
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
  testAuthor: crearAgente(ROL.testAuthor),
  implementer: crearAgente(ROL.implementer),
  // permissionMode: "plan" — verificado 07/09/2026 (v0.12.0 instalada): es el
  // único lever real de sandcastle para esto, mapea al --permission-mode de
  // Claude Code y reemplaza el --dangerously-skip-permissions por defecto.
  // No hay allowedTools/disallowedTools en RunOptions. Sube la garantía de
  // "no escribe" de blanda (solo el prompt) a dura (el binario lo aplica).
  // El reviewer es read-only: si el implementer dejó un AC sin test, su trabajo
  // es EMITIR ese hallazgo, no quedar bloqueado por él sin poder arreglarlo.
  // El gate de specs sobre la rama lo sigue aplicando el merger.
  reviewer: sandcastle.claudeCode(ROL.reviewer.modelo, {
    permissionMode: "plan",
    ...SIN_GATE_DE_SPECS,
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

const esAccionable = (h: Hallazgo): boolean =>
  Boolean(h.ac_violado) || Boolean(h.escenario_de_falla);

// ---------------------------------------------------------------------------
// Bucle principal
// ---------------------------------------------------------------------------

console.log(`spec-driven — rama base: ${RAMA_BASE}`);
console.log(`tests: ${COMANDOS.TEST_COMMAND}`);
for (const a of Object.values(ROL)) {
  console.log(`  ${a.rol.padEnd(12)} ${a.proveedor}:${a.modelo}`);
}

for (let vuelta = 1; vuelta <= MAX_ITERACIONES; vuelta++) {
  console.log(`\n=== Vuelta ${vuelta}/${MAX_ITERACIONES} ===\n`);

  // --- Fase 1: Plan --------------------------------------------------------

  const plan = await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: "planner",
    maxIterations: 1, // requerido por Output.object
    agent: AGENTE.planner,
    promptFile: "./.sandcastle/plan-prompt.md",
    // TARGET_BRANCH ya no se pasa: es built-in desde 0.12.0 (ver RAMA_ACTUAL
    // arriba) y pasarlo a mano tira PromptError.
    output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
  });

  const specs = plan.output.specs;

  if (specs.length === 0) {
    console.log("No hay specs aprobadas sin implementar. Listo.");
    break;
  }

  console.log(`${specs.length} spec(s) para trabajar en paralelo:`);
  for (const s of specs) console.log(`  ${s.id}: ${s.titulo} → ${s.rama}`);

  // --- Fase 2: por spec, en paralelo --------------------------------------

  const resultados = await Promise.allSettled(
    specs.map(async (spec) => {
      const sandbox = await sandcastle.createSandbox({
        branch: spec.rama,
        sandbox: docker(),
        hooks,
      });

      const argsBase = {
        ...COMANDOS,
        SPEC_ID: spec.id,
        SPEC_TITULO: spec.titulo,
        BRANCH: spec.rama,
      };

      try {
        // 2a. Tests rojos primero. Separado del implementer a propósito: si el
        // mismo agente escribe el test y el código, el test se adapta al código.
        const tests = await sandbox.run({
          name: `test-author:${spec.id}`,
          maxIterations: 20,
          agent: AGENTE.testAuthor,
          promptFile: "./.sandcastle/test-prompt.md",
          promptArgs: argsBase,
        });

        if (tests.commits.length === 0) {
          console.log(`  · ${spec.id}: el test-author no commiteó nada. Se salta.`);
          return { spec, commits: [], revision: null, bloqueada: true };
        }

        // 2b. Verde.
        const impl = await sandbox.run({
          name: `implementer:${spec.id}`,
          maxIterations: 100,
          agent: AGENTE.implementer,
          promptFile: "./.sandcastle/implement-prompt.md",
          promptArgs: argsBase,
        });

        // 2b'. Compuerta del orquestador. Con Claude la G2 la aplica
        // hook_stop.sh, pero tiene guarda anti-bucle (al segundo intento deja
        // cerrar en rojo), y pi/codex no corren hooks de Claude Code en
        // absoluto. Correr verify.sh acá, fuera del agente, es lo único que no
        // depende del proveedor: una rama en rojo no llega al reviewer, que es
        // el agente caro.
        const gate = await sandbox.exec(COMANDOS.VERIFY_COMMAND);
        if (gate.exitCode !== 0) {
          const salida = `${gate.stdout}\n${gate.stderr}`.trim().split("\n");
          console.log(
            `  ✗ ${spec.id}: verify.sh falló después del implementer ` +
              `(${ROL.implementer.proveedor}). No pasa a revisión.`,
          );
          for (const l of salida.slice(-15)) console.log(`      ${l}`);
          return {
            spec,
            commits: [...tests.commits, ...impl.commits],
            revision: null,
            bloqueada: true,
          };
        }

        // 2c. Revisión read-only.
        //
        // No escribe: permissionMode: "plan" en AGENTE.reviewer lo aplica a
        // nivel del binario (--permission-mode plan), y maxIterations: 1 más
        // el prompt lo refuerzan.
        //
        // sandcastle.run() de nivel superior, NO sandbox.run(): confirmado
        // el 09/09/2026 que sandbox.run() (el handle de createSandbox, el
        // que usan test-author/implementer arriba) ignora por completo la
        // opción `output` — nunca llama a extractStructuredOutput, así que
        // revision.output daba siempre undefined sin tirar error, pasara lo
        // que pasara en la revisión (2 specs seguidas lo confirmaron: el
        // reviewer emitía hallazgos "alta" reales y el merge igual seguía
        // de largo). branchStrategy "branch" reutiliza la rama que ya
        // dejaron test-author/implementer, sin crear una nueva.
        const revision = await sandcastle.run({
          hooks,
          sandbox: docker(),
          branchStrategy: { type: "branch", branch: spec.rama },
          name: `reviewer:${spec.id}`,
          maxIterations: 1,
          agent: AGENTE.reviewer,
          promptFile: "./.sandcastle/review-prompt.md",
          promptArgs: argsBase,
          output: sandcastle.Output.object({
            tag: "revision",
            schema: revisionSchema,
          }),
        });

        // Log incondicional: el 08/09/2026 un merge pasó pese a 2 hallazgos
        // "alta" del reviewer sin que se pudiera diagnosticar por qué graves
        // dio 0 en el orquestador — el JSON emitido y el schema estaban bien
        // (verificado aparte, fuera del pipeline). Esta línea existe para que
        // la próxima vez que pase se note en el momento, no se descubra
        // leyendo el log del reviewer a mano después del merge.
        console.log(
          `  · ${spec.id}: revisor devolvió ${revision.output?.hallazgos?.length ?? "null"} hallazgo(s)`,
        );

        return {
          spec,
          commits: [...tests.commits, ...impl.commits],
          revision: revision.output,
          bloqueada: false,
        };
      } finally {
        await sandbox.close();
      }
    }),
  );

  // --- Evaluación de las revisiones ---------------------------------------

  const aprobadas: typeof specs = [];

  for (const [i, r] of resultados.entries()) {
    const spec = specs[i]!;

    if (r.status === "rejected") {
      console.error(`  ✗ ${spec.id} falló: ${r.reason}`);
      continue;
    }
    if (r.value.bloqueada) continue; // el motivo ya se logueó en la fase 2
    if (r.value.commits.length === 0) {
      console.log(`  · ${spec.id}: sin commits, no hay nada que mergear.`);
      continue;
    }

    const todos = r.value.revision?.hallazgos ?? [];
    const opinion = todos.filter((h) => !esAccionable(h));
    const reales = todos.filter(esAccionable);
    const graves = reales.filter((h) => h.severidad === "alta");

    if (opinion.length) {
      console.log(
        `  · ${spec.id}: ${opinion.length} hallazgo(s) de opinión descartados ` +
          `(sin AC violado ni escenario de falla).`,
      );
    }

    if (graves.length) {
      console.log(`  ✗ ${spec.id}: ${graves.length} hallazgo(s) grave(s). No se mergea.`);
      for (const h of graves) {
        console.log(
          `      ${h.archivo}:${h.linea} [${h.ac_violado ?? "sin AC"}] ${h.afirmacion}`,
        );
      }
      continue;
    }

    if (reales.length) {
      console.log(`  ⚠ ${spec.id}: ${reales.length} hallazgo(s) no bloqueante(s).`);
    }
    console.log(`  ✓ ${spec.id}: lista para mergear.`);
    aprobadas.push(spec);
  }

  if (aprobadas.length === 0) {
    console.log("\nNinguna rama pasó la revisión. Nada que mergear.");
    continue;
  }

  // --- Fase 3: Merge -------------------------------------------------------

  await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: "merger",
    maxIterations: 1,
    agent: AGENTE.merger,
    promptFile: "./.sandcastle/merge-prompt.md",
    promptArgs: {
      ...COMANDOS,
      RAMAS: aprobadas.map((s) => `- ${s.rama}`).join("\n"),
      SPECS: aprobadas.map((s) => `- ${s.id}: ${s.titulo}`).join("\n"),
    },
  });

  console.log(`\n${aprobadas.length} rama(s) mergeada(s).`);
}

console.log("\nListo.");
