---
id: 0012
titulo: Deudor visible en la UI — el campo `isDebtor` llega al frontend
estado: aprobada           # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 29/09/2026
adrs_relacionados: [ADR-0011]
---

## Objetivo

Que la recepción vea qué alumnos deben la cuota: en la ficha ("Cuota vencida"), en la lista de alumnos, en Asistencia, en Pagos y en los alumnos de una clase. Hoy ninguna pantalla marca a ningún alumno como deudor.

Crítico encontrado en la pasada previa de la [QA Sesión 02](../docs/notes/QA_SESION_02.md) (29/09/2026). Hace fallar el paso 7.6 y deja datos mal a la vista en la ficha.

## Contexto (lo que pasa hoy)

`ClientResponseDTO` tiene el campo `boolean isDebtor` con el getter `isDebtor()`. Jackson toma el getter como la propiedad `debtor`, así que el JSON trae `"debtor": true`. El frontend lee `client.isDebtor`, que nunca llega, y lo toma como `false`:

- Ficha (`ClientDetailPage`): dice "Cuota al día" a un alumno con la cuota vencida (visto con Bruno Ramírez, `debtor: true`).
- Lista (`ClientItem`), Asistencia, Pagos (`⚠️ (DEUDOR)` en el buscador) y el modal de alumnos de una clase (etiqueta "Deuda"): nunca aparece la marca.
- El filtro "Deudores" de la lista sí funciona, porque filtra en el servidor.

Los tests no lo detectaron porque cada lado prueba contra su propio supuesto: los del backend leen el getter del DTO (AC-0010-03) y los del frontend mockean `isDebtor`.

## Restricciones

- **El nombre del contrato es `isDebtor`.** Es el que usan el tipo `Client` del frontend, sus tests y el texto de la spec 0010. La corrección va en el backend, no en el frontend.
- La regla de quién es deudor no cambia: la define la spec 0010 (reloj del negocio, una cuota que vence hoy no está vencida; ver ADR-0011).
- El filtro `debtors` de `GET /api/clients` no cambia.

## Comportamiento esperado

1. Toda respuesta que serializa un `ClientResponseDTO` trae la clave `isDebtor` (boolean) y **no** trae la clave `debtor`.
2. El valor es el mismo que calcula hoy el servicio: no se toca la lógica.
3. Con eso, las pantallas que ya leen `isDebtor` muestran la marca sin cambios en el frontend.

## Casos de borde

- **Alumno sin ningún pago:** `isDebtor: true` (igual que hoy con `debtor`).
- **Cuota que vence hoy, pasadas las 21:00:** `isDebtor: false` (spec 0010).
- **Alumno inactivo con la cuota vencida:** sigue el cálculo actual; esta spec no cambia la regla.
- **Lista paginada y alumnos de una clase:** usan el mismo DTO, así que tienen que traer la misma clave.
- **Requests del frontend que reenvían el objeto cliente con `isDebtor`** (por ejemplo, al editar): el backend lo ignora igual que hoy ignora `debtor`; no es un dato editable.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0012-01 | `GET /api/clients/{id}` de un alumno activo sin pagos responde `data.isDebtor == true`, y `data` no tiene la clave `debtor`. |  |
| AC-0012-02 | `GET /api/clients/{id}` de un alumno con una cuota vigente responde `data.isDebtor == false`. |  |
| AC-0012-03 | En `GET /api/clients` (paginado), cada elemento de `data.content` trae `isDebtor` y ninguno trae `debtor`; el alumno sin pagos sale con `isDebtor == true`. |  |
| AC-0012-04 | `GET /api/classes/{id}/students` trae `isDebtor == true` para el alumno sin pagos de esa clase y `isDebtor == false` para el que tiene la cuota vigente. |  |

## Fuera de alcance

- **Cambios en el frontend.** Ya lee `isDebtor` en todas las pantallas; si el backend cumple AC-01 a AC-04, la marca aparece. Los tests de UI existentes (por ejemplo, "Cuota vencida" en `ClientDetailPage.test.tsx`) ya cubren cómo se muestra.
- **Otros campos boolean con prefijo `is` en DTOs.** Hoy no hay otro (`grep "private boolean is"` sobre `dto/` solo devuelve este). Si aparece uno, entra en la misma convención.
- **Un test de contrato que compare los tipos de TypeScript con los DTOs de Java.** Sería lo que habría detectado esto, pero es una herramienta nueva, no la corrección del crítico.

## Notas de handoff

- **Asumido:** corregir el backend es más barato y menos riesgoso que renombrar en el frontend (seis archivos más sus tests), y deja la spec 0010 con el nombre que ya usa.
- **Pregunta abierta:** ninguna que bloquee.
- **Lo más probable que salga mal:** poner `@JsonProperty("isDebtor")` en el campo y dejar el getter `isDebtor()` hace que Jackson emita **las dos** claves (`isDebtor` y `debtor`) o solo `debtor`, según cómo resuelva la propiedad. AC-01 exige que `debtor` no exista justamente para detectarlo. La anotación va en el getter (o se usa `@JsonProperty` en el campo junto con `@JsonIgnore` en el getter); lo decide el test, no la intuición.
