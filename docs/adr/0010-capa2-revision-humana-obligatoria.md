# 0010 — Capa 2: toda salida del LLM pasa por revisión humana antes de llegar al alumno

**Fecha:** 21/09/2026
**Estado:** Activa

## Contexto

Al planificar la Capa 2 (Entrenador — rutinas inteligentes + LLM, ver [`prd/PRD_ENTRENADOR.md`](../prd/PRD_ENTRENADOR.md)) había que decidir si las rutinas y sugerencias que genera el LLM se asignan directo al alumno, o si un profesor las revisa antes. Se le preguntó al usuario explícitamente porque es una decisión de producto con implicancias de seguridad (un alumno podría lastimarse siguiendo una rutina mal generada) que no se puede inferir del código existente.

## Decisión

**El LLM nunca asigna nada directo a un alumno.** Toda rutina generada automáticamente o sugerencia de progresión queda en estado de borrador/propuesta; un profesor humano tiene que revisarla, editarla si hace falta, y aprobarla explícitamente antes de que impacte la cuenta del alumno. Esto aplica a los dos features del MVP:

- **Generación automática de rutina:** el LLM arma una `Routine` completa (días + ejercicios), pero queda sin asignar a ningún cliente hasta que el profesor la revise en el modal de edición existente y la asigne por el flujo normal (`AssignRoutineModal`).
- **Sugerencias de progresión:** el LLM propone cambios puntuales (subir peso, agregar día, cambiar ejercicio) como una lista con motivo; el profesor acepta o descarta cada una individualmente. Ninguna se aplica sola.

## Alternativas consideradas

- **Asignación automática con auditoría posterior:** el LLM genera y asigna directo, el profesor revisa después desde el historial. Más rápido, pero un alumno podría entrenar con una rutina mal generada (ejercicio contraindicado por una lesión, carga irreal) antes de que alguien la vea. Descartado para el MVP — el gimnasio es un contexto físico real, no un dominio donde un error del modelo sea inofensivo.

## Consecuencias

- La UI de Capa 2 necesita un estado explícito de "pendiente de revisión" en las rutinas generadas por IA (no alcanza con crear una `Routine` activa como cualquier otra) — ver detalle en `PRD_ENTRENADOR.md`.
- El profesor sigue siendo el punto de control único; esto simplifica el modelo de permisos (no hace falta que el alumno apruebe ni vea nada del LLM directamente en el MVP).
- Si más adelante se quiere reducir la fricción (por ejemplo, auto-aprobar sugerencias de bajo riesgo), eso es una decisión nueva que reemplaza este ADR, no un ajuste silencioso.
