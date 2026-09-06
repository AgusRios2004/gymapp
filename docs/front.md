# 🏋️‍♀️ Frontend Audit Findings & Design Notes

This document details all bugs, styling inconsistencies, accessibility (a11y) issues, and SEO findings discovered during the audit of the frontend module (`gym-frontend`).

---

## 🚨 Critical Bugs & Errors

### 1. Broken Token Headers on Exercise Logs
* **Location:** `gym-frontend/src/features/routines/services/exerciseLogService.ts`
* **Issue:** 
  Unlike the other frontend services that import the custom `api` instance from `src/lib/axios.ts`, `exerciseLogService.ts` imports raw `axios` directly from `'axios'`:
  ```typescript
  import axios from 'axios';
  const response = await axios.post(`${API_URL}/exercise-logs`, log);
  ```
* **Impact:** 
  The raw `axios` instance does not run request/response interceptors. Therefore, it does **not** include the `Authorization: Bearer <token>` header in requests. Any call to save or retrieve exercise logs will fail with a `401 Unauthorized` or `403 Forbidden` error on authenticated backends.
* **Fix:** 
  Import and use the custom `api` instance:
  ```typescript
  import api from '../../../lib/axios';
  // ...
  const response = await api.post('/exercise-logs', log);
  ```

---

## ♿ Accessibility (WCAG 2.1 AA) Violations

These findings were compiled using automated accessibility scanning on the login page:

### 2. Low Contrast Ratio on Input Labels (Serious)
* **Location:** `LoginPage.tsx` (and other pages using standard labels)
* **Issue:** 
  The text labels for `"Email"` and `"Contraseña"` (and some footer text) are styled with `text-gray-400` (`#9ca3af`) on a white background (`#ffffff`). This yields a contrast ratio of **2.5:1**, which falls far below the WCAG AA requirement of **4.5:1** for normal text.
* **Fix:** 
  Increase contrast by styling labels with `text-gray-550` or `text-gray-600` (e.g. `#4b5563` or `#374151` yielding a 6:1+ contrast ratio).

### 3. Zooming and Scaling Disabled in Viewport (Moderate)
* **Location:** `gym-frontend/index.html` (Line 8)
* **Issue:** 
  The viewport meta tag disables zooming:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  ```
* **Impact:** 
  Visually impaired users cannot double-tap or pinch-to-zoom to read text, violating standard accessibility rules.
* **Fix:** 
  Allow user scaling:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ```

---

## 🔍 SEO Audit Violations

The following issues were identified using an SEO scanner on the entry points:

### 4. Missing Meta Description (Critical)
* **Issue:** No `<meta name="description">` tag is defined in the `<head>` of `index.html`.
* **Fix:** Add a descriptive tag to improve search engine indexing:
  ```html
  <meta name="description" content="Panel de gestión deportiva para el centro deportivo Functional Kids. Administra alumnos, rutinas, clases y pagos." />
  ```

### 5. Missing H1 Page Heading (Critical)
* **Issue:** The landing/login page does not contain an `<h1>` tag. It starts with an `<h2>` for the app title:
  ```html
  <h2 className="text-3xl font-black text-gray-900 ...">Functional Kids</h2>
  ```
* **Fix:** Change the main heading of the page to `<h1>` to establish proper semantic heading hierarchy.

### 6. Missing Social Metadata Tags (High / Medium)
* **Issue:** OpenGraph tags (`og:title`, `og:image`) and Twitter Card tags (`twitter:card`) are completely missing, preventing professional link previews.
* **Fix:** Add OpenGraph and Twitter card meta tags in `index.html`.

---

## 🎨 Design & Theme Feedback

### 7. Sidebar Dark Mode Hover Inconsistencies
* **Location:** `gym-frontend/src/components/ui/SIdebar.tsx`
* **Issue:** 
  * The **Modo Oscuro** toggle button uses `hover:bg-gray-100` and `text-gray-500` with no dark mode hover/text overrides, causing low visibility and incorrect light background hover effects in dark mode.
  * The **Cerrar Sesión** button has `hover:bg-red-50` with no dark mode hover override. Hovering over it in dark mode flashes a bright light pink container.
  * The **User Avatar** contains a hardcoded drop shadow using `shadow-blue-200` which stays active in dark mode, showing a bright light-blue glow on a dark background.
* **Fix:** 
  Apply Tailwind dark mode overrides:
  * For dark mode toggle: `dark:text-gray-400 dark:hover:bg-slate-700/50`
  * For logout button: `dark:hover:bg-red-950/20`
  * For avatar shadow: `dark:shadow-none`

---

## 📁 Code Conventions & Structure

### 8. Case-Sensitive Casing Mismatch in Sidebar Filename
* **Location:** `gym-frontend/src/components/ui/SIdebar.tsx`
* **Issue:** 
  The file is named `SIdebar.tsx` (with a capital `I`), but it is imported as:
  ```typescript
  import { Sidebar } from '../components/ui/SIdebar';
  ```
* **Impact:** 
  This casing is inconsistent with standard React naming conventions (capital letter per word: `Sidebar.tsx`). On case-sensitive operating systems like Linux (e.g. Docker builds or Linux environments), any slight change in casing in import paths (like importing `Sidebar` instead of `SIdebar`) will break the build.
* **Fix:** 
  Rename the file from `SIdebar.tsx` to `Sidebar.tsx` and update references.
