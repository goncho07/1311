/**
 * ═══════════════════════════════════════════════════════════
 * AUTH UTILITIES - Funciones de autenticación
 * ═══════════════════════════════════════════════════════════
 */

import type { User, Tenant, Permission, UserRole } from '@/src/types/auth.types';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearSessionData,
} from './storage';

/**
 * Obtener token de autenticación
 */
export const getAuthToken = (): string | null => {
  return getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Guardar token de autenticación
 */
export const setAuthToken = (token: string): void => {
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Obtener código de tenant actual
 */
export const getTenantCode = (): string | null => {
  return getStorageItem<string>(STORAGE_KEYS.TENANT_CODE);
};

/**
 * Guardar código de tenant
 */
export const setTenantCode = (code: string): void => {
  setStorageItem(STORAGE_KEYS.TENANT_CODE, code);
};

/**
 * Obtener datos del usuario actual
 */
export const getCurrentUser = (): User | null => {
  return getStorageItem<User>(STORAGE_KEYS.USER_DATA);
};

/**
 * Guardar datos del usuario
 */
export const setCurrentUser = (user: User): void => {
  setStorageItem(STORAGE_KEYS.USER_DATA, user);
};

/**
 * Obtener datos del tenant actual
 */
export const getCurrentTenant = (): Tenant | null => {
  return getStorageItem<Tenant>(STORAGE_KEYS.TENANT_DATA);
};

/**
 * Guardar datos del tenant
 */
export const setCurrentTenant = (tenant: Tenant): void => {
  setStorageItem(STORAGE_KEYS.TENANT_DATA, tenant);
};

/**
 * Obtener permisos del usuario
 */
export const getUserPermissions = (): Permission[] => {
  return getStorageItem<Permission[]>(STORAGE_KEYS.PERMISSIONS) || [];
};

/**
 * Guardar permisos del usuario
 */
export const setUserPermissions = (permissions: Permission[]): void => {
  setStorageItem(STORAGE_KEYS.PERMISSIONS, permissions);
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Verificar si el usuario tiene un rol específico
 */
export const hasRole = (role: UserRole | UserRole[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.rol);
  }

  return user.rol === role;
};

/**
 * Verificar si el usuario tiene un permiso específico
 */
export const hasPermission = (permissionName: string): boolean => {
  const permissions = getUserPermissions();
  return permissions.some((p) => p.nombre === permissionName);
};

/**
 * Verificar si el usuario tiene alguno de los permisos
 */
export const hasAnyPermission = (permissionNames: string[]): boolean => {
  const permissions = getUserPermissions();
  return permissionNames.some((name) => permissions.some((p) => p.nombre === name));
};

/**
 * Verificar si el usuario tiene todos los permisos
 */
export const hasAllPermissions = (permissionNames: string[]): boolean => {
  const permissions = getUserPermissions();
  return permissionNames.every((name) => permissions.some((p) => p.nombre === name));
};

/**
 * Limpiar todos los datos de autenticación
 */
export const clearAuthData = (): void => {
  clearSessionData();
  removeStorageItem(STORAGE_KEYS.TENANT_CODE);
  removeStorageItem(STORAGE_KEYS.REMEMBER_ME);
};

/**
 * Obtener nombre completo del usuario
 */
export const getUserFullName = (user?: User): string => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return '';

  return `${currentUser.nombre} ${currentUser.apellido_paterno} ${currentUser.apellido_materno || ''}`.trim();
};

/**
 * Obtener iniciales del usuario
 */
export const getUserInitials = (user?: User): string => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return '';

  const firstInitial = currentUser.nombre.charAt(0).toUpperCase();
  const lastInitial = currentUser.apellido_paterno.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

/**
 * Verificar si el tenant está activo
 */
export const isTenantActive = (): boolean => {
  const tenant = getCurrentTenant();
  return tenant?.estado === 'activo';
};

/**
 * Verificar si la suscripción está vencida
 */
export const isSubscriptionExpired = (): boolean => {
  const tenant = getCurrentTenant();
  if (!tenant?.fecha_expiracion) return false;

  const expirationDate = new Date(tenant.fecha_expiracion);
  const today = new Date();
  return expirationDate < today;
};

/**
 * Obtener rol del usuario en español
 */
export const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Administrador',
    [UserRole.DIRECTOR]: 'Director',
    [UserRole.COORDINADOR]: 'Coordinador',
    [UserRole.DOCENTE]: 'Docente',
    [UserRole.APODERADO]: 'Apoderado',
    [UserRole.ESTUDIANTE]: 'Estudiante',
  };

  return roleLabels[role] || role;
};
