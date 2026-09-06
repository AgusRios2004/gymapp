# 📋 PRD — Plan de Refactor GymApp
> **Versión:** 1.0 | **Fecha:** 05 Sep 2026 | **Estado:** Activo

---

## 🎯 Visión del producto

Sistema de gestión de gimnasio estructurado en 3 capas progresivas:

```
CAPA 1 — ADMIN      → Gestión operativa completa (HOY)
CAPA 2 — ENTRENADOR → Rutinas inteligentes + LLM (PRÓXIMO)
CAPA 3 — ALUMNO     → Consumo de su plan (DESPUÉS)
```

**Regla de avance:** No empezar Capa 2 hasta que Capa 1 pase QA sin bugs críticos.

---

## 🏗️ Arquitectura — Reglas globales

- **Un solo tema visual**: 100% light/white. Sin dark mode.
- **Errores**: Backend retorna siempre mensajes descriptivos (`message` en body). Frontend los muestra literalmente al usuario en toast.
- **Selects**: Todo combobox con +10 items → componente `SearchableSelect` reutilizable con filtro por texto/DNI.
- **Sesión**: El profesor logueado se auto-asigna en pagos/asistencias. Solo ADMIN puede sobreescribirlo.
- **Validaciones**: DNI obligatorio en cliente, tanto en FE (desactivar botón submit) como en BE (400 con mensaje).

---

## 🚨 SPRINT 0 — Bugs críticos (bloquean operación)
> Prioridad máxima. No avanzar en features hasta resolver estos.

### BE-01 | Validar DNI obligatorio en `POST /api/clients`
- Si `dni` es null/blank → `400 Bad Request` con body `{ "message": "El DNI es obligatorio" }`
- **Archivo:** `ClientRequestDTO.java` — agregar `@NotBlank(message = "El DNI es obligatorio")`

### BE-02 | Mensajes de error descriptivos en toda la API
- `GlobalExceptionHandler` debe mapear:
  - `DataIntegrityViolationException` → `409 "El DNI ya está registrado"`
  - `ResourceNotFoundException` → `404 "Recurso no encontrado: {entidad}"`
  - `MethodArgumentNotValidException` → `400` con el primer mensaje de `@Valid`
  - `ClientInUseException` → `409 "El cliente ya tiene una suscripción activa"`
  - Error de asistencia → `409 "El cliente no tiene una cuota activa"`
- **Archivo:** `GlobalExceptionHandler.java`

### BE-03 | Bug venta de producto — `Professor not found with id: 1`
- Investigar `PaymentService` cuando `paymentType = PRODUCTS`
- El profesor debe resolverse desde el token JWT, no de un ID hardcodeado
- **Archivo:** `PaymentService.java` + `PaymentController.java`

### BE-04 | Dashboard — KPIs faltantes
- Agregar a `DashboardStatsDTO`: `totalProfessors` y `lowStockCount`
- **Archivo:** `DashboardService.java` + `DashboardStatsDTO.java`

### BE-05 | Clases — soporte de múltiples días
- Entidad `GroupClass` actualmente tiene un solo `dayOfWeek`
- Migrar a `List<String> daysOfWeek` o entidad relacional `ClassDay`
- **Archivo:** `GroupClass.java` + `GroupClassService.java` + `ClassesPage.tsx`

### FE-01 | Venta de producto — cliente seleccionado no se muestra
- Bug en `ProductsPage.tsx` o `PaymentsPage.tsx`: el estado del cliente no se renderiza tras selección
- Investigar el combobox de cliente en la sección de venta

### FE-02 | Profesor auto-asignado desde sesión
- En `PaymentsPage.tsx` y `AttendancePage.tsx`: si `user.role === 'PROFESSOR'` → leer `professorId` del contexto de auth y enviarlo directo, sin mostrar el selector
- Si `role === 'ADMIN'` → mostrar selector de profesor normalmente

---

## 🟠 SPRINT 1 — UX crítica (hace el sistema usable)

### FE-03 | Componente `SearchableSelect` reutilizable
```tsx
// Props mínimas
interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (val: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => number;
  placeholder?: string;
  searchBy?: (item: T, query: string) => boolean; // default: búsqueda en label
}
```
- Usar en: selector de clientes (con búsqueda por DNI + nombre), selector de profesores, selector de rutinas, selector de clases
- **Archivo nuevo:** `gym-frontend/src/components/ui/SearchableSelect.tsx`

