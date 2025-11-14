/**
 * ═══════════════════════════════════════════════════════════
 * STORAGE UTILITIES - Manejo seguro de localStorage
 * ═══════════════════════════════════════════════════════════
 */

const STORAGE_PREFIX = 'peepos_';

/**
 * Claves de almacenamiento
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
  TENANT_CODE: `${STORAGE_PREFIX}tenant_code`,
  USER_DATA: `${STORAGE_PREFIX}user_data`,
  TENANT_DATA: `${STORAGE_PREFIX}tenant_data`,
  PERMISSIONS: `${STORAGE_PREFIX}permissions`,
  REMEMBER_ME: `${STORAGE_PREFIX}remember_me`,
  THEME: `${STORAGE_PREFIX}theme`,
  LANGUAGE: `${STORAGE_PREFIX}language`,
} as const;

/**
 * Guardar item en localStorage
 */
export const setStorageItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error guardando en localStorage (${key}):`, error);
  }
};

/**
 * Obtener item de localStorage
 */
export const getStorageItem = <T = any>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error leyendo de localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Remover item de localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removiendo de localStorage (${key}):`, error);
  }
};

/**
 * Limpiar todo el localStorage del app
 */
export const clearStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
  }
};

/**
 * Verificar si localStorage está disponible
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Guardar datos de sesión
 */
export const setSessionData = (token: string, userData: any, tenantData: any, permissions: any[]): void => {
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
  setStorageItem(STORAGE_KEYS.USER_DATA, userData);
  setStorageItem(STORAGE_KEYS.TENANT_DATA, tenantData);
  setStorageItem(STORAGE_KEYS.PERMISSIONS, permissions);
};

/**
 * Limpiar datos de sesión
 */
export const clearSessionData = (): void => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER_DATA);
  removeStorageItem(STORAGE_KEYS.TENANT_DATA);
  removeStorageItem(STORAGE_KEYS.PERMISSIONS);
};
