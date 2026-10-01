# Tareas — 0011 — Clases: respuesta sin ciclos ni datos privados del profesor

Spec: [`0011-clases-sin-ciclos-ni-datos-del-profesor.md`](./0011-clases-sin-ciclos-ni-datos-del-profesor.md)

Tamaño relativo (S/M), no horas. T1 es backend (`@SpringBootTest` + `MockMvc` sobre H2) y T2 es frontend (vitest + Testing Library, servicios mockeados). Son independientes: el contrato que lee el frontend no cambia.

---

## T1 — DTO de clase en `GroupClassController`

**Toca:** `dto/response/GroupClassResponseDTO.java` (nuevo), `dto/response/ProfessorSummaryResponseDTO.java` (nuevo), `mapper/GroupClassMapper.java` (nuevo), `controller/GroupClassController.java`, `src/test/java/.../controller/GroupClassResponseTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0011-01, 02, 03, 04, 05

- `GroupClassResponseDTO`: `id`, `className`, `daysOfWeek`, `startTime`, `endTime`, `capacity`, `professor` (`ProfessorSummaryResponseDTO`: `id`, `name`, `lastName`) y `routine` (reusar `RoutineSummaryResponseDTO`: `id`, `name`, `goal`).
- `GroupClassMapper.toDTO(GroupClass)` con `null`-safety para `professor` y `routine` (AC-04). El controller mapea en `GET`, `POST` y `PUT`; el servicio sigue devolviendo entidades.
- Test rojo primero, con el ciclo real en H2: `Routine` R, un `Client` con `routineActive = R` y `routines = [R]`, y una `GroupClass` con `routine = R`. Parsear el cuerpo con `ObjectMapper` (AC-01: que sea JSON válido) antes de los `jsonPath`.
- Para AC-02 y AC-03, `jsonPath(...).doesNotExist()` sobre `password`, `email`, `dni`, `phone`, `clients` y `days`.
- Correr `GroupClassDaysTest` (spec 0003) antes de cerrar. Si algo falla, ver la nota de riesgo de la spec.
- No tocar los bodies de request ni `GroupClassService` (fuera de alcance).

---

## T2 — Estado de error en `ClassesPage`

**Toca:** `pages/ClassesPage.tsx`, `pages/ClassesPage.test.tsx`
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0011-06, 07, 08

- La `queryFn` de `['classes']` lanza un error si `getClasses()` no devuelve un array, en vez de convertirlo en `[]` (AC-07).
- Con `isError`, en lugar de la grilla de días: `<EmptyState variant="error" title="No pudimos cargar las clases" />`. El encabezado y los botones "Nuevo alumno" y "Nueva clase" siguen visibles.
- Tests con `vi.mocked(getClasses)`: `mockRejectedValue` (AC-06), `mockResolvedValue(undefined)` y un string (AC-07), `mockResolvedValue([])` (AC-08).
- No cambiar el tipo `GroupClass` ni el servicio `classService.ts`.
