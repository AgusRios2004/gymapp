# CLAUDE.md

Pautas de conducta para reducir los errores típicos de un LLM escribiendo código. Aplican a todo el
repositorio: `gymapp-back/` (Spring Boot) y `gym-frontend/` (React + Vite).

**Tradeoff:** estas pautas priorizan cautela sobre velocidad. Para tareas triviales, usá criterio.

> **📌 Contexto del proyecto (leer primero):** `README.md` tiene el stack y el arranque;
> [`docs/back.md`](docs/back.md) y [`docs/front.md`](docs/front.md) documentan cada punta;
> [`docs/notes/`](docs/notes/) tiene el roadmap, la estrategia de infraestructura y las mejoras
> pendientes relevadas. Son fotos del momento en que se escribieron: verificá contra el código
> actual antes de afirmar comportamiento.
>
> **📂 Ley de cada subproyecto:** [`gymapp-back/CLAUDE.md`](gymapp-back/CLAUDE.md) y
> [`gym-frontend/CLAUDE.md`](gym-frontend/CLAUDE.md). Leé el que corresponda antes de tocar código
> de esa punta.

## 1. Think Before Coding

**No asumas. No escondas la confusión. Explicitá los tradeoffs.**

Antes de implementar:
- Declará tus supuestos. Si hay incertidumbre, preguntá.
- Si hay varias interpretaciones posibles, presentalas — no elijas en silencio.
- Si existe un enfoque más simple, decilo. Discutí cuando corresponda.
- Si algo no está claro, pará. Nombrá qué te confunde. Preguntá.

## 2. Simplicity First

**El mínimo código que resuelve el problema. Nada especulativo.**

- Ninguna funcionalidad más allá de lo que se pidió.
- Ninguna abstracción para código de un solo uso.
- Ninguna "flexibilidad" ni "configurabilidad" que no se haya pedido.
- Ningún manejo de errores para escenarios imposibles.
- Si escribís 200 líneas y podían ser 50, reescribilo.

Preguntate: "¿un senior diría que esto está sobrecomplicado?" Si la respuesta es sí, simplificá.

## 3. Surgical Changes

**Tocá solo lo que tenés que tocar. Limpiá solo tu propio desorden.**

Al editar código existente:
- No "mejores" código, comentarios ni formato adyacente.
- No refactorices lo que no está roto.
- Respetá el estilo existente, aunque vos lo harías distinto.
- Si ves código muerto no relacionado, mencionalo — no lo borres.

Cuando tus cambios dejan huérfanos:
- Sacá los imports/variables/métodos que **tus** cambios dejaron sin uso.
- No borres código muerto preexistente salvo que te lo pidan.

La prueba: cada línea cambiada tiene que poder trazarse al pedido del usuario.

## 4. Goal-Driven Execution

**Definí criterios de éxito. Iterá hasta verificarlos.**

Convertí las tareas en objetivos verificables:
- "Agregar validación" → "Escribir tests de inputs inválidos y hacerlos pasar"
- "Arreglar el bug" → "Escribir un test que lo reproduzca y hacerlo pasar"
- "Refactorizar X" → "Asegurar que los tests pasan antes y después"

Para tareas de varios pasos, declará un plan breve:
```
1. [Paso] → verifica: [chequeo]
2. [Paso] → verifica: [chequeo]
3. [Paso] → verifica: [chequeo]
```

Un criterio de éxito fuerte te permite iterar solo. Uno débil ("que ande") obliga a preguntar todo
el tiempo.

## 5. Mapa del repositorio

```
gymapp/
├── gymapp-back/          Spring Boot 3.5 · Java 17 · JPA/Hibernate · MySQL 8 · Flyway · MapStruct
│   └── src/main/java/com/aplicacionGym/gymapp/modules/
│       ├── core/         transversal: config, security (JWT), exception, entidades Person/*
│       ├── clients/      clientes, fichas físicas
│       ├── routines/     rutinas, ejercicios, logs
│       ├── payments/     pagos, productos, cuotas
│       └── attendance/   asistencias y clases grupales
├── gym-frontend/         React 19 · Vite · TS strict · TanStack Query · Tailwind · Zod
│   └── src/features/<dominio>/{components,hooks,pages,services}
├── docs/                 documentación (ver §6)
└── docker-compose.yml    MySQL 3380 · backend 8080 · frontend 80
```

