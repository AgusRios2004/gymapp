# ⚙️ GEMINI.md - Rules & Architecture: Backend (`gymapp-back`)

Este documento establece la guía técnica, convenciones de código y arquitectura de software obligatoria para el desarrollo del **Backend** de GymApp.

---

## 🛠️ 1. Stack Tecnológico del Backend

- **JDK / Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3.5.0
- **Base de Datos:** MySQL 8.x (`mysql-connector-j`)
- **ORM / Persistencia:** Spring Data JPA / Hibernate
- **Seguridad:** Spring Security con filtro personalizado `JwtAuthenticationFilter` y utilidades de token `JwtUtil`.
- **Validación DTOs:** `spring-boot-starter-validation` (`@Valid`, `@NotNull`, `@NotBlank`, `@Min`, `@Max`, `@Size`).
- **Mapeo / Helpers:** Mappers estáticos/clases mapper (`RoutineMapper`, `PhysicalRecordMapper`, etc.) y Lombok (`@Getter`, `@Setter`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`).
- **Generación de PDFs:** OpenPDF 2.0.3

---

## 🏗️ 2. Arquitectura de Software en Capas

El backend debe seguir estrictamente la separación de responsabilidades en 5 capas principales:

```
com.aplicacionGym.gymapp/
├── config/                 # Configuración de Beans, SecurityConfig, DataLoader
├── controller/             # Controladores REST API (Endpoints)
├── dto/                    # Objetos de Transferencia de Datos
│   ├── request/            # DTOs de Entrada (Payloads)
│   └── response/           # DTOs de Salida (Respuestas estructuradas)
├── entity/                 # Entidades JPA (Tablas en BD)
│   └── enums/              # Enumeraciones del sistema
├── exception/              # Manejador global (GlobalExceptionHandler) y excepciones personalizadas
├── mapper/                 # Mapeadores entre Entity <-> DTO
├── repository/             # Interfaces Spring Data JPA
├── security/               # Componentes JWT y CustomUserDetailsService
└── service/                # Lógica de Negocio y Transacciones (@Transactional)
```

---

## 📏 3. Reglas de Codificación y Buenas Prácticas

### 3.1. Restricción de Entidades vs DTOs
- **NUNCA expongas una Entidad JPA directamente en las respuestas HTTP de los Controllers.**
- **Siempre** retorna un `WebApiResponse` envolviendo un `ResponseDTO` (o listas de DTOs).
- Los métodos `@PostMapping`, `@PutMapping`, `@PatchMapping` **deben** recibir un `RequestDTO` anotado con `@Valid`.

### 3.2. Formato Unificado de Respuestas API (`WebApiResponse`)
Todas las respuestas de los controladores deben retornar `ResponseEntity<WebApiResponse>` usando `WebApiResponseBuilder`:
```java
return ResponseEntity.ok(WebApiResponseBuilder.success("Mensaje descriptivo", dataDTO));
```

### 3.3. Manejo de Excepciones Globales
- No uses bloques `try-catch` genéricos vacíos o de log silencioso en los servicios.
- Lanza excepciones semánticas como `ResourceNotFoundException` o excepciones personalizadas de negocio.
- Toda excepción no capturada es interceptada por [`GlobalExceptionHandler.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/exception/GlobalExceptionHandler.java), retornando una respuesta estándar de error con código HTTP adecuado (400, 404, 409, 500).

### 3.4. Transaccionalidad
- Todos los servicios deben estar anotados con `@Transactional` a nivel de clase o método si realizan operaciones de escritura en la BD.

### 3.5. Nomenclatura de Endpoints REST
- Usar plurales en minúscula: `/api/clients`, `/api/routines`, `/api/physical-records`, `/api/exercise-logs`.
- Usar verbos HTTP adecuados:
  - `GET`: Obtener recurso o listado
  - `POST`: Crear recurso o ejecutar acción compleja (ej: `/assign`)
  - `PUT`: Actualización completa de recurso
  - `PATCH`: Actualización parcial
  - `DELETE`: Eliminar recurso

---

## 🔗 Enlaces a Documentación General

- 🗺️ [**`SITEMAP.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/SITEMAP.md)
- 📄 [**`GEMINI.md` Global**](file:///home/agustin_dev/WorkSpace/gymapp/docs/GEMINI.md)
- 🟢 [**Plan BE Fase 1 (`2026-29-07-be-perfil-objetivo-entrenamiento.md`)**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-be-perfil-objetivo-entrenamiento.md)
