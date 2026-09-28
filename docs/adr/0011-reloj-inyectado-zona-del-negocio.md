# 0011 — "Hoy" en el backend sale de un Clock inyectado con la zona del negocio

**Fecha:** 26/09/2026
**Estado:** Activa

## Contexto

El backend decidía qué día es "hoy" con `LocalDate.now()` y `LocalDateTime.now()`, que usan la zona de la JVM. La imagen de producción (`gymapp-back/Dockerfile`, `eclipse-temurin:21-jre-alpine`) no configura zona: el 26/09/2026 se verificó que el contenedor `gymapp-backend` corre en UTC. Entre las 21 y las 24 de Argentina el backend vivía en el día siguiente, y eso decidía reglas de negocio: rechazaba asistencias de cuotas que vencían ese día, marcaba deudores de más y dejaba pasar pagos duplicados. Ver la [spec 0010](../../specs/0010-backend-en-hora-argentina.md).

Había que elegir cómo fijar la zona.

## Decisión

**Un único bean `java.time.Clock` (`config/ClockConfig`) con la zona de la propiedad `app.zone-id`, por defecto `America/Argentina/Buenos_Aires`.** Todo el código de negocio pide la fecha con `LocalDate.now(clock)` o `LocalDateTime.now(clock)`. Nunca usa `now()` sin argumentos.

Un test (`NoSystemClockTest`, AC-0010-12) recorre `src/main/java` y falla si aparece un `now()` sin reloj fuera de los seeders.

**Patrón de test:** en los tests unitarios con Mockito, el reloj va como `@Spy`, no como `@Mock`:

```java
@Spy
private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));

@InjectMocks
private AssistanceService assistanceService;
```

Con `@Mock Clock`, `LocalDate.now(clock)` recibe `null` de `getZone()` y lanza `NullPointerException`. Los tests con `@SpringBootTest` que necesitan una hora fija reemplazan el bean con un `@TestConfiguration` que devuelve un `Clock.fixed(...)` con `@Primary`.

## Alternativas consideradas

- **Configurar la zona de la JVM** (`ENV TZ` o `-Duser.timezone` en el Dockerfile, o `TimeZone.setDefault` en `main`). Es un cambio de una línea, pero deja el código dependiendo de una configuración externa que se pierde al cambiar de imagen o de plataforma, y la imagen Alpine no trae `tzdata`. Además, los tests seguirían corriendo en la zona de la máquina de cada uno: no habría forma de probar "a las 21:40 del 24/09" sin tocar estado global. Descartado.
- **Pasar la fecha siempre desde el frontend.** Ya lo hace en casi todos los flujos (spec 0008), pero los chequeos de vencimiento y de deudores corren en el backend sin fecha de entrada. Descartado como solución general.

## Consecuencias

- Los servicios que deciden fechas tienen una dependencia más (`Clock`). Es lo que permite testear el borde de las 21:00 con un reloj fijo.
- Cambiar de zona (una sucursal en otro país) es una propiedad, no un cambio de código.
- `JwtUtil` sigue con `new Date()`: compara instantes (vencimiento del token) y no depende de la zona.
- Los seeders (`DataLoader`, `HeavyDataLoader`) quedan con `LocalDate.now()`: solo arman datos de desarrollo.
