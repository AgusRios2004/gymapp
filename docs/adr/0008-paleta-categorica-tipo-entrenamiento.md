# 0008 — Paleta categórica por tipo de entrenamiento, no por día

**Fecha:** 16/09/2026
**Estado:** Activa

## Contexto

`TrainingSchemeWidget.tsx` (y por extensión cualquier vista que categorice sesiones de entrenamiento) coloreaba cada card por **día de la semana** (lunes=rojo, martes=azul, miércoles=amber, jueves=emerald), heredado del tema oscuro viejo. Al rediseñar el componente a light mode (T-21, Sprint 2) surgieron dos problemas con ese criterio:

1. El color no comunica nada — "lunes es rojo" es arbitrario, y si el esquema cambia de días el color queda huérfano.
2. El callout de "Cardio LISS" (una funcionalidad que se repite en todas las cards) usaba el mismo color que el día, compitiendo visualmente con la categoría en vez de identificarse como una feature aparte.

## Decisión

El color-coding de sesiones de entrenamiento se asigna por **tipo de entrenamiento (función)**, no por día de la semana. Paleta fija:

| Categoría | Color | Clases Tailwind (referencia) |
|:---|:---|:---|
| Empuje (push) | Blue | `bg-blue-50 border-blue-200`, badge `bg-blue-100 text-blue-700 border-blue-200` |
| Tracción (pull) | Violet | `bg-violet-50 border-violet-200`, badge `bg-violet-100 text-violet-700 border-violet-200` |
| Pierna (legs) | Orange (`gym.accent`) | `bg-orange-50 border-orange-200`, badge `bg-orange-100 text-orange-700 border-orange-200` |
| Refuerzo | Teal | `bg-teal-50 border-teal-200`, badge `bg-teal-100 text-teal-700 border-teal-200` |
| Descanso | Slate (neutral) | `bg-slate-50 border-slate-200`, badge `bg-slate-100 text-slate-600` |

Además, el callout de **Cardio LISS** usa un color **fijo e independiente de la categoría** (cyan: `bg-cyan-50 border-cyan-200 text-cyan-700`, ícono `text-cyan-600`) en las cuatro cards, porque es una feature que se repite todos los días, no una categoría de día.

El estado "sesión completada" sigue pisando el color de categoría con `emerald` (semántica de éxito ya establecida en [ADR-0001](./0001-color-de-marca-emerald.md)) — el estado tiene prioridad visual sobre la categoría.

No se agregaron tokens nuevos a `tailwind.config.js`: son colores estándar de Tailwind (`blue`, `violet`, `teal`, `cyan`), no hex custom de marca. La fuente de verdad de esta paleta es la tabla de arriba (duplicada en `docs/DESIGN_SYSTEM.md`), no un objeto en el config.

Todas las etiquetas visibles (Empuje/Tracción/Pierna/Refuerzo) van en español — el usuario final no ve inglés en ningún texto de UI.

## Alternativas consideradas

- **Mantener color por día:** descartada — no escala si cambian los días del esquema, y no comunica nada al usuario.
- **Solo 2 categorías (Fuerza/Cardio-Recuperación):** descartada por el usuario en la revisión del mockup — se prefirió el detalle de PPL + Refuerzo para diferenciar visualmente los cuatro días de fuerza.
- **Sin color-coding, solo texto:** descartada — se pierde el escaneo visual rápido que ya tenía el widget.

## Consecuencias

- Cualquier vista nueva que categorice entrenamientos por tipo (no por día) reutiliza esta misma paleta, en vez de inventar colores nuevos por pantalla.
- Si en el futuro se agrega una quinta categoría de fuerza, hay que elegir un color que no choque con esta tabla (evitar emerald, rose, amber — reservados — y los cuatro ya asignados).
- No aplica a `ClassesPage.tsx` (T-28, pendiente): ahí el color por día está pedido explícitamente en el sprint para las clases grupales (un caso distinto: ahí sí importa saber qué día es la clase). Este ADR es específico de esquemas/rutinas de entrenamiento individual.
