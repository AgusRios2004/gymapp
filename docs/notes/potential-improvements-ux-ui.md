# Mejoras Potenciales - UX/UI

Este documento detalla las oportunidades de mejora en la experiencia de usuario e interfaz del sistema Functional Kids.

## 1. Interacción y Navegación
*   **[UX-01] Command Palette (Buscador Global)**: Implementar una barra de búsqueda tipo `Ctrl + K` (estilo Slack/Discord) que permita saltar rápidamente a un alumno, una rutina o registrar un pago desde cualquier pantalla.
*   **[UX-02] Drag & Drop en Rutinas**: Mejorar el creador de rutinas para que los ejercicios se puedan reordenar arrastrándolos, en lugar de usar botones de flechas.
*   **[UX-03] Quick Actions**: En la lista de alumnos, añadir botones de "acción rápida" (ej. un solo clic para marcar asistencia hoy) sin entrar al detalle.

## 2. Visualización de Datos
*   **[UI-01] Dashboard Interactivo**: Evolucionar los stats estáticos a gráficos más detallados (ej. ingresos vs gastos el último semestre, pico de asistencia por hora).
*   **[UI-02] Dark Mode**: Implementar soporte nativo para modo oscuro, reduciendo la fatiga visual para el personal administrativo que pasa muchas horas frente al panel.
*   **[UI-03] Mobile Experience (PWA)**: Optimizar las tablas para pantallas pequeñas (usar layouts de tarjetas en lugar de tablas horizontales) y asegurar que el registro de asistencia sea ultra-cómodo desde un celular.

## 3. Feedback y Errores
*   **[UX-04] Actualizaciones Optimistas**: Al marcar una asistencia o guardar un pago, la UI debería reflejar el éxito instantáneamente mientras el servidor responde en segundo plano.
*   **[UI-04] Sistema de Notificaciones**: Reemplazar los `alert()` de Axios por un centro de notificaciones más elegante y menos intrusivo.
