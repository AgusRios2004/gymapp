# 🎯 PROMPT MAESTRO: Refactorización Total GymApp / Gymania OS

> [!IMPORTANT]
> **REGLAS INFLEXIBLES Y DIRECTIVAS SUPREMAS:**
> 1. ☀️ **PROHIBIDO EL MODO OSCURO (ZERO DARK MODE)**:  
>    **NADA DE FONDOS NEGROS O GRISES OSCUROS (`slate-950`, `zinc-900`, `bg-black`, `bg-slate-900`)**. El diseño DEBE ser 100% MODO CLARO (`bg-slate-50` / `bg-white`), limpio, luminoso, con tipografía `text-slate-900` de alto contraste y acentos energéticos **Verde Esmeralda (`emerald-600`)**, **Teal (`teal-600`)** y **Amber (`amber-500`)**.
> 2. ⚡ **REGLA DE LOS 3 CLICS MAXIMO**:  
>    Cualquier flujo principal (crear rutina, asignarla, ver ficha, registrar pago, marcar asistencia) DEBE requerir máximo 3 clics desde cualquier punto de la aplicación.
> 3. 📄 **PAGINACIÓN BACKEND OBLIGATORIA EN TODOS LOS GETS**:  
>    **TODOS** los endpoints de listados en el Backend (`gymapp-back`) deben retornar `Page<T>` usando `Pageable` (`page`, `size`, `sort`). El Frontend debe consumir paginación limpia con controles (`< Anterior`, `Página X de Y`, `Siguiente >`), eliminando el scroll infinito y la carga pesada de 150+ registros en memoria.
> 4. 🏋️ **MÓDULO DE RUTINAS Y EJERCICIOS FLUIDO**:  
>    - Creador visual de rutinas sin recargar pantalla.
>    - Acceso directo al banco de ejercicios e inserción de ejercicios nuevos *inline* o modal rápido.
>    - Asignación directa a alumnos en 1 clic.
>    - **Resumen de Rutina**: Mostrar dónde está siendo usada (lista de alumnos activos asignados, cantidad de ejercicios y duración estimada).
> 5. 📊 **VISTA DE MÉTRICAS FÍSICAS EN DESKTOP SIN SCROLL**:  
>    La visualización de métricas físicas y evolución debe ajustarse cómodamente a la pantalla en escritorio (grilla responsiva 2x2 / 3x2), sin scroll horizontal ni vertical incómodo.
> 6. ⏱️ **MÓDULO DE ASISTENCIAS TRANQUILO Y SIMPLE**:  
>    Buscador rápido por DNI/Nombre + Botón de Check-in en 1 clic + Tabla paginada de asistencias recientes sin sobrecarga visual.

---

## 🛠️ PLAN DE EJECUCIÓN DETALLADO

### FASE 1: Backend (`gymapp-back`) - Paginación Integral en Todos los Controladores

Refactorizar los siguientes controladores para aceptar `Pageable` (por defecto `page=0`, `size=10`, `sort=id,desc` o por campo relevante) y retornar `ResponseEntity<Page<DTO>>`:

1. **`ClientController.java`**: `GET /api/clients?page=0&size=10&search=&filter=`
2. **`AttendanceController.java`**: `GET /api/attendance?page=0&size=10&search=`
3. **`RoutineController.java`**: `GET /api/routines?page=0&size=10`
4. **`ExerciseController.java`**: `GET /api/exercises?page=0&size=10&muscleGroup=`
5. **`PaymentController.java`**: `GET /api/payments?page=0&size=10`
6. **`ProductController.java`**: `GET /api/products?page=0&size=10`
7. **`ClassController.java`**: `GET /api/classes?page=0&size=10`
8. **`PhysicalRecordController.java`**: `GET /api/clients/{id}/physical-records?page=0&size=5`

---

### FASE 2: Frontend (`gym-frontend`) - Refactorización de Capa de Servicios y Tipos

1. Actualizar `types/index.ts` para incluir el tipo genérico de respuesta paginada de Spring Data:
   ```typescript
   export interface PageResponse<T> {
     content: T[];
     totalPages: number;
     totalElements: number;
     size: number;
     number: number; // página actual (0-indexed)
     first: boolean;
     last: boolean;
   }
   ```
2. Actualizar todos los servicios (`clientService`, `routineService`, `exerciseService`, `paymentService`, `attendanceService`, `productService`, `classService`) para solicitar y recibir `PageResponse<T>`.

---

### FASE 3: UI/UX Rediseño MODO CLARO & Flujos de 3 Clics

#### 1. Sistema de Diseño (`index.css`, `tailwind.config.js`, `Button.tsx`, `Modal.tsx`, `Sidebar.tsx`)
- Asegurar 100% fondos claros (`bg-slate-50`, `bg-white`, `border-slate-200`).
- Botones prominentes y con amplio padding (`px-6 py-3 font-extrabold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500`).
- Modales limpios sobre backdrop tenue (`bg-slate-900/40 backdrop-blur-xs`).

#### 2. Vista de Alumnos (`ClientsPage.tsx` & `ClientItem.tsx`)
- Paginador inferior nativo con selector de tamaño de página (10, 25, 50).
- Tarjetas de alumnos blancas, luminosas con acciones en 1 clic (*Ver Ficha*, *Asignar Rutina*, *Registrar Pago*).

#### 3. Creador y Resumen de Rutinas (`RoutinesPage.tsx` / `RoutineBuilder.tsx`)
- Pestañas/Paneles limpios: *Banco de Rutinas*, *Creador de Rutina*, *Banco de Ejercicios*.
- Selector rápido de ejercicios con búsqueda y modal inline para crear nuevo ejercicio.
- Botón "Asignar a Alumno" directo desde el resumen de la rutina.
- Card de **Resumen de Rutina**: Muestra la lista de socios que actualmente tienen asignada esta rutina, con avatar, fecha de asignación y acceso directo a su ficha.

#### 4. Vista de Métricas Físicas (`ClientDetailPage.tsx` / `RecompositionWidget.tsx`)
- Layout adaptado a escritorio sin desbordamientos ni scroll horizontal. Gráficos de Recharts integrados sobre tarjetas blancas limpias.

#### 5. Vista de Asistencias (`AttendancePage.tsx`)
- Input gigante de DNI con autofoco para marcado en 1 clic.
- Tabla paginada de marcaciones recientes (10 por página).

---

## 🔄 BUCLE DE VERIFICACIÓN Y COMPILACIÓN

En cada paso del proceso:
1. Ejecutar compilación Backend:
   ```bash
   (cd gymapp-back && JAVA_HOME=${JAVA_HOME:-/home/agustin_dev/.sdkman/candidates/java/21.0.2-tem} ./mvnw test)
   ```
2. Ejecutar compilación Frontend:
   ```bash
   (cd gym-frontend && npm run build)
   ```
3. Si hay errores, corregirlos de inmediato antes de avanzar.
4. Crear commits atómicos en git.

---

## 🛑 SEÑAL DE FINALIZACIÓN (Completion Signal)

Cuando el Backend y Frontend compilen limpiamente con 0 errores y todas las reglas se hayan cumplido:
Escribe la etiqueta exacta de cierre: `<promise>COMPLETE_TASK</promise>`