### FE-04 | Inputs — modo white global
- Todos los `<input>`, `<select>`, `<textarea>` → `bg-white text-slate-900 border-slate-200`
- Eliminar cualquier clase `bg-gray-900`, `bg-slate-800`, `text-gray-100`, `text-white` en inputs
- Hacer un grep y fix masivo

### FE-05 | Layout — 100% de pantalla
- `MainLayout.tsx`: revisar que el wrapper tenga `w-full min-h-screen` sin max-width restrictivo que achique el contenido
- Sidebar fijo, contenido principal `flex-1 overflow-auto`

### FE-06 | Toast centrado
- En `main.tsx` o donde se configure `react-toastify`:
  ```tsx
  <ToastContainer position="top-center" />
  ```

### FE-07 | Botón "Nuevo Alumno" — layout fix
- Usar `flex items-center gap-2` en el botón para que el `+` y el texto queden en la misma línea

### FE-08 | ESC para cerrar modales
- En cada modal con `useEffect`:
  ```tsx
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  ```
- Crear hook `useEscapeKey(onClose)` reutilizable

### FE-09 | Toggle activo/inactivo en tabla de clientes
- En la fila de `ClientsPage.tsx`: reemplazar el texto "Activo/Inactivo" por un `<Toggle>` que llama a `PATCH /api/clients/{id}/status`
- Necesita endpoint PATCH en el backend

### FE-10 | Ejercicios agrupados por grupo muscular
- En `ExercisesPage.tsx`: agrupar ejercicios por `muscleGroup` con un `group by`
- Mostrar cada grupo en una sección con header (ej: **PIERNAS**, **PECHO**, **ESPALDA**)

---

## 🟡 SPRINT 2 — Mejoras de diseño y consistencia

### DES-01 | Card "GRASA CORPORAL" — colores
- Cambiar a paleta legible: fondo blanco, texto `slate-900`, valor en color accent (`rose-500` para grasa, `emerald-600` para músculo)

### DES-02 | Modales de confirmación en DesignSystem
- Crear `ConfirmModal.tsx` genérico:
  ```tsx
  <ConfirmModal
    title="Eliminar cliente"
    message="¿Estás seguro? Esta acción no se puede deshacer."
    onConfirm={handleDelete}
    onCancel={onClose}
    variant="danger" // o "warning"
  />
  ```
- Agregar al `DesignSystemShowcasePage`

### DES-03 | Cards de rutinas — formato consistente
- Cada card de rutina muestra: Nombre, Objetivo, Cantidad de días, Badge activa/inactiva
- Tamaño fijo, sin que algunas sean más grandes que otras

### DES-04 | Clases — rediseño de la vista
- Vista de clases: cambiar de lista densa a cards tipo "horario"
- Mostrar: nombre de clase, profesor, días, horario, cupos (X/Y)
- Color por día de la semana para diferenciación visual rápida

### DES-05 | Wizard de creación de rutinas
- Flujo multi-paso (no modal):
  ```
  Paso 1: Datos básicos (nombre, objetivo, activa)
  Paso 2: Agregar días (cuántos días tiene la rutina)
  Paso 3: Para cada día: agregar ejercicios (del catálogo)
  Paso 4: Resumen + confirmar
  ```
- Ruta dedicada: `/routines/new` (salir del paradigma de modal)

---

## 📊 Resumen de prioridades

| Sprint | Items | Estimación |
|:---:|:---|:---:|
| **Sprint 0** | BE-01 a BE-05 + FE-01 + FE-02 (bugs críticos) | ~2 días |
| **Sprint 1** | FE-03 a FE-10 (UX usable) | ~3 días |
| **Sprint 2** | DES-01 a DES-05 (diseño y consistencia) | ~3 días |
| | **Total Capa 1 completa** | **~8 días** |

---

## ✅ Criterios de aceptación — Capa 1 lista

- [ ] Ningún error del backend se muestra como texto técnico al usuario
- [ ] DNI es obligatorio y validado en FE + BE
- [ ] Venta de productos funciona end-to-end
- [ ] Todos los selects tienen buscador cuando hay más de 10 opciones
- [ ] Profesor logueado se auto-asigna en pagos y asistencias
- [ ] Inputs con fondo blanco y texto legible en toda la app
- [ ] Layout ocupa 100% de pantalla
- [ ] ESC cierra todos los modales
- [ ] Dashboard muestra los 7 KPIs (incluyendo profesores y stock bajo)
- [ ] QA manual sesión 02 pasa sin bugs críticos ni de experiencia
