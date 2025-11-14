/**
 * Utilidades para manejo de autenticación y tenant
 * ════════════════════════════════════════════════════════════════
 */

const TENANT_CODE_KEY = 'tenant_code';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Obtiene el código del tenant desde localStorage
 */
export function getTenantCode(): string | null {
  return localStorage.getItem(TENANT_CODE_KEY);
}

/**
 * Establece el código del tenant en localStorage
 */
export function setTenantCode(tenantCode: string): void {
  localStorage.setItem(TENANT_CODE_KEY, tenantCode);
}

/**
 * Obtiene el token de autenticación desde localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Establece el token de autenticación en localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Obtiene los datos del usuario desde localStorage
 */
export function getUserData<T = any>(): T | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Establece los datos del usuario en localStorage
 */
export function setUserData<T = any>(userData: T): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Limpia todos los datos de autenticación
 */
export function clearAuthData(): void {
  localStorage.removeItem(TENANT_CODE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Verifica si hay un tenant seleccionado
 */
export function hasTenant(): boolean {
  return !!getTenantCode();
}
