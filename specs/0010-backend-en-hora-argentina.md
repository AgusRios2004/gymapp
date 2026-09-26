---
id: 0010
titulo: Backend en hora argentina — vencimientos, deudores y PDF de cierre sin corrimiento
estado: propuesta             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 26/09/2026
adrs_relacionados: []
---

## Objetivo

El backend decide qué día es "hoy" con `LocalDate.now()` y `LocalDateTime.now()`, que usan la zona de la JVM. La imagen de Docker (`eclipse-temurin:21-jre-alpine`) no configura zona, así que corre en **UTC**. En Argentina (UTC−3), entre las 21:00 y las 24:00 el backend ya vive en el día siguiente. Es el mismo bug que la [spec 0008](./0008-fechas-en-hora-local.md) corrigió en el frontend, pero acá decide reglas de negocio:

- **Asistencia rechazada:** un alumno con la cuota vencida *hoy* que llega a las 21:30 recibe "La membresía del alumno ha vencido", porque para el backend ya es mañana.
- **Deudores de más:** la lista de clientes, los alumnos de una clase y el contador del dashboard marcan como deudor a quien vence hoy.
- **Pago duplicado permitido:** el chequeo de "Ya existe un pago del plan … vigente" deja pasar un segundo cobro del mismo plan a un alumno que vence mañana.
- **Ingresos del mes:** el 30/09 a las 22:00, el dashboard suma los ingresos de octubre (cero).
- **PDF de cierre:** "Emitido el" sale con 3 horas de diferencia, y los montos salen como `$150000.00` (`String.format("%.2f")`, sin separador de miles), a diferencia del formato de la [spec 0009](./0009-formato-de-montos.md).

Registrado como BUG-18 y BUG-20 en la [bitácora de QA](../docs/notes/BITACORA_QA.md). Lo sufre el admin y, sobre todo, el alumno al que no dejan entrar.

## Restricciones

- El contrato de la API no cambia: las fechas siguen viajando como `LocalDate` (`AAAA-MM-DD`) y el frontend no se toca.
- No se agrega una librería. `java.time.Clock` y `java.text.NumberFormat` alcanzan.
- La zona del negocio es **`America/Argentina/Buenos_Aires`**, configurable por propiedad para no hardcodearla en el código.
- Los tests del backend corren sin MySQL, con el perfil de H2 de la Fase 0, y no pueden depender de la zona de la máquina.

## Comportamiento esperado

### A. Un único reloj con la zona del negocio

1. Existe un bean `java.time.Clock` con la zona de la propiedad `app.zone-id`, que por defecto es `America/Argentina/Buenos_Aires`.
2. Todo el código de `src/main/java` que hoy llama a `LocalDate.now()` o `LocalDateTime.now()` sin argumentos pasa a usar ese reloj (`LocalDate.now(clock)`). Eso incluye:
   - **Vencimientos y deudores:** `AssistanceService`, `PaymentService`, `ClientService`, `GroupClassService` y `DashboardService`.
   - **Fechas por defecto cuando no llega una:** `WaterLogService`, `SupplementService`, `NutritionService`, `ExerciseLogService` y `RoutineService`, y los controllers `WaterLogController`, `SupplementController` y `NutritionController`.
   - **Hora de emisión del PDF:** `ReportService` y el nombre del archivo en `ReportController`.
3. Quedan afuera los seeders (`DataLoader`, `HeavyDataLoader`), que solo generan datos de desarrollo, y `JwtUtil`, que compara instantes (`new Date()`) y no depende de la zona.
4. Un test recorre `src/main/java` y falla si aparece un `LocalDate.now()` o `LocalDateTime.now()` sin argumentos fuera de los seeders.

### B. Montos del PDF en formato argentino

5. Los montos del PDF de cierre ("Ingresos Mensuales" y "Promedio por Cliente") se formatean con la misma regla que `formatMoney` del frontend: `$` pegado, punto para los miles, sin decimales si es entero y con dos decimales y coma si no lo es.
6. "Emitido el" muestra la fecha y hora de Argentina (`dd/MM/yyyy HH:mm hs`).

## Casos de borde

- **21:40 del 24/09 en Argentina** (00:40 UTC del 25): para el backend es el 24. Es el caso central de todos los AC.
- **00:10 del 25/09 en Argentina** (03:10 UTC): ya es el 25. La cuota que vencía el 24 ahora sí está vencida. Esto evita "arreglar" el bug corriendo la fecha un día para el otro lado.
- **Cambio de mes a la noche** (30/09 a las 22:00 en Argentina): los ingresos del dashboard son los de septiembre.
- **Cuota que vence hoy:** no está vencida (se mantiene el `isBefore(hoy)` actual) y el alumno puede entrar hasta las 23:59 de Argentina.
- **Propiedad `app.zone-id` inválida:** la aplicación no levanta, y el error dice qué valor falló. Es preferible a arrancar en UTC sin avisar.
- **Horario de verano:** Argentina no lo usa hoy. Si volviera, `ZoneId` lo resuelve sin cambios de código.

## Criterios de aceptación

