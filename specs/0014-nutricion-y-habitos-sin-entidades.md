---
id: 0014
titulo: Nutrición y hábitos — respuestas sin el alumno completo y errores visibles
estado: aprobada          # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 03/10/2026
adrs_relacionados: []
---

## Objetivo

Que la pestaña "Nutrición y hábitos" de la ficha del alumno registre agua, suplementos, plan y comidas para cualquier alumno, incluido uno con rutina activa, y que esas respuestas dejen de exponer la contraseña (hash), el DNI, el email y el teléfono del alumno. Cuando algo falle, la pantalla lo tiene que decir en vez de quedarse igual.

Cierra **BUG-25** 🔴 de la [QA Sesión 02](../docs/notes/BITACORA_QA.md) (30/09/2026), que bloquea el cierre del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md). Es el mismo problema que resolvió la [spec 0011](./0011-clases-sin-ciclos-ni-datos-del-profesor.md) para clases.

## Contexto (lo que pasa hoy)

`WaterLogController`, `SupplementController` y `NutritionController` devuelven las entidades `WaterLog`, `SupplementLog`, `NutritionPlan` y `MealLog` tal cual. Las cuatro tienen `@ManyToOne Client client`, y Jackson serializa:

- `client` → la entidad `Client` completa, con `password`, `dni`, `email` y `phone`.
- `client.routineActive` → `Routine` → `clients` → `routineActive`… Si el alumno tiene rutina activa, el ciclo no termina: la respuesta sale con **status 200 y un JSON inválido** (228 KB, con el error del handler pegado al final).

En el frontend:

- `HydrationTracker` y `SupplementTracker` cargan y guardan con `try/catch` que solo hace `console.error`. Con la respuesta rota, axios entrega un string, `milliliters` queda `undefined` y el contador muestra 0 ml: "+250 ml" parece no hacer nada, aunque el backend guardó el agua.
- `ClientNutritionTab` hace lo mismo con plan y comidas.
- `getActiveNutritionPlan` convierte **cualquier** error en `null`, así que una falla se ve igual que "el alumno no tiene plan".

Los tipos del frontend (`WaterLog`, `SupplementLog`, `NutritionPlan`, `MealLog` en `gym-frontend/src/types/index.ts`) ya esperan `clientId` y no `client`: hoy ese campo nunca llega.

## Restricciones

- Los campos que hoy lee el frontend mantienen nombre y significado, para que los tipos de `types/index.ts` no cambien:
  - `WaterLog`: `id`, `date`, `milliliters`, `targetMilliliters`, `notes`.
  - `SupplementLog`: `id`, `date`, `creatineTaken`, `proteinTaken`, `notes`.
  - `NutritionPlan`: `id`, `name`, `dailyCalories`, `proteinGrams`, `carbsGrams`, `fatGrams`, `guidelines`, `active`.
  - `MealLog`: `id`, `date`, `mealType`, `description`, `calories`, `proteinGrams`, `healthySnackReplaced`.
- Las rutas, los parámetros y los bodies de request no cambian.
- Las respuestas exitosas de estos endpoints siguen sin `WebApiResponse` (hoy devuelven el objeto suelto y el frontend lo lee así). Los errores siguen la spec 0001.
- `GET /api/clients/{id}/nutrition/plan` sin plan activo sigue respondiendo 404: el frontend lo usa para mostrar "sin plan".
- Errores de mutación: toast con el `message` del backend, igual que el resto de la app (regla global del refactor). Errores de carga: `EmptyState` de error (CLAUDE.md, `docs/DESIGN_SYSTEM.md`).
- "Hoy" sigue saliendo del `Clock` del negocio (spec 0010, ADR-0011).

## Comportamiento esperado

1. Los siete endpoints de `/api/clients/{clientId}/water`, `/supplements` y `/nutrition` que devuelven datos responden con un DTO, no con la entidad.
2. Cada DTO trae los campos de las Restricciones más `clientId`. No trae `client` ni ningún otro dato del alumno.
3. La respuesta es JSON válido para cualquier alumno, incluido uno con rutina activa que también está en su lista `routines`.
4. `GET /water` y `GET /supplements` sin registro del día siguen devolviendo el registro vacío de hoy (0 ml de 3000 ml; suplementos sin tomar). En ese caso `id` es `null`, y `clientId` es el del path.
5. Si la carga de agua o de suplementos falla, la card muestra un estado de error en vez del contador o los checks, y los botones no se pueden usar.
6. Si guardar agua o suplementos falla, se muestra un toast con el `message` del backend (o un texto genérico en español si no hay), y el valor anterior queda en pantalla.
7. En `ClientNutritionTab`, si falla la carga de comidas o del plan (por algo que no sea un 404), se ve un estado de error en lugar de "sin plan" y de la lista vacía. Si falla registrar o borrar una comida, se muestra un toast.

## Casos de borde

