import { run, interactive, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";
import fs from "node:fs";
import path from "node:path";

// Cargar automáticamente variables de entorno desde .sandcastle/.env
try {
  const envPath = path.resolve(".sandcastle/.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  }
} catch (e) {
  // Ignorar si no existe
}

async function main() {
  const isInteractive = process.argv.includes("--interactive") || process.argv.includes("-i");
  const model = process.env.MODEL || "gemini-3.6-flash";
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";

  console.log(`🚀 Iniciando Sandcastle con Pi (Modelo: ${model}, Modo: ${isInteractive ? "interactivo" : "batch"})...`);

  const sandboxEnv = {
    JAVA_HOME: "/home/agustin_dev/.sdkman/candidates/java/21.0.2-tem",
    GEMINI_API_KEY: geminiKey,
    ANTHROPIC_API_KEY: anthropicKey,
    OPENAI_API_KEY: openaiKey,
  };

  if (isInteractive) {
    const result = await interactive({
      name: "gymania-os-completion",
      agent: pi(model, { env: sandboxEnv }),
      sandbox: noSandbox(),
      promptFile: ".sandcastle/prompt.md",
      branchStrategy: {
        type: "branch",
        branch: "feature/gym-completion",
      },
    });

    console.log("✅ Sesión interactiva finalizada.");
    console.log("Committed SHAs:", result.commits.map((c) => c.sha));
  } else {
    const result = await run({
      name: "gymania-os-completion",
      agent: pi(model, { env: sandboxEnv }),
      sandbox: noSandbox(),
      promptFile: ".sandcastle/prompt.md",
      maxIterations: 10,
      completionSignal: "<promise>COMPLETE_TASK</promise>",
      branchStrategy: {
        type: "branch",
        branch: "feature/gym-completion",
      },
    });

    console.log("✅ Bucle agéntico finalizado.");
    console.log("Committed SHAs:", result.commits.map((c) => c.sha));
  }
}

main().catch((err) => {
  console.error("❌ Error durante la ejecución de Sandcastle:", err);
  process.exit(1);
});