Cada módulo del backend tiene la misma anatomía:
`controller/ · dto/{request,response}/ · entity/ · mapper/ · repository/ · service/`.

## 6. Archivos de documentación (.md)

**Todos los `.md` van dentro de `docs/`, nunca en la raíz del repo ni de un subproyecto.**
Las únicas excepciones son `README.md` y los `CLAUDE.md`.

| Qué querés documentar | Dónde va |
|---|---|
| Plan de implementación de una feature | `docs/plans/YYYY-MM-DD-<tema>.md` |
| Decisión técnica puntual | `docs/notes/YYYY-MM-DD-decision-<tema>.md` |
| Nota operativa / relevamiento | `docs/notes/<tema>.md` |
| Descripción de un PR | `docs/pr/YYYY-MM-DD-<rama>.md` |
| Estado de una punta | `docs/back.md` · `docs/front.md` (documentos vivos) |
| Reportes de review, salidas de herramientas | `docs/_interno/` — **gitignoreado**, no viaja en el PR |

Antes de crear un `.md` nuevo, fijate si ya existe uno vivo que deba actualizarse. Un documento
nuevo por cada hallazgo termina en un cementerio de archivos que nadie lee.

## 7. Estándares transversales

- **Una migración aplicada es inmutable.** Flyway trackea por checksum: editar un
  `V*.sql` que ya corrió rompe el arranque (`ddl-auto=validate` + `flyway.validate`). Todo cambio
  va en una migración **nueva**. Detalle en `gymapp-back/CLAUDE.md`.
- **Nadie escribe en la base por su cuenta.** Levantar Docker, correr migraciones o seeds es del
  usuario. Los agentes preparan el archivo y frenan.
- **El envelope de respuesta tiene un typo histórico:** `WebApiResponse` serializa `succes`, no
  `success`. El frontend nunca lo lee (usa `.data`). **No lo corrijas sin migrar las dos puntas
  en el mismo cambio** — ver §7 de cada CLAUDE.md de subproyecto.
- **Módulos con feature flag:** los controllers cuelgan de
  `@ConditionalOnProperty("gym.modules.<modulo>.enabled")`. Un endpoint nuevo de un módulo
  existente mantiene el flag.
- **Rama de integración: `main`.** Las ramas `feature/*` salen de `main` y vuelven por PR.
  `develop` existe en el remoto pero quedó abandonada en abril de 2026: no la uses de base.
- **Sin firmas de IA en los commits.** Ningún `Co-Authored-By` de herramientas ni "Generated by".

## 8. Skills y agentes disponibles

Skills (`/nombre` o pedido en lenguaje natural):

| Skill | Para qué |
|---|---|
| `claude-md` | Recordatorio a demanda de las pautas §1-4 |
| `git` | **Bloqueante antes de cualquier comando de git**: gitflow, conventional commits |
| `git-clean` | Limpiar ramas locales obsoletas y mergeadas |
| `pr-review` | Review del diff de la rama con detección de patrones del proyecto |
| `strict-review` | Review estricta contra CLAUDE.md, con reporte exportado |
| `pr-description` | Descripción de PR de GitHub lista para pegar |
| `equipo-implementar` | Orquesta el equipo de agentes sobre un plan o una tarea |

Agentes (`.claude/agents/`): `backend-spring`, `frontend-react` (implementan) ·
`revisor`, `verificador`, `verificador-migraciones` (controlan, nunca escriben código de aplicación).

---

**Estas pautas están funcionando si:** hay menos cambios innecesarios en los diffs, menos reescrituras
por sobrecomplicación, y las preguntas aclaratorias llegan antes de implementar y no después del error.
