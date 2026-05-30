# Mejoras Potenciales - Backend

Análisis de mejoras técnicas y estructurales para el núcleo del sistema.

## 1. Integridad y Auditoría
*   **[BE-01] Auditoría de Datos**: Implementar **Hibernate Envers** para rastrear quién hizo qué cambios. (Ej: "¿Quién eliminó este pago?" o "¿Quién modificó la rutina de este alumno?").
*   **[BE-02] Soft Delete Avanzado**: Asegurar que todas las entidades clave tengan borrado lógico para evitar pérdida de datos accidental.
*   **[BE-03] Validación de Reglas de Negocio**: Mover validaciones complejas (ej. "un alumno no puede registrar asistencia si debe más de 2 meses") a una capa de validación dedicada.

## 2. Automatización y Notificaciones
*   **[BE-04] Jobs Programados (Spring Scheduling)**:
    *   Revisar diariamente qué membresías vencen hoy y marcar deudores automáticamente.
    *   Generar copias de seguridad de la base de datos automáticamente.
*   **[BE-05] Integración de Mensajería**: Implementar un servicio para envío automático de recordatorios de pago vía Email o integración con APIs de WhatsApp (ej. Twilio).

## 3. Escalabilidad y Rendimiento
*   **[BE-06] Caché de Segundo Nivel**: Implementar Redis o Caffeine para datos que no cambian seguido (ej. listado de ejercicios, tipos de membresía) y reducir la carga a la base de datos.
*   **[BE-07] Generación Asíncrona de Reportes**: Si los reportes PDF se vuelven pesados, procesarlos en segundo plano usando `@Async` para no bloquear el hilo de respuesta de la API.

## 4. Seguridad
*   **[BE-08] Refresh Tokens**: Implementar una rotación de tokens JWT más robusta para mejorar la seguridad sin obligar al usuario a loguearse constantemente.
*   **[BE-09] Rate Limiting**: Limitar el número de peticiones por IP para evitar ataques de fuerza bruta en el login.