- **Alumno con rutina activa** (el caso real, visto con Carlos Perez): `routineActive = R` y `routines` que contiene R.
- **Alumno sin rutina:** sin cambios de comportamiento; también recibe el DTO.
- **Primer registro del día:** `POST /water/add` crea el registro y devuelve `id` no nulo.
- **Restar con 0 ml:** `-250` con 0 ml deja 0 (`Math.max` del service, sin cambios).
- **Alumno inexistente en POST:** 404 por `ResourceNotFoundException` (spec 0001), sin cambios.
- **Sin plan activo:** 404 → "sin plan", **no** el estado de error.
- **Respuesta que no es un objeto** (string, `undefined`), como la que hoy entrega axios con el JSON roto: se trata como error de carga.
- **Red caída:** estado de error en la card. El `alert()` del interceptor de axios sigue apareciendo (ver Fuera de alcance).

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0014-01 | Con un alumno A cuya `routineActive` es R y cuya lista `routines` contiene R, `POST /api/clients/{A}/water/add?amountMl=250` y después `GET /api/clients/{A}/water` responden 200 con un cuerpo que se parsea como JSON, con `milliliters == 250` y `clientId == A`. |  |
| AC-0014-02 | Para el alumno A del AC-01, `GET` y `POST /api/clients/{A}/supplements` responden 200 con JSON válido, con `creatineTaken` y `proteinTaken` iguales a lo enviado, y `clientId == A`. |  |
| AC-0014-03 | Para el alumno A del AC-01, `GET` y `POST /api/clients/{A}/nutrition/plan`, `GET` y `POST /api/clients/{A}/nutrition/meals` responden 200 con JSON válido y `clientId == A` (en `meals`, en cada elemento). |  |
| AC-0014-04 | En todas las respuestas de los AC-01 a AC-03, el cuerpo no tiene `client`, `password`, `dni`, `email`, `phone` ni `routineActive` en ningún nivel. |  |
| AC-0014-05 | `GET /api/clients/{A}/water` y `GET /api/clients/{A}/supplements` sin registro del día responden 200 con `id: null`, `clientId == A` y la fecha de hoy según el `Clock` del negocio; agua con `milliliters: 0` y `targetMilliliters: 3000`, y suplementos con `creatineTaken: false` y `proteinTaken: false`. |  |
| AC-0014-06 | `GET /api/clients/{A}/nutrition/plan` sin plan activo responde 404. |  |
| AC-0014-07 | En `HydrationTracker`, si `getWaterLog` rechaza o resuelve algo que no es un objeto, se ve un estado de error ("No pudimos cargar la hidratación") y no aparecen los botones "+250 ml", "+500 ml" ni "-250 ml". |  |
| AC-0014-08 | En `HydrationTracker`, si `addWaterLog` rechaza con `message: "X"`, se llama a `toast.error` con un texto que contiene "X", y el contador sigue mostrando el valor anterior. |  |
| AC-0014-09 | En `SupplementTracker`, si `getSupplementLog` rechaza o resuelve algo que no es un objeto, se ve un estado de error ("No pudimos cargar los suplementos") y no aparecen las opciones de creatina ni de proteína. Si `saveSupplementLog` rechaza con `message: "X"`, se llama a `toast.error` con un texto que contiene "X", y el estado de "Tomado"/"Pendiente" no cambia. |  |
| AC-0014-10 | En `ClientNutritionTab`, si `getMealLogs` rechaza, o si `getActiveNutritionPlan` rechaza con un status distinto de 404, se ve un estado de error ("No pudimos cargar la nutrición"). Si `getActiveNutritionPlan` resuelve `null` (sin plan, 404) y `getMealLogs` resuelve `[]`, no se ve el estado de error. |  |
| AC-0014-11 | En `ClientNutritionTab`, si `logMeal` o `deleteMealLog` rechazan con `message: "X"`, se llama a `toast.error` con un texto que contiene "X". |  |

## Fuera de alcance

- **`alert()` nativo en el interceptor de axios** (`gym-frontend/src/lib/axios.ts`: 5xx, 401 y red caída). Es el popup del navegador "Ups! Ocurrió un error en el servidor", para toda la app. No está en la bitácora; va con un ID propio (ver Notas de handoff), no mezclado con este crítico.
- **Mensajes 404 en inglés** (`"Client not found with id: …"`). Hay 26 en 14 archivos del backend, incluidos los tres services de esta spec. Rompen el punto 4 de la spec 0001, pero se corrigen todos juntos y no solo estos tres.
- **Bodies de request con entidades** (`@RequestBody SupplementLog`, `NutritionPlan`, `MealLog`). Si mandan `client`, el service lo pisa; pasarlos a un DTO de request no hace falta para el crítico.
- **`deleteMeal` no verifica que la comida sea del `clientId` del path.** Es un tema de autorización y no aparece en la QA.
- **`/api/exercise-logs`.** Ya quedó anotado fuera de alcance en la spec 0011, con el mismo riesgo de ciclo. No lo usa la pestaña de Nutrición y hábitos.
- **Un error de serialización que sale con status 200** (el handler pega su JSON al final). Es del `GlobalExceptionHandler` para todos los endpoints; ya está anotado en la spec 0011.
- **Migrar los tres componentes a TanStack Query.** El estado de error se agrega sobre el `useState`/`useEffect` actual, para que el diff sea chico.

## Notas de handoff

- **Asumido:** `clientId` entra en los DTO porque el tipo del frontend ya lo declara, aunque hoy ninguna pantalla lo lee. Se puede sacar sin romper nada.
- **Asumido:** el estado de error en el frontend entra en esta spec por la misma razón que en la 0011: es lo que hizo invisible el crítico ("+250 ml" que no suma, sin aviso). Si para llegar al cierre del 04/10 se prefiere solo el backend, alcanza con T1 y T2: el crítico queda cerrado, y T3 y T4 pasan al Sprint 2.
- **Pregunta abierta:** ¿se registra el `alert()` del interceptor como DES-16 en la bitácora, para la QA 03? Es lo más parecido a "errores del servidor que se ven feos" que no está anotado en ningún lado.
- **Pregunta abierta:** ¿se registran los 404 en inglés como BUG-26?
- **Lo más probable que salga mal:** que el test del AC-01 no arme el ciclo real (alumno con `routineActive = R` **y** R en `routines`) y pase aunque el bug siga ahí. Segundo riesgo: el `alert()` del interceptor salta en los tests de T3/T4 cuando se simula un 5xx con un `AxiosError` real. Los tests mockean los services, no axios, así que no debería pasar; si pasa, se mockea `window.alert` y no se toca `axios.ts`.
