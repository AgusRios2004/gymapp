# Tareas — spec 0010: backend en hora argentina

> Spec: [`0010-backend-en-hora-argentina.md`](./0010-backend-en-hora-argentina.md) · Estado de la spec: `propuesta`
> Solo backend. Tamaños **relativos** entre sí (chica / media / grande), sin base histórica para estimar en horas.

| # | Tarea | Archivos | Depende de | AC | Tamaño |
|:---:|:---|:---|:---:|:---|:---:|
| T1 | **Reloj del negocio.** Bean `Clock` con la zona de `app.zone-id` (por defecto `America/Argentina/Buenos_Aires`). Una zona inválida corta el arranque con un mensaje claro. Escribir el ADR-0011 (reloj inyectado en vez de zona de la JVM) con el patrón de test `@Spy Clock clock = Clock.fixed(...)` | `config/ClockConfig.java`, `application.properties`, test de contexto, `docs/adr/0011-*.md`, `docs/SITEMAP.md` | — | AC-0010-01 | chica |
| T2 | **Vencimiento al registrar.** `AssistanceService` (cuota vencida) y `PaymentService` (fecha por defecto y chequeo de pago vigente) con `LocalDate.now(clock)` | `service/AssistanceService.java`, `service/PaymentService.java` y sus tests | T1 | AC-0010-02, 06 | media |
| T3 | **Deudores e ingresos del mes.** `ClientService`, `GroupClassService` y `DashboardService` con el reloj | `service/ClientService.java`, `service/GroupClassService.java`, `service/DashboardService.java` y sus tests | T1 | AC-0010-03, 04, 05 | media |
| T4 | **Fechas por defecto.** `WaterLogService`, `SupplementService`, `NutritionService`, `ExerciseLogService` y `RoutineService`, y los controllers `WaterLogController`, `SupplementController` y `NutritionController` | esos 8 archivos y sus tests | T1 | AC-0010-07, 08, 09 | media |
| T5 | **PDF de cierre.** Formateador de montos con la regla de `formatMoney` (`NumberFormat` `es-AR`), "Emitido el" con el reloj, y nombre del archivo de `ReportController` con el reloj. El test extrae el texto del PDF con `PdfTextExtractor` de OpenPDF | `service/ReportService.java`, `controller/ReportController.java`, `util/MoneyFormatter.java` (nuevo) y sus tests | T1 | AC-0010-10, 11 | media |
| T6 | **Guardián y cierre.** Test que recorre `src/main/java` buscando `LocalDate.now()`/`LocalDateTime.now()` sin argumentos fuera de los seeders. Pasar la spec a `implementada` y cerrar BUG-18 y BUG-20 en la bitácora de QA (y anotar BUG-21) | `src/test/.../NoSystemClockTest.java`, `specs/0010-*.md`, `docs/notes/BITACORA_QA.md` | T2–T5 | AC-0010-12 | chica |

## Orden

```
      ┌──► T2 ──┐
      ├──► T3 ──┤
T1 ───┼──► T4 ──┼──► T6
      └──► T5 ──┘
```

Después de T1, las tareas T2 a T5 tocan archivos distintos y son independientes entre sí. T6 va al final: el guardián falla mientras quede algún `now()` sin reloj.

## Choques de archivo a tener en cuenta

- **`ClientServiceTest.java`:** ya existe (spec 0007, H-0007-2-01) y usa `@InjectMocks`. T3 le agrega el `@Spy Clock`. Sin el spy, el test existente de H-0007-2-01 va a romper con `NullPointerException` apenas `ClientService` use el reloj.
- **Tests con `@SpringBootTest`** (`AssistanceStaffFromSessionTest`, `PaymentStaffFromSessionTest`, `InactiveClientRulesTest`, etc.): usan el `Clock` real del contexto. Si alguno arma fechas de vencimiento con `LocalDate.now()` en el test, entre las 21 y las 24 puede quedar desfasado del reloj del servicio. T2 y T3 los revisan al tocar esos servicios.
- **`application.properties`:** solo lo toca T1.
