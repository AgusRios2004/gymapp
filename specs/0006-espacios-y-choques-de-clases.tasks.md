# Tareas — spec 0006: espacios y choques de clases

> Spec: [`0006-espacios-y-choques-de-clases.md`](./0006-espacios-y-choques-de-clases.md) · Estado de la spec: `propuesta`
> Tamaños **relativos** entre sí (chica / media / grande). No hay base histórica para estimar en horas una feature nueva de BE + FE; como referencia, la spec 0003 (tamaño parecido a T2 + T5 juntas) salió en una tarde.

| # | Tarea | Archivos | Depende de | AC | Tamaño |
|:---:|:---|:---|:---:|:---|:---:|
| T1 | **Espacios, backend.** Entidad `GymSpace`, repositorio, service y `SpaceController` (`GET`, `POST`, `PUT`, `PATCH /{id}/status`). ADMIN resuelto con `AuthenticatedStaffService`. Nombre recortado y único sin distinguir mayúsculas | `entity/GymSpace.java`, `repository/GymSpaceRepository.java`, `service/GymSpaceService.java`, `controller/SpaceController.java`, test `controller/GymSpaceTest.java` | — | AC-0006-01 a 06 | media |
| T2 | **Clase con espacio y horario válido.** `GroupClass.space` (`@ManyToOne` `EAGER`, nullable). En `createClass`/`updateClass`: validar `HH:mm` y fin posterior a inicio, espacio obligatorio, existente y activo (con la excepción de edición que conserva un espacio dado de baja) | `entity/GroupClass.java`, `service/GroupClassService.java`, test `controller/GroupClassSpaceTest.java` | T1 | AC-0006-07 a 10 | media |
| T3 | **Detección de choques.** Choque de espacio y después de profesor: al menos un día en común y horarios superpuestos con desigualdad estricta, excluyendo la propia clase al editar. 409 con mensaje en español (espacio o profesor, día, horario, clase) y sin romper con datos `null` | `service/GroupClassService.java`, test `controller/GroupClassConflictTest.java` | T2 | AC-0006-11 a 16 | media |
| T4 | **Front: servicio, tipos y menú.** `spaceService.ts` (`getSpaces`, `createSpace`, `updateSpace`, `setSpaceStatus`), tipo `GymSpace` y `space` en `GroupClass`, ruta `/spaces`, ítem "Espacios" solo para ADMIN en el sidebar | `services/spaceService.ts`, `types/index.ts`, `App.tsx`, `components/ui/SIdebar.tsx`, test del sidebar | T1 | AC-0006-17 | chica |
| T5 | **Front: página Espacios.** Lista con crear, renombrar, dar de baja y reactivar. `Skeleton`/`EmptyState`, toasts con el `message` del backend, mobile según ADR-0009, patrón visual de `MonthlyTypesPage`/`StaffPage` (salvo que la pregunta abierta 1 pida mockup) | `pages/SpacesPage.tsx`, `pages/SpacesPage.test.tsx` | T4 | AC-0006-18 | media |
| T6 | **Front: espacio en clases.** Selector de espacio obligatorio en **los dos** formularios de `ClassesPage` (solo activos, más el actual si está inactivo). `classService` manda `space: { id }`. Toast con el 409 sin cerrar el modal. La card muestra el espacio o "Sin espacio" | `pages/ClassesPage.tsx`, `services/classService.ts`, `pages/ClassesPage.test.tsx` | T3, T4 | AC-0006-19 a 22 | grande |
| T7 | **Cierre.** Revisar las clases reales por choques existentes (ver riesgo 1 de la spec). ADR-0011 "Espacios como entidad administrable y reglas de choque de clases". Sumar la spec al sprint activo y al `SITEMAP.md` | `docs/adr/0011-*.md`, `docs/sprints/…`, `docs/SITEMAP.md` | T3, T6 | — | chica |

## Orden

```
T1 ──► T2 ──► T3 ──┐
  └──► T4 ──► T5   ├──► T6 ──► T7
         └─────────┘
```

T1 → T2 → T3 es el camino crítico del backend. T4 y T5 se pueden hacer en paralelo con T2 y T3. T6 necesita los choques (T3) para probar el toast con un 409 real, y los tipos de T4.

## Choques de archivo a tener en cuenta

- **`GroupClassService.java`:** lo tocan T2 y T3, en ese orden (T3 depende de T2).
- **`ClassesPage.tsx`:** solo T6. Tiene los formularios de alta y edición duplicados (~líneas 473 y 536); los dos llevan el selector.
- **`ClassesPage.test.tsx`:** ya existe con tests de la spec 0003; T6 agrega, no reemplaza.
