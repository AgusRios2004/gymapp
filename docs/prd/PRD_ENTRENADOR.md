# 📋 PRD — Capa 2: Entrenador (rutinas inteligentes + LLM)
> **Versión:** 0.2 | **Fecha:** 21 Sep 2026, actualizado 22 Sep 2026 | **Estado:** Borrador — sin sprint calendario asignado

---

## 🎯 Visión del producto

Capa 2 de las 3 del producto (ver [`PRD_REFACTOR.md`](./PRD_REFACTOR.md)):

```
CAPA 1 — ADMIN      → Gestión operativa completa (EN CIERRE)
CAPA 2 — ENTRENADOR → Rutinas inteligentes + LLM (ESTE DOCUMENTO)
CAPA 3 — ALUMNO     → Consumo de su plan (DESPUÉS)
```

**Regla de avance (heredada de Capa 1):** no se empieza a construir Capa 2 hasta que Capa 1 pase la QA Sesión 03 (17/10/2026) sin bugs críticos ni de experiencia. Este PRD se escribe antes para no perder tiempo de planificación cuando llegue el momento, no para arrancar código ahora.

El objetivo de Capa 2 es que el **profesor** (no el alumno todavía — eso es Capa 3) use un LLM para dos cosas concretas, apoyándose en los datos que la app ya recolecta de cada alumno:

1. Generar una rutina completa a partir del objetivo y el perfil del alumno.
2. Sugerir ajustes sobre una rutina que el alumno ya viene haciendo, en base a su progreso real.

## 🚫 Fuera de alcance del MVP

- Nada de esto lo ve ni lo usa el alumno directamente (es Capa 3).
- El LLM no inventa ejercicios nuevos: solo compone rutinas con el catálogo de `Exercise` que ya existe en la app.
- No hay chat libre / conversacional — se evaluó como opción y se descartó definitivamente, no solo para el MVP (decisión del 22/09/2026, ver más abajo).
- No hay generación ni sugerencias automáticas sin acción explícita del profesor (nada corre en background ni por cron).

---

## 🏗️ Decisión de alcance (21/09/2026)

Se le preguntó al usuario qué debía hacer el LLM en el MVP. Eligió:

- **Generar rutinas automáticamente**, y
- **Sugerir progresiones sobre rutinas existentes**,

descartando el asistente conversacional libre.

También se decidió que **toda salida del LLM pasa por revisión humana del profesor antes de impactar al alumno** — ver [ADR-0010](../adr/0010-capa2-revision-humana-obligatoria.md) para el detalle y las alternativas descartadas.

## 🏗️ Decisión de alcance (22/09/2026)

Tres decisiones más, resueltas con el usuario:

- **Proveedor de LLM: Gemini, por ahora.** Es una decisión de arranque, no definitiva — si más adelante conviene cambiar (costo, calidad de las rutinas generadas, políticas de datos), se revisa. Como es un proveedor externo distinto a Anthropic, el ADR de privacidad de Fase 1 tiene que revisar puntualmente las políticas de retención/uso de datos de la API de Gemini para lo que se le manda (peso, % de grasa, objetivo del alumno).
- **Historial de peso: tabla dedicada**, no un campo fijo en `RoutineExercise`. Queda resuelta la pregunta abierta de la sección de gap técnico más abajo — ver Fase 1.
- **Asistente conversacional: descartado definitivamente**, no queda ni como "posible Fase 4". Si se quiere retomar en el futuro, es una decisión nueva, no la reactivación de esta.

Además, al descartar el chat, el usuario planteó una idea distinta pero **para Capa 3 (Alumno), no para este documento**: que el alumno pueda armar su propia rutina con el LLM, sin depender de que el profesor la pida. Esto no se resuelve acá — implica revisar si el human-in-the-loop de [ADR-0010](../adr/0010-capa2-revision-humana-obligatoria.md) también aplicaría ahí (mismo riesgo de que una rutina mal generada llegue a un alumno sin que nadie la revise, potencialmente peor porque el alumno no tiene el criterio de un profesor para detectar un error). Queda anotada en "Abierto para la próxima revisión" y en `ROADMAP.md`, para cuando se escriba `PRD_ALUMNO.md`.

---

## 🏗️ Arquitectura — Reglas globales de Capa 2