En todos los tests el reloj se fija con `Clock.fixed(<instante>, ZoneId.of("America/Argentina/Buenos_Aires"))`: nunca se depende de la zona de la máquina. "21:40" equivale a `2026-09-25T00:40:00Z` (24/09 21:40 en Argentina).

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0010-01 | Sin `app.zone-id`, el bean `Clock` del contexto tiene zona `America/Argentina/Buenos_Aires`. Con `app.zone-id=Europe/Madrid`, tiene zona `Europe/Madrid`. |  |
| AC-0010-02 | `AssistanceService`, alumno activo con la cuota que vence el `2026-09-24`: a las 21:40 del 24 registrar la asistencia **no** lanza "ha vencido". Con el reloj en `2026-09-25T03:10:00Z` (25/09 00:10) sí lo lanza. |  |
| AC-0010-03 | `ClientService`, alumno con la cuota que vence el `2026-09-24`, a las 21:40 del 24: el DTO del cliente tiene `isDebtor = false`, tanto en la lista como en `getClientById`. |  |
| AC-0010-04 | `GroupClassService.getStudentsByClass`, con ese mismo alumno inscripto y a la misma hora: el DTO tiene `isDebtor = false`. |  |
| AC-0010-05 | `DashboardService`: a las 21:40 del 24/09, ese alumno no cuenta en `debtorsCount`. Con el reloj en `2026-10-01T01:00:00Z` (30/09 22:00), `sumAmountByMonth` se llama con `9`. |  |
| AC-0010-06 | `PaymentService`: un pago mensual sin `date` a las 21:40 del 24/09 se guarda con fecha `2026-09-24`. Un segundo pago del **mismo plan** a un alumno cuya cuota vence el `2026-09-25`, a esa misma hora, lanza "Ya existe un pago del plan … vigente". |  |
| AC-0010-07 | `WaterLogService` y `SupplementService` sin fecha, y `GET` de `WaterLogController` y `SupplementController` sin el parámetro `date`, a las 21:40 del 24/09: usan `2026-09-24`. |  |
| AC-0010-08 | `NutritionService` y `ExerciseLogService` guardan el registro sin fecha con `2026-09-24` a las 21:40 del 24/09. El `GET` de `NutritionController` sin `date` consulta `2026-09-24`. |  |
| AC-0010-09 | `RoutineService.assignComplexRoutine` sin `startDate`, a las 21:40 del 24/09: la `ClientRoutine` queda con `startDate = 2026-09-24`. |  |
| AC-0010-10 | `ReportService`, con `monthlyRevenue = 150000` y 8 alumnos activos, a las 21:40 del 24/09: el texto del PDF contiene `$150.000`, `$18.750` y `Emitido el: 24/09/2026 21:40 hs`, y no contiene `150000.00`. |  |
| AC-0010-11 | `GET /reports/monthly` a las 21:40 del 24/09 responde con `Content-Disposition` `attachment; filename=Reporte_GYM_2026_09_24_2140.pdf`. |  |
| AC-0010-12 | Un test que recorre `src/main/java` no encuentra `LocalDate.now()` ni `LocalDateTime.now()` sin argumentos fuera de `config/DataLoader.java` y `config/HeavyDataLoader.java`. Si se agrega uno, el test falla y nombra el archivo y la línea. |  |

## Fuera de alcance

- **La suma de ingresos del mes ignora el año** (`MONTH(p.date) = :month` en `PaymentRepository.sumAmountByMonth`). En septiembre de 2027 sumaría también los pagos de septiembre de 2026. Es un bug de la consulta, no de la zona horaria, y se anota como BUG-21. AC-0010-05 solo verifica que el mes que se pide sea el correcto.
- **Configurar la zona en la imagen de Docker** (`TZ` o `-Duser.timezone`). Con el `Clock` inyectado, el código deja de depender de la zona de la JVM. Configurarla también ocultaría el bug en producción sin arreglarlo en los tests, y la imagen Alpine no trae `tzdata`.
- **Los seeders** (`DataLoader`, `HeavyDataLoader`). Solo arman datos de desarrollo; un día de diferencia ahí no afecta a nadie.
- **La zona de la conexión JDBC.** Las fechas de negocio son columnas `DATE` mapeadas a `LocalDate`, que Hibernate no corre de zona. Si aparece un corrimiento en la base, es otro bug.
- **Mensajes con fechas en formato ISO** ("vigente hasta 2026-09-25", "ha vencido el: 2026-09-24"). Mostrarlas como `DD/MM/AAAA` es un cambio de texto que afecta a los toasts del frontend. Se puede sumar a una spec de mensajes.

## Notas de handoff

**Qué se asumió:**
- La zona es `America/Argentina/Buenos_Aires` para todo el negocio. No hay sucursales en otras zonas.
- El mecanismo es un `Clock` inyectado, no configurar la zona de la JVM. Es una decisión de arquitectura: T1 la registra como ADR-0011.
- Los montos del PDF siguen la misma regla que `formatMoney` del frontend (spec 0009), así el mismo número se ve igual en la app y en el PDF.

**Preguntas abiertas:**
1. ¿Sumamos BUG-21 (ingresos del mes sin año) a esta spec? Toca el mismo cálculo de `DashboardService` que AC-0010-05, pero es otro bug. Lo dejé afuera para no mezclar.
2. ¿Producción corre en la imagen de Docker (UTC) o en otro lado? Si ya corre con zona argentina, hoy el bug no se ve en producción, pero la spec sigue valiendo para no depender de eso.

**Lo más probable que salga mal:**
- **Que un servicio quede usando `LocalDate.now()` sin argumentos** porque el reloj no llegó a un camino poco transitado. AC-0010-12 existe para eso: recorre el código en vez de confiar en que la lista de la sección A esté completa.
- **Los tests de Mockito con `@InjectMocks`** no inyectan un `Clock` real salvo que se declare como `@Spy` (`@Spy Clock clock = Clock.fixed(...)`). Con `@Mock Clock`, `LocalDate.now(clock)` explota con `NullPointerException` porque `getZone()` devuelve `null`. T1 deja el patrón escrito en el ADR para que las tareas siguientes lo copien.
- **Los tests que levantan el contexto completo** (`@SpringBootTest`) van a usar el `Clock` real, en la zona del negocio. Los que dependían sin querer de UTC pueden cambiar de comportamiento entre las 21 y las 24. Correr la suite completa al cerrar cada tarea.
