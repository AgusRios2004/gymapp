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

### [BE-01] Inyección por Constructor
*   **Problema**: Uso extensivo de `@Autowired` en campos privados.
*   **Solución**: Migrar a inyección por constructor para mejorar la testabilidad y garantizar inmutabilidad.
*   **Recomendación**: Usar `@RequiredArgsConstructor` de Lombok.

### [BE-02] Optimización de Consultas (Problema N+1)
*   **Problema**: En `ClientService.mapToDTOWithDebtorStatus`, se realiza una consulta de pago por cada cliente en un stream.
*   **Solución**: Implementar `JOIN FETCH` o consultas personalizadas en el repositorio para traer los datos necesarios en una sola transacción.

### [BE-03] Delegación de Filtrado a la DB
*   **Problema**: Filtrado de estados (ej. `active`) realizado en memoria en el controlador.
*   **Solución**: Mover la lógica de filtrado a métodos de búsqueda de Spring Data JPA (ej. `findByActiveTrue()`).

### [BE-04] Automatización de Mapeos (MapStruct)
*   **Problema**: Mappers manuales propensos a errores y tediosos de mantener.
*   **Solución**: Integrar **MapStruct** para generar automáticamente los mapeos entre Entidades y DTOs.

### [BE-05] Registro Profesional (Logging)
*   **Problema**: Uso de `System.out.println` para depuración.
*   **Solución**: Implementar SLF4J con `@Slf4j` para un logueo estructurado y configurable por niveles (INFO, WARN, ERROR).
