# 📓 Bitácora QA — GymApp

> Registro cronológico de sesiones de prueba, bugs y decisiones.

---

## 📅 Sesión 01 — 05 Sep 2026
**Tester:** Agustín | **Branch:** `feat/offline-pwa` | **Ambiente:** Dev local

---

### 🔴 BUGS CRÍTICOS — rompen funcionalidad

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-01 | Dashboard | KPI "Total Profesores" no existe |
| BUG-02 | Dashboard | KPI "Stock Bajo" no existe |
| BUG-03 | Clientes | Se puede crear cliente sin DNI — sin validación FE ni BE |
| BUG-04 | Pagos | No se puede registrar venta de producto — cliente seleccionado no se muestra |
| BUG-05 | Pagos | Error crudo expuesto: `"Professor not found with id: 1"` |
| BUG-06 | Pagos | Lista no diferencia cuota mensual de venta de producto |
| BUG-07 | Clases | Clase solo permite un día — debería permitir múltiples días |

---

### 🟠 BUGS DE EXPERIENCIA — flujo confuso

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-08 | Clientes | Toast "Error al crear cliente" genérico — sin info (DNI dup, campos faltantes) |
| BUG-09 | Pagos | Error al pagar si cliente ya tiene suscripción activa — mensaje críptico |
| BUG-10 | Asistencias | Error al registrar sin descripción clara (¿cuota vencida?) |
| BUG-11 | Pagos | Selector de profesor visible para todos los roles — debería auto-asignarse |
| BUG-12 | Pagos/Clientes | Selects sin buscador — 159+ clientes, inoperable |
| BUG-13 | Ejercicios | Sin agrupación por grupo muscular — lista plana |
| BUG-14 | Rutinas | "Marcar sesión hecha" — texto overflow, no entra en el botón |

---

### 🎨 ISSUES DE DISEÑO / UX

| ID | Área | Descripción |
|:---:|:---|:---|
| DES-01 | Global | Inputs con fondo oscuro/negro — ilegibles. Solo modo white |
| DES-02 | Global | Layout no ocupa 100% del ancho de pantalla |
| DES-03 | Global | Toast en esquina — debería estar centrado |
| DES-04 | Global | Colores de texto sin contraste suficiente |
| DES-05 | DesignSystem | Modales de confirmación/cancelación no existen |
| DES-06 | DesignSystem | Componente de error no está en el DesignSystem |
| DES-07 | Clientes | Botón "Nuevo Alumno" — "+" arriba, texto abajo, mal formateado |
| DES-08 | Clientes | Card "GRASA CORPORAL" — colores grises, datos ilegibles |
| DES-09 | Clientes | Sin toggle activo/inactivo inline en la fila de la tabla |
| DES-10 | Rutinas | Creación en modal con scroll — debe ser wizard multi-paso |
| DES-11 | Rutinas | Cards de rutinas sin formato consistente |
| DES-12 | Clases | Mucha info en poco espacio, difícil diferenciar clases |
| DES-13 | Global | ESC no cierra modales |

---

### 📝 Decisiones tomadas

1. **Alcance**: Primero Capa Admin completa → luego Entrenador → luego Alumno.
2. **Un solo modo visual**: 100% light/white. Se elimina dark mode.
3. **Selects buscables**: Todo combobox con +10 items tiene buscador. Componente único reutilizable.
4. **Mensajes de error**: Back retorna mensajes descriptivos en todos los 4xx. Front los muestra tal cual.
5. **Sesión de profesor**: PROFESSOR logueado → campo profesor se auto-completa. Solo ADMIN puede cambiarlo.
6. **Rutinas como Wizard**: Flujo multi-paso, no modal scrollable.