- **Human-in-the-loop obligatorio** ([ADR-0010](../adr/0010-capa2-revision-humana-obligatoria.md)): ninguna rutina generada ni sugerencia se aplica sin aprobación explícita del profesor.
- **El catálogo de ejercicios es la única fuente de verdad**: el LLM elige y combina `Exercise` existentes (por `muscleGroup` y `ExerciseType`: `FUERZA_PESAS`, `CARDIO_LISS`, `CARDIO_HIIT`, `ABDOMINALES`, `FLEXIBILIDAD`). Si el LLM "quiere" un ejercicio que no existe, la respuesta se rechaza o se le pide que elija del catálogo real — nunca se crea un `Exercise` nuevo automáticamente.
- **Dato de salud = dato sensible**: el prompt que se manda al proveedor de LLM incluye peso, % de grasa, objetivo y (a futuro) lesiones del alumno. Antes de integrar un proveedor externo hace falta decidir y documentar en un ADR aparte: qué proveedor, qué datos exactos se mandan, y si el alumno necesita dar consentimiento explícito para que sus datos físicos se usen así (probablemente sí, dato para legal/ToS más adelante).
- **Llamadas al LLM son costosas y lentas**: se disparan solo bajo una acción explícita del profesor ("Generar con IA" / "Sugerir progresión"), nunca en cada render ni de forma implícita.
- **Reutilizar el modelo de datos existente** en vez de crear tablas paralelas — ver siguiente sección.

### Modelo de datos existente que Capa 2 reutiliza

| Entidad | Campos relevantes para el LLM | Uso |
|:---|:---|:---|
| `Client` | `primaryGoal`, `targetWeight`, `targetFatPercentage`, `targetMuscleMass`, `height` | Input para generar rutina nueva |
| `PhysicalRecord` (histórico) | `weight`, `muscleMass`, `fatPercentage`, `date` | Input para sugerir progresiones (tendencia en el tiempo) |
| `Assistance` (histórico) | `date` | Input para progresiones — ej. "viene 4 veces por semana, puede sumar un día" |
| `Routine` / `RoutineDay` / `RoutineExercise` | estructura completa | Formato de salida de la generación; también lo que se lee para sugerir cambios |
| `Exercise` | `name`, `muscleGroup`, `type` | Catálogo cerrado del que el LLM puede elegir |

### ⚠️ Gap detectado — parcialmente cerrado

`RoutineExercise` (backend) no persistía peso pese a que el frontend (`CreateRoutineModal.tsx`, `EditRoutineModal.tsx`, `RoutineDetailsModal.tsx`) ya lo pedía y lo mostraba — se perdía silenciosamente al guardar. **Corregido el 22/09/2026** (independiente de este PRD, era un bug de Capa 1): `RoutineExercise` ahora tiene un campo `weight` que persiste el valor actual cargado en la rutina.

Lo que **sigue pendiente para la Fase 1** es distinto: ese campo guarda un solo valor fijo (el peso "de la rutina"), no un historial en el tiempo. Para sugerir "subile 2.5kg a la sentadilla" hace falta ver cómo varió el peso entre sesiones, y **eso se decidió (22/09/2026) que va en una tabla de historial dedicada**, algo como `RoutineExerciseLog` (cliente, ejercicio, fecha, peso real levantado) — no alcanza con el campo fijo que ya existe. El diseño exacto de esa tabla (si se referencia por `RoutineExercise` o directo por `Client`+`Exercise`, si se carga a mano o solo la completa el flujo de progresión) queda para cuando arranque la Fase 1.

---

## 📋 Fases (backlog, no sprints calendario — ver nota de nomenclatura en `ROADMAP.md`)

### 🔧 FASE 1 — Fundamentos técnicos (sin esto no se puede generar nada)

| Tema | Qué implica |
|:---|:---|
| Historial de peso por ejercicio | Crear la tabla de historial (`RoutineExerciseLog` o similar, decidido el 22/09) — el campo fijo ya existe desde el 22/09, esto es lo que falta para ver progresión en el tiempo. Ver gap técnico arriba. |
| Integrar Gemini | Backend nuevo: SDK/API de Gemini + credenciales + un servicio (`RoutineAiService` o similar) que arme el prompt y parsee la respuesta a la estructura de `Routine`. |
| Diseñar el contrato del prompt | Qué contexto exacto del cliente se manda (ver tabla de arriba), qué formato de salida se exige (JSON estructurado, no texto libre, para poder mapear directo a `RoutineDay`/`RoutineExercise`), y qué pasa si el LLM devuelve algo inválido (reintentar, rechazar, pedir al profesor que edite a mano). |
| Estado de "borrador de IA" | Las rutinas generadas necesitan poder distinguirse de las rutinas armadas a mano y de las ya asignadas — para que la UI muestre "pendiente de revisión" en vez de mezclarse con el resto. Definir si es un campo nuevo en `Routine` o una tabla separada. |
| ADR de privacidad y proveedor | Revisar específicamente las políticas de retención/uso de datos de la API de Gemini para lo que se le manda (peso, % de grasa, objetivo del alumno), y si hace falta consentimiento explícito del alumno. |

