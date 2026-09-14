# Tareas — 0003 — Clases grupales en varios días de la semana

Spec: [`0003-clases-multi-dia.md`](./0003-clases-multi-dia.md)

Tamaño relativo (S/M), no horas. T1–T2 backend (`@SpringBootTest` + `MockMvc` sobre H2), T3–T4 frontend (vitest + Testing Library, servicios mockeados).

---

## T1 — `GroupClass` con `daysOfWeek` y validación en el service

**Toca:** `entity/GroupClass.java`, `service/GroupClassService.java`, `repository/GroupClassRepository.java`, `src/test/java/.../controller/GroupClassDaysTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0003-01, 02, 03, 04, 05, 06

- `@ElementCollection(fetch = EAGER) List<String> daysOfWeek`. El campo viejo queda como `@Deprecated @JsonIgnore @Column(name = "day_of_week") String legacyDayOfWeek` para la migración (T2).
- En `createClass` y `updateClass`: normalizar (sin repetidos, orden lunes → domingo) y validar (al menos uno, todos válidos) antes de guardar. Inválido → `IllegalArgumentException` con mensaje en español que nombra el valor.
- `updateClass`: `RuntimeException("Class not found")` → `ResourceNotFoundException` en español con el id. Reemplazar la lista, no sumarle.
- Borrar `findByDayOfWeek` del repositorio (no tiene usos).

---

## T2 — Migración de clases con un solo día

**Toca:** `config/GroupClassDaysMigration.java` (nuevo), `src/test/java/.../config/GroupClassDaysMigrationTest.java` (nuevo)
**Depende de:** T1
**Tamaño:** S
**Cubre:** AC-0003-07, AC-0003-08

- `ApplicationRunner` transaccional: para cada clase con `daysOfWeek` vacío y `legacyDayOfWeek` no null → `daysOfWeek = [legacy]`, `legacy = null`. Con `legacy` null o inválido: log de advertencia y seguir.
- Exponer el trabajo en un método público (`migrar()`) para que el test lo llame dos veces y verifique idempotencia, sin depender del arranque.

---

## T3 — Tipos, servicio y vista semanal

**Toca:** `types/index.ts`, `services/classService.ts` (si hace falta ajustar el tipo del payload), `pages/ClassesPage.tsx` (vista semanal y selector de asignación), `pages/ClassesPage.test.tsx` (nuevo)
**Depende de:** T1 (contrato)
**Tamaño:** M
**Cubre:** AC-0003-09, AC-0003-12

- `GroupClass.dayOfWeek: string` → `daysOfWeek: string[]`.
- Vista semanal: `c.daysOfWeek.includes(day)` en lugar de `c.dayOfWeek === day` (las dos apariciones, líneas ~224 y ~230).
- Selector de asignación (línea ~398): días traducidos con `TRANSLATIONS`, unidos con coma.

---

## T4 — Formulario de alta y edición con varios días

**Toca:** `pages/ClassesPage.tsx` (formularios de alta y edición), `pages/ClassesPage.test.tsx`
**Depende de:** T3 (mismo archivo)
**Tamaño:** M
**Cubre:** AC-0003-10, AC-0003-11

- El estado del formulario pasa de `dayOfWeek: 'MONDAY'` a `daysOfWeek: []` (las tres inicializaciones: líneas ~38, ~97 y ~128) y se carga desde la clase al editar (línea ~250).
- Reemplazar el `<select>` de día por un grupo de checkboxes o botones toggle, uno por día, en **los dos** formularios (líneas ~473 y ~539). Sin día elegido: no se llama al servicio y se muestra un mensaje.
