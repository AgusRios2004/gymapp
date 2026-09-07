# CLAUDE.md — gymapp-back

Convenciones del backend. Las pautas de conducta transversales están en el
[`CLAUDE.md` de la raíz](../CLAUDE.md) y también mandan acá.

**Stack:** Java 17 · Spring Boot 3.5 · Spring Data JPA / Hibernate · MySQL 8 · Flyway ·
MapStruct · Lombok · Spring Security (JWT) · Hibernate Envers · Maven (`./mvnw`).

## 1. Anatomía de un módulo

```
modules/<modulo>/
├── controller/          @RestController — recibe y devuelve, sin lógica
├── dto/request/         lo que entra (…RequestDTO)
├── dto/response/        lo que sale (…ResponseDTO)
├── entity/              @Entity JPA (+ enums/ si el módulo los tiene)
├── mapper/              MapStruct: entity ↔ DTO
├── repository/          Spring Data: extiende JpaRepository
└── service/             la lógica de negocio vive acá
```

Módulos actuales: `core` (transversal), `clients`, `routines`, `payments`, `attendance`.
Todo lo compartido —seguridad, excepciones, `Person`, config, dashboard, reportes— vive en `core`.

## 2. Capas: no se saltean

**Controller → Service → Repository.** Un controller nunca inyecta un repository, y un repository
nunca contiene reglas de negocio.

- Inyección por constructor con `@RequiredArgsConstructor` y campos `private final`. Nunca
  `@Autowired` sobre el campo.
- Services: `@Service @RequiredArgsConstructor @Slf4j`.
- Controllers: `@RestController @RequestMapping("/api/<recurso>") @RequiredArgsConstructor`, más
  `@ConditionalOnProperty(name = "gym.modules.<modulo>.enabled", havingValue = "true")` si el módulo
  tiene feature flag (`payments`, `routines`, `attendance` lo tienen; `core` y `clients` no).
- Un controller devuelve `ResponseEntity<WebApiResponse>` armado con `WebApiResponseBuilder.success(mensaje, data)`.
  El `data` es siempre un DTO o una lista de DTOs — **nunca una entidad JPA** (arrastra lazy loading
  y expone el modelo interno).

## 3. Mapeo: MapStruct, no a mano

Cada módulo tiene su mapper con `@Mapper(componentModel = "spring", uses = {OtroMapper.class})`.

- Para actualizar una entidad existente: `updateEntityFromDto` con
  `@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)`.
- Campos que el DTO no debe pisar (`id`, `password`, relaciones): `@Mapping(target = "x", ignore = true)`
  explícito. MapStruct falla el build si queda un target sin mapear y sin ignorar — eso es
  intencional, no lo silencies con `unmappedTargetPolicy`.
- Si necesitás un mapeo nuevo, ampliá el mapper del módulo. No escribas conversiones a mano en el
  service.

## 4. Errores y validación

- Lanzá `ResourceNotFoundException` (404) desde el service cuando no existe el recurso, con el
  patrón ya usado: `.orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id))`.
- Reglas de negocio violadas: `IllegalArgumentException` (400) o las excepciones específicas ya
  existentes (`ClientInUseException`, `ExerciseInUseException`).
- **Prohibido `System.out.println` y `printStackTrace()` en código nuevo.** Logging con `log` de
  `@Slf4j`.
- Validación de entrada: anotaciones de `jakarta.validation` en el `RequestDTO` **y** `@Valid` en el
  parámetro del controller. Sin `@Valid` la anotación del DTO no se ejecuta — es el olvido más común.
- Argumentos que no pueden ser null en un service: `Objects.requireNonNull(x, "x cannot be null")`,
  como en `ClientService`.

### ⚠️ Dos inconsistencias conocidas — no las "arregles" de paso

1. **`GlobalExceptionHandler` no usa el envelope.** Los errores devuelven
   `Map<String,String>` con `{error, message}`, mientras que los éxitos devuelven `WebApiResponse`.
   Unificarlo es un cambio que toca el frontend: proponelo, no lo hagas al pasar.
2. **`WebApiResponse` serializa `succes`** (falta la `s`). El frontend declara `success?: boolean`
   en `ApiResponse<T>` y por eso siempre le llega `undefined` — no lo lee, usa `.data`. Corregir el
   typo sin tocar el front no rompe nada hoy, pero es un cambio de contrato: va con las dos puntas
   en el mismo PR.

Si tu tarea toca alguno de los dos puntos, decilo explícito en el reporte.

## 5. Base de datos y migraciones

- **`ddl-auto=validate`**: Hibernate no crea ni modifica tablas. El esquema lo maneja **Flyway**.
- Migraciones en `src/main/resources/db/migration/V<n>__Descripcion_En_Snake.sql`. El `<n>` siguiente
  al máximo existente (hoy `V5`), sin saltos ni duplicados.
- **Una migración aplicada es inmutable.** Flyway valida por checksum al arrancar: editar un `V*.sql`
  ya corrido hace fallar el arranque con `Migration checksum mismatch`. Todo cambio va en una
  migración nueva.
- Los datos semilla van en su propia migración (`V2__Seed_Data.sql` es el precedente), idempotentes
  siempre que se pueda (`INSERT ... ON DUPLICATE KEY UPDATE`).
- Tablas con prefijo por módulo (`cli_client`, ver `V4__Modular_Table_Prefixes.sql`): una entidad
  nueva lleva `@Table(name = "<pref>_<tabla>")` con el prefijo de su módulo.
- Auditoría con **Hibernate Envers** (`@Audited`): una entidad nueva auditable lo declara, y eso
  **crea tablas `_AUD`** — la migración tiene que crearlas también.
- Baja lógica: las entidades usan flag de activo / `deleted_at` (ver `V3__Envers_And_SoftDelete.sql`).
  No borres físicamente registros con historial.

## 6. Seguridad

- JWT: `JwtAuthenticationFilter` + `JwtUtil` + `CustomUserDetailsService`, configurado en
  `SecurityConfig`. Un endpoint nuevo queda protegido salvo que lo agregues explícitamente a las
  rutas públicas — **no lo agregues sin que te lo pidan**.
- Nunca devuelvas `password` ni hashes en un `ResponseDTO`: se ignoran en el mapper.
- Nada de credenciales ni URLs de base hardcodeadas: todo por variable de entorno
  (`application.properties` ya usa `${DB_URL}`, `${DB_USER}`, `${DB_PASSWORD}`).

## 7. Tests

- Viven en `src/test/java/com/aplicacionGym/gymapp/`, con JUnit 5 y `spring-boot-starter-test`
  (H2 disponible para tests de integración).
- Toda lógica de negocio nueva o modificada lleva test: happy path, no encontrado, y los casos borde
  propios. Referencia: `service/RoutineServiceVersioningTest.java`, `service/AssignmentTransactionTest.java`.
- Una tarea con tests sin escribir o fallando es **PARCIAL**, nunca COMPLETO.

## 8. Verificación

```bash
./mvnw -q compile            # compila (incluye el procesamiento de MapStruct/Lombok)
./mvnw test                  # tests
./mvnw -q package -DskipTests  # build del jar
./mvnw spring-boot:run       # ⚠️ levanta y corre Flyway: es del usuario, no tuyo
```

Verificá después de cada unidad coherente. Nunca reportes "debería compilar": pegá el output.