### 🤖 FASE 2 — Generación automática de rutina

- El profesor entra al flujo existente de asignar rutina (`AssignRoutineModal.tsx`) y tiene una opción nueva: "Generar con IA" en vez de elegir una plantilla existente.
- Input: el perfil del cliente (objetivo, targets, altura) + días disponibles que indique el profesor en el momento.
- Output: una `Routine` completa en estado borrador, armada solo con ejercicios del catálogo, agrupados por `muscleGroup`/`type` de forma coherente con el objetivo.
- El profesor la revisa en el modal de edición ya existente (`EditRoutineModal.tsx` — no hace falta un editor nuevo, ya sabe editar días y ejercicios), ajusta lo que haga falta, y recién ahí la asigna por el flujo normal.

### 📈 FASE 3 — Sugerencias de progresión

- Sobre una rutina ya asignada y activa, el profesor pide "Sugerir progresión".
- Input: rutina activa + historial de `PhysicalRecord` + historial de `Assistance` del cliente.
- Output: una lista de sugerencias puntuales con motivo (ej. "Subir peso en Press de Banca — el alumno viene entrenando 4/4 semanas y el peso no subió en 3 registros"; "Agregar un día — asistencia estable en 5 días/semana hace un mes"). Cada sugerencia se acepta o descarta individualmente; nada se aplica en bloque.

### ✅ QA de Capa 2

- Sesión de QA dedicada antes de habilitar Capa 3 (fecha a definir cuando arranque la fase, siguiendo la misma lógica de capacidad que Capa 1 — ver [ADR-0004](../adr/0004-capacidad-de-planificacion.md)).

---

## 📊 Resumen de prioridades

| Fase | Bloquea a | Estimación |
|:---|:---|:---:|
| Fase 1 — Fundamentos | Fase 2 y 3 | A estimar cuando arranque |
| Fase 2 — Generación automática | — | A estimar |
| Fase 3 — Sugerencias de progresión | Depende de Fase 1 (peso persistido) | A estimar |
| QA Capa 2 | Capa 3 | ~2 hs (mismo orden que QA Sesión 01-03) |

No se ponen fechas ni horas todavía — siguiendo la regla de `ROADMAP.md`, las fechas de Capa 2 se fijan recién cuando Capa 1 cierre y se sepa la velocidad real del equipo.

---

## ✅ Criterios de aceptación — Capa 2 lista

- [x] `RoutineExercise` persiste peso (campo fijo, cerrado el 22/09/2026 — independiente de este PRD)
- [ ] Existe la tabla de historial de peso por ejercicio y se completa en el flujo de progresión
- [ ] Gemini está integrado y documentado (ADR de privacidad/proveedor escrito, revisando específicamente sus políticas de datos)
- [ ] El profesor puede generar una rutina con IA desde el flujo de asignación existente, usando solo ejercicios del catálogo
- [ ] Ninguna rutina generada por IA queda asignada a un alumno sin que un profesor la revise y confirme explícitamente ([ADR-0010](../adr/0010-capa2-revision-humana-obligatoria.md))
- [ ] El profesor puede pedir sugerencias de progresión sobre una rutina activa y aceptar/descartar cada una individualmente
- [ ] QA de Capa 2 pasa sin bugs críticos ni de experiencia

---

## 🔄 Abierto para la próxima revisión

- Diseño exacto de la tabla de historial de peso (`RoutineExerciseLog` o el nombre que se defina): qué referencia, quién la completa, si se carga a mano además de vía IA.
- Si Gemini sigue siendo la elección correcta una vez que se prueben costos y calidad de las rutinas generadas — se dejó abierto a cambiar.
- **Idea para Capa 3 (Alumno), no de este documento:** que el alumno pueda generar su propia rutina con el LLM sin depender del profesor. Antes de escribir `PRD_ALUMNO.md` con esto adentro, hay que resolver si el human-in-the-loop de [ADR-0010](../adr/0010-capa2-revision-humana-obligatoria.md) aplica igual ahí — el riesgo de una rutina mal generada llegando sin revisión es, si acaso, mayor cuando el que la pide es el propio alumno.
