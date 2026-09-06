# Plan de Modularización - Backend (Modular Monolith)

Este plan describe la transición de una arquitectura de capas tradicional a una **Arquitectura de Monolito Modular** utilizando **Feature Flags**. Es la opción más sencilla y robusta para permitir activaciones selectivas de módulos.

## 1. Estrategia: Package-by-Feature + Conditional Activation
En lugar de agrupar por tipo técnico (Controller/Service), agruparemos por funcionalidad de negocio. Cada módulo será "dueño" de su lógica y se activará mediante propiedades de Spring.

## 2. Fases de Implementación

### Fase 1: Reorganización de Paquetes (COMPLETADO)
Mover las clases actuales de paquetes transversales a paquetes por módulo:
*   `com.aplicacionGym.gymapp.modules.core`: (Auth, Security, Config)
*   `com.aplicacionGym.gymapp.modules.clients`: (Client, ClientInfo)
*   `com.aplicacionGym.gymapp.modules.routines`: (Routine, Exercise)
*   `com.aplicacionGym.gymapp.modules.payments`: (Payment, MonthlyType, Product)
*   `com.aplicacionGym.gymapp.modules.attendance`: (Assistance)

### Fase 2: Configuración de Feature Flags (COMPLETADO)
Definir un prefijo común en `application.properties`:
```properties
gym.modules.payments.enabled=true
gym.modules.routines.enabled=true
gym.modules.attendance.enabled=true
```

### Fase 3: Activación Condicional (COMPLETADO)
Aplicar la anotación `@ConditionalOnProperty` en los puntos de entrada:
*   **Controllers**: Si el módulo está desactivado, los endpoints no se exponen (devuelven 404).
*   **Services/Beans**: Si el módulo está desactivado, Spring no instancia los objetos, ahorrando memoria.

### Fase 4: Desacoplamiento de Base de Datos (COMPLETADO)
*   **Flyway**: Mantener las migraciones, pero prefijar las tablas por módulo (ej: `pay_payments`, `rout_exercises`) para facilitar una futura extracción a microservicios si fuera necesario.

## 3. Beneficios
1.  **Flexibilidad**: Puedes desplegar versiones "Lite" del sistema simplemente cambiando un archivo de configuración.
2.  **Mantenibilidad**: Es más fácil encontrar errores cuando toda la lógica de un módulo está en una sola carpeta.
3.  **Seguridad**: Si un módulo está desactivado, su superficie de ataque es cero.
