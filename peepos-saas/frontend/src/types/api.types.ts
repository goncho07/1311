/**
 * ═══════════════════════════════════════════════════════════
 * API TYPES - Tipos genéricos para respuestas de la API
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

/**
 * Respuesta simple de la API
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * Error de validación de la API
 */
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/**
 * Error genérico de la API
 */
export interface ApiError {
  error: string;
  message: string;
  status?: number;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

/**
 * Parámetros de ordenamiento
 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Parámetros de búsqueda
 */
export interface SearchParams {
  search?: string;
}

/**
 * Combinación de todos los parámetros de query
 */
export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  [key: string]: any;
}
