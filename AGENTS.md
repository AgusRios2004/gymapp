# AGENTS.md

GymApp: sistema de gestión de gimnasio (admin, entrenador, alumno). Monorepo con
backend Spring Boot en `gymapp-back/` y frontend React en `gym-frontend/`.

Las reglas del proyecto (tema visual, capa actual, convenciones) están en
[`CLAUDE.md`](./CLAUDE.md). Este archivo no las repite.

## Comandos

Salen de `harness.config.yml` — esa es la fuente. Lo que corre la compuerta:

```bash
bash .harness/scripts/verify.sh              # lint + typecheck + tests + specs
bash .harness/scripts/verify.sh --file RUTA  # rápido: lint de un archivo
```

## Límites duros

- No editar `.env`, `.sandcastle/.env` ni `harness.config.yml` para que algo
  pase. Las claves no se leen ni se imprimen.
- No correr los tests del backend contra datos que importen: hoy
  `GymappApplicationTests` levanta el contexto completo contra la MySQL del
  `.env`, y los `DataLoader` escriben en esa base.
- No reintroducir dark mode ni amber como marca (ADR-0001, ADR-0002).
- No escribir código de implementación sin una spec aprobada en `specs/`.
- No cambiar una spec para que el código pase. Si la spec está mal, se reporta.

## Dónde buscar

| Necesitás saber | Leé |
|:---|:---|
| Índice de toda la documentación | `docs/SITEMAP.md` |
| Qué se construye y en qué orden | `docs/ROADMAP.md` |
| Por qué se decidió X | `docs/adr/` |
| Qué entra en el alcance | `docs/prd/` |
| Qué toca en el sprint | `docs/sprints/` |
| Cómo se ve la UI | `docs/DESIGN_SYSTEM.md` |
| Reglas de backend / frontend | `gymapp-back/GEMINI.md`, `gym-frontend/GEMINI.md` |
| Qué se está construyendo ahora | `specs/` |

No copiar el contenido de esos documentos acá. Se leen cuando hacen falta.

## Flujo

1. Spec aprobada en `specs/` antes de código.
2. Test rojo antes de implementación; cada test cita su `AC-ID`.
3. Una tarea no se cierra con el suite en rojo.
4. Una tarea = un diff. Lo que se ve de paso se anota, no se arregla.
