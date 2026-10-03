# Tareas — 0014 — Nutrición y hábitos: respuestas sin el alumno completo y errores visibles

Spec: [`0014-nutricion-y-habitos-sin-entidades.md`](./0014-nutricion-y-habitos-sin-entidades.md)

El tamaño es relativo (S/M), no horas. T1 y T2 son backend (`@SpringBootTest` + `MockMvc` sobre H2, con DNIs únicos por test). T3 y T4 son frontend (vitest + Testing Library, services mockeados). Las cuatro son independientes porque el contrato que lee el frontend no cambia. **T1 sola cierra el crítico de agua y suplementos.**

---

## T1 — DTO de agua y suplementos

**Toca:** `dto/response/WaterLogResponseDTO.java` (nuevo), `dto/response/SupplementLogResponseDTO.java` (nuevo), `mapper/HabitLogMapper.java` (nuevo), `controller/WaterLogController.java`, `controller/SupplementController.java`, `src/test/java/.../controller/HabitLogResponseTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0014-01, 02, 04 (agua y suplementos), 05

- `WaterLogResponseDTO`: `id`, `clientId`, `date`, `milliliters`, `targetMilliliters`, `notes`. `SupplementLogResponseDTO`: `id`, `clientId`, `date`, `creatineTaken`, `proteinTaken`, `notes`. Verificar que Jackson serialice los booleanos como `creatineTaken`/`proteinTaken` (no como `isCreatineTaken`).
- El mapper sigue el patrón de `GroupClassMapper` (estático, null-safe con `client`). Los controllers mapean y los services siguen devolviendo entidades.
- El registro vacío del `GET` (sin registro del día) se arma en el controller con `clientId` del path (AC-05).
- Test rojo primero, con el ciclo real en H2: `Routine` R, y un `Client` con `routineActive = R` y `routines = [R]`. Parsear el cuerpo con `ObjectMapper` antes de los `jsonPath` (AC-01).
- AC-04: `jsonPath("$..client")`, `$..password`, `$..dni`, `$..email`, `$..phone` y `$..routineActive` no existen.

---

## T2 — DTO de plan y comidas

**Toca:** `dto/response/NutritionPlanResponseDTO.java` (nuevo), `dto/response/MealLogResponseDTO.java` (nuevo), `mapper/NutritionMapper.java` (nuevo), `controller/NutritionController.java`, `src/test/java/.../controller/NutritionResponseTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0014-03, 04 (plan y comidas), 06

- `NutritionPlanResponseDTO`: `id`, `clientId`, `name`, `dailyCalories`, `proteinGrams`, `carbsGrams`, `fatGrams`, `guidelines`, `active`. `MealLogResponseDTO`: `id`, `clientId`, `date`, `mealType`, `description`, `calories`, `proteinGrams`, `healthySnackReplaced`.
- `GET /meals` mapea la lista. `GET /plan` sin plan sigue con `notFound()` (AC-06). `DELETE` no cambia.
- El mismo fixture de ciclo que T1. Si conviene compartirlo, cada test arma el suyo: no se crea un helper común en esta tarea.

---

## T3 — Estado de error en `HydrationTracker` y `SupplementTracker`

**Toca:** `components/HydrationTracker.tsx`, `components/SupplementTracker.tsx`, `components/HydrationTracker.test.tsx` (nuevo), `components/SupplementTracker.test.tsx` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0014-07, 08, 09

- La carga marca error si el service rechaza o si el resultado no es un objeto (`typeof data !== 'object' || data === null`). Con error: `<EmptyState variant="error" ... />` dentro de la card, sin botones ni opciones.
- Mutación fallida: `toast.error` con `error.response?.data?.message` o un texto genérico ("No se pudo registrar el agua", "No se pudieron guardar los suplementos"), siguiendo el patrón de `RecompositionWidget`. El estado anterior no se toca.
- Sin TanStack Query (fuera de alcance): se agrega un `useState` de error.

---

## T4 — Estado de error en `ClientNutritionTab`

**Toca:** `components/ClientNutritionTab.tsx`, `services/nutritionService.ts`, `components/ClientNutritionTab.test.tsx` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0014-10, 11

- `getActiveNutritionPlan` devuelve `null` **solo** con 404, y relanza cualquier otro error.
- `fetchData` marca error si alguna de las dos cargas falla. Con error: `EmptyState` de error en lugar de la card del plan y de la lista de comidas. El formulario de registrar comida puede seguir visible.
- `handleAddMeal` y `handleDelete`: `toast.error` con el `message` del backend o un genérico.
- AC-10, caso feliz: `null` + `[]` → sin estado de error.
