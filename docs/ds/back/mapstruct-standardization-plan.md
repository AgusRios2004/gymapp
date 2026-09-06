# Plan de Estandarización de Mapeos (MapStruct)

Este plan detalla las acciones necesarias para eliminar el mapeo manual y unificar la estrategia de transformación de datos entre Entidades y DTOs en el backend utilizando **MapStruct**.

## 1. Diagnóstico Actual
Tras una auditoría del código, se detectaron tres problemas principales que generan "overhead" y dificultan el mantenimiento:
*   **Mapeos Manuales en Mappers**: Uso de `@Mapper` pero con implementación manual de métodos (uso de `new DTO()` y `setters`).
*   **Lógica de Mapeo en Servicios**: Servicios que instancian DTOs directamente, mezclando lógica de negocio con transformación de datos.
*   **Actualizaciones Manuales**: Bloques extensos de `setters` en los métodos `update` de los servicios para pasar datos del DTO a la Entidad existente.

## 2. Objetivos
1.  **Eliminar el código "Boilerplate"**: Que MapStruct genere el 100% de los mapeos simples.
2.  **Separación de Responsabilidades**: Los servicios no deben conocer la estructura interna de los DTOs de respuesta.
3.  **Inmutabilidad y Consistencia**: Garantizar que todas las transformaciones sigan las mismas reglas.

## 3. Fases de Implementación

### Fase 1: Limpieza de Mappers Híbridos (COMPLETADO)
Refactorizar los mappers que actualmente tienen lógica manual para que utilicen anotaciones de MapStruct:
*   **`PaymentMapper`**: Eliminar la lógica manual de `toDTO` y usar `@Mapping` para resolver las relaciones con `Client` y `Professor`.
*   **`AssistanceMapper`**: Convertir la implementación manual en una interfaz de MapStruct pura.
*   **`AdministratorMapper`**: Eliminar métodos `default` que hacen mapeo manual.

### Fase 2: Extracción de Mapeos desde Servicios (COMPLETADO)
Mover la instanciación de DTOs desde la capa de Service a la capa de Mapper:
*   **`AuthService`**: Crear un método en `UserMapper` (o similar) para generar el `LoginResponseDTO`.
*   **`ClientService`**: Mover el mapeo de `ProductsPurchasedResponseDTO` al mapper de pagos o clientes.
*   **`DashboardService`**: Centralizar la construcción de `DashboardStatsDTO`.

### Fase 3: Implementación de Mapeos de Actualización (Updates) (COMPLETADO)
Sustituir los bloques de `setters` en los servicios por métodos de actualización de MapStruct:
*   Añadir en los mappers: 
    ```java
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(RequestDTO dto, @MappingTarget Entity entity);
    ```
*   Aplicar en: `ClientService`, `GroupClassService`, `ProfessorService` y `RoutineService`.

### Fase 4: Validación y Eliminación de Dead Code (COMPLETADO)
*   Verificar que no queden referencias a `new *DTO()` fuera de los mappers o builders específicos.
*   Asegurar que todos los mappers usen `componentModel = "spring"`.

## 4. Beneficios Esperados
1.  **Reducción de Código**: Eliminación de cientos de líneas de código repetitivo y propenso a errores.
2.  **Facilidad de Cambio**: Cambiar un campo en la base de datos solo requerirá actualizar una anotación en el Mapper.
3.  **Legibilidad**: Los métodos de servicio se centrarán exclusivamente en la lógica de negocio (ej: validaciones, persistencia).
