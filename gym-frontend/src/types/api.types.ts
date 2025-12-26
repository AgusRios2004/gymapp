// Define aquí la estructura genérica que devuelve tu backend (Spring Boot)
// Si tu backend devuelve directamente el objeto (ej. Client), usa T.
// Si devuelve un wrapper (ej. { data: ..., message: ... }), usa esta estructura.

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
}
