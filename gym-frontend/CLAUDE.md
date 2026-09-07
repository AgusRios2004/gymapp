# CLAUDE.md — gym-frontend

Convenciones del frontend. Las pautas de conducta transversales están en el
[`CLAUDE.md` de la raíz](../CLAUDE.md) y también mandan acá.

**Stack:** React 19 · TypeScript estricto · Vite 7 · TanStack Query 5 · react-hook-form + Zod 4 ·
axios · Tailwind 3.4 · lucide-react · react-toastify · recharts · react-router-dom 7 · npm.

## 1. Estructura

```
src/
├── features/<dominio>/        auth · clients · routines · payments · attendance · dashboard · staff
│   ├── components/            componentes de ese dominio (modales, tabs, items)
│   ├── hooks/                 hooks de TanStack Query — la lógica de datos
│   ├── pages/                 la pantalla completa que monta el router
│   └── services/              llamadas HTTP, una función por endpoint
├── components/ui/             primitivas compartidas: Button, Input, Modal, Badge, TextArea, Sidebar
├── context/                   contextos transversales (FeatureContext)
├── layouts/                   shells de página
├── lib/axios.ts               la instancia `api` — única puerta al backend
├── types/                     index.ts (modelos) · api.types.ts (envelope) · schema.type.ts (Zod)
└── constants/
```

Una feature nueva replica esa anatomía. Si un componente lo usan dos dominios, sube a
`components/ui/`; si lo usa uno solo, se queda en su feature.

**Imports relativos.** No hay alias configurado en `vite.config.ts` ni en los `tsconfig`. No
introduzcas `@/` sin configurarlo en los dos lados y decirlo en el reporte.

## 2. Capas: pages → hooks → services → api

- **Nunca `axios` directo ni `fetch` en un componente o una page.** Todo HTTP vive en
  `features/<dominio>/services/`, importando `api` de `lib/axios`.
- Los componentes y pages consumen **hooks**, no services. El hook es el que sabe de caché,
  invalidación y estados.
- Una función de service por endpoint, tipada en las dos puntas:
  ```ts
  const response = await api.get<ApiResponse<Client[]>>(path);
  return response.data.data;
  ```
  El service **desenvuelve el envelope** y devuelve el dato limpio. El hook no debería ver
  `ApiResponse`.

### El envelope tiene un typo del lado del backend

`ApiResponse<T>` declara `success?: boolean`, pero el backend serializa `succes`. Siempre llega
`undefined`: **no ramifiques por `success`**. Para saber si falló, usá el rechazo de la promesa
(axios ya tira en 4xx/5xx). Corregir el typo es un cambio de contrato que va con el backend en el
mismo PR.

## 3. TanStack Query

- Query keys como array, con el **dominio en la primera posición** y las variantes después:
  `['clients', filterStatus]`, `['assistance', fecha]`. Invalidá por esa raíz.
- Las mutaciones invalidan las keys afectadas en `onSuccess`; no refresques a mano con estado local.
- Estados no felices siempre cubiertos en la page: `isLoading`, lista vacía, y error. Un `.map()`
  sobre `data` sin default rompe en el primer render.

## 4. Errores y toasts

`lib/axios.ts` ya tiene un interceptor global que muestra toast para **5xx, 401 y fallo de red**.

- **No dupliques esos toasts** en hooks ni componentes: el usuario vería dos.
- Sí manejás explícitamente lo específico del caso: 400 con mensaje del backend, 404 de un recurso
  puntual, y los errores de validación de formulario.
- El token vive en `localStorage` y lo inyecta el interceptor de request. No lo leas a mano en un
  componente.

## 5. Formularios y validación

- Los esquemas Zod viven en `types/schema.type.ts`, y los tipos salen de ahí:
  `type ClientFormData = z.infer<typeof ClientSchema>`. No declares una interface paralela al
  esquema.
- react-hook-form con `@hookform/resolvers/zod`. La validación es del esquema, no `if` sueltos en
  el submit.
- Mensajes de validación **en castellano**, dirigidos a quien usa la app
  (`"El nombre es requerido"`), como los ya escritos.

## 6. Estilos

- **Tailwind**, con las clases en el JSX. Nada de CSS-in-JS ni archivos `.css` nuevos por componente.
- Reutilizá las primitivas de `components/ui/` antes de escribir un `<button>` o un `<input>`
  crudo — si te falta una variante, ampliá la primitiva.
- Iconos: `lucide-react`. Gráficos: `recharts` (antes de armar uno, invocá la skill `dataviz`).
- Responsive de verdad: la app se usa desde el mostrador y desde el teléfono. Breakpoints de
  Tailwind (`sm: md: lg:`), sin media queries a mano.

## 7. TypeScript

`strict`, `noUnusedLocals` y `noUnusedParameters` están activos: un import o un parámetro sin usar
**rompe el build**, no es una advertencia.

- Prohibido `any`. Usá `unknown` + narrowing, un genérico, o definí el tipo en `types/index.ts`.
- Los modelos del dominio (`Client`, `Routine`, `Assistance`) viven en `types/index.ts` y se
  importan con `import type`.

## 8. Verificación

```bash
npm run build    # tsc -b && vite build → typecheck + build. Es el chequeo real.
npm run lint     # eslint . (sin --fix, no ensucia el diff)
npm run dev      # servidor de desarrollo en :5173
```

No hay suite de tests instalada todavía (ni vitest ni playwright). Mientras no la haya, la
verificación es `build` + `lint` + prueba manual descrita paso a paso — y decilo así en el reporte,
sin escribir "debería funcionar".
