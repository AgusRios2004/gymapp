# Tareas — 0012 — Deudor visible en la UI

Spec: [`0012-deudor-visible-en-la-ui.md`](./0012-deudor-visible-en-la-ui.md)

Tamaño relativo, no horas. Una sola tarea de backend (`@SpringBootTest` + `MockMvc` sobre H2).

---

## T1 — `ClientResponseDTO` serializa `isDebtor`

**Toca:** `dto/response/ClientResponseDTO.java`, `src/test/java/.../controller/ClientDebtorJsonTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0012-01, 02, 03, 04

- Test rojo primero. En H2: un alumno activo sin pagos, un alumno con una cuota vigente (pago de hoy, con el `Clock` fijo como en los tests de la spec 0010) y una clase con los dos asignados.
- Aserciones sobre el JSON crudo con `jsonPath`: `$.data.isDebtor` con valor, y `$.data.debtor` con `doesNotExist()`. Lo mismo sobre `$.data.content[*]` y sobre `/api/classes/{id}/students`.
- Anotar el getter con `@JsonProperty("isDebtor")` (ver la nota de riesgo de la spec). No renombrar el campo ni el getter: `ClientServiceTest` y los tests de la spec 0010 los usan.
- Correr los tests de las specs 0004 y 0010 antes de cerrar.
