# Revisión Arquitectónica y Propuestas de Mejora - Backend

Este documento resume el análisis realizado por el **Arxitect** sobre el módulo `@gymapp-back/`.

## 1. Resumen del Sistema
Sistema de Gestión de Gimnasio desarrollado con **Java 17** y **Spring Boot 3.5**. Utiliza una arquitectura clásica de tres capas (Controller-Service-Repository) con persistencia en MySQL y gestión de esquemas mediante Flyway.

### Módulos Principales:
*   **Clients**: Gestión de socios y estados de deuda.
*   **Routines & Exercises**: Definición y asignación de planes de entrenamiento.
*   **Assistance**: Control de acceso y registro de ingresos.
*   **Payments & Sales**: Facturación de membresías y venta de productos.
*   **Reports**: Generación de PDFs para cierre de mes.

## 2. Fortalezas Detectadas
*   **Arquitectura Limpia**: Clara separación de responsabilidades.
*   **Seguridad**: Implementación stateless con Spring Security y JWT.
*   **Uso de DTOs**: Protección de entidades de base de datos en la capa de transporte.
*   **Estrategia de Excepciones**: Manejo global centralizado para respuestas API consistentes.

## 3. Propuestas de Mejora (Roadmap)

### [BE-01] Inyección por Constructor (COMPLETADO)
*   **Problema**: Uso extensivo de `@Autowired` en campos privados.
*   **Solución**: Migrar a inyección por constructor para mejorar la testabilidad y garantizar inmutabilidad.
*   **Resultado**: Se migró el 100% de las inyecciones por campo a inyección por constructor con `@RequiredArgsConstructor` en controladores, servicios y clases de configuración.

### [BE-02] Optimización de Consultas (Problema N+1) (COMPLETADO)
*   **Problema**: En `ClientService.mapToDTOWithDebtorStatus`, se realiza una consulta de pago por cada cliente en un stream.
*   **Solución**: Implementar `JOIN FETCH` o consultas personalizadas en el repositorio para traer los datos necesarios en una sola transacción.
*   **Resultado**: Se optimizó implementando carga en lote con la consulta `findLatestMonthlyPaymentsByClientIds` para resolver la deuda en una sola transacción.

### [BE-03] Delegación de Filtrado a la DB (COMPLETADO)
*   **Problema**: Filtrado de estados (ej. `active`) realizado en memoria en el controlador.
*   **Solución**: Mover la lógica de filtrado a métodos de búsqueda de Spring Data JPA (ej. `findByActiveTrue()`).
*   **Resultado**: Se delegó la consulta y filtro de alumnos activos/inactivos directamente a la base de datos a través de Spring Data JPA.

### [BE-04] Automatización de Mapeos (MapStruct) (COMPLETADO)
*   **Problema**: Mappers manuales propensos a errores y tediosos de mantener.
*   **Solución**: Integrar **MapStruct** para generar automáticamente los mapeos entre Entidades y DTOs.
*   **Resultado**: Configurado y estandarizado en todos los mappers de las distintas features.

### [BE-05] Registro Profesional (Logging) (COMPLETADO)
*   **Problema**: Uso de `System.out.println` para depuración.
*   **Solución**: Implementar SLF4J con `@Slf4j` para un logueo estructurado y configurable por niveles (INFO, WARN, ERROR).
*   **Resultado**: Se reemplazaron todas las llamadas directas a `System.out` y `System.err` en `DataLoader` por logging profesional mediante `@Slf4j`.

## 4. Hallazgos Críticos de la Auditoría Reciente

Durante la última auditoría automatizada y estática del código, se detectaron los siguientes problemas críticos que deben priorizarse en el backlog de desarrollo:

### 4.1. Error Crítico en Soft-Delete (`@SQLDelete`)
* **Problema:** Tras el renombrado de tablas modular de la migración `V4__Modular_Table_Prefixes.sql`, las anotaciones `@SQLDelete` en `Person`, `Payment`, `Product` y `Routine` no se actualizaron. Siguen haciendo referencia a las tablas antiguas (`person`, `payment`, etc.).
* **Impacto:** Las operaciones de eliminación lógica (`delete` o `deleteById`) lanzan excepciones de SQL (tabla no encontrada) en producción.
* **Acción:** Cambiar los nombres de tabla en `@SQLDelete` a `core_person`, `pay_payment`, `pay_product` y `rout_routine` respectivamente.

### 4.2. Inyección Volátil de Firma JWT (`SECRET_KEY`)
* **Problema:** En `JwtUtil.java`, `SECRET_KEY` se inicializa dinámicamente en memoria (`Keys.secretKeyFor(...)`).
* **Impacto:** Cada reinicio de la aplicación invalida las sesiones de todos los usuarios conectados.
* **Acción:** Externalizar la clave en `application.properties` y cargarla de forma persistente.

### 4.3. Omisión de Mapeo de Precios en MapStruct (`ClientMapper`)
* **Problema:** En `ClientMapper.toProductsPurchasedResponseDTO`, el campo `price` queda sin mapear debido a la discrepancia de nombres con `unitPrice` de `PaymentProduct`.
* **Impacto:** El historial de compras de los clientes devuelve importes nulos.
* **Acción:** Agregar `@Mapping(source = "unitPrice", target = "price")`.

### 4.4. Discrepancia en la Validación del Teléfono (`ClientRequestDTO`)
* **Problema:** En `ClientRequestDTO.java`, el campo `phone` tiene la anotación `@Size(min = 10, max = 15)` pero el mensaje de error indica `"Phone must be between 7 and 15 characters"`.
* **Impacto:** Si un usuario intenta registrar un teléfono de menos de 10 caracteres (por ejemplo, de 7 a 9 caracteres, que es común), el backend rechaza la petición con una excepción de validación, a pesar de que el mensaje de error del DTO sugiere que es válido.
* **Acción:** Corregir la restricción `@Size(min = 7, max = 15)` en `ClientRequestDTO.java` para que coincida con el mensaje descriptivo y la lógica esperada.
