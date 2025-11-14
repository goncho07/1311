/**
 * ═══════════════════════════════════════════════════════════
 * AUTH TYPES - Tipos para autenticación y usuarios
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Roles del sistema
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DIRECTOR = 'director',
  COORDINADOR = 'coordinador',
  DOCENTE = 'docente',
  APODERADO = 'apoderado',
  ESTUDIANTE = 'estudiante',
}

/**
 * Estados de usuario
 */
export enum UserStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
}

/**
 * Usuario del sistema
 */
export interface User {
  id: number;
  tenant_id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  rol: UserRole;
  estado: UserStatus;
  avatar_url?: string;
  telefono?: string;
  dni?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  genero?: 'M' | 'F';
  created_at: string;
  updated_at: string;

  // Relaciones
  tenant?: Tenant;
  permisos?: Permission[];
}

/**
 * Tenant (Institución educativa)
 */
export interface Tenant {
  id: number;
  codigo: string;
  nombre: string;
  tipo_institucion: string;
  nivel_educativo: string;
  email: string;
  telefono?: string;
  direccion?: string;
  logo_url?: string;
  estado: 'activo' | 'suspendido' | 'inactivo';
  plan_suscripcion?: string;
  fecha_expiracion?: string;
  max_usuarios?: number;
  max_estudiantes?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Permiso del sistema
 */
export interface Permission {
  id: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request de login
 */
export interface LoginRequest {
  tenant_code: string;
  email: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Response de login
 */
export interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant;
  permisos: Permission[];
  expires_at: string;
  message?: string;
}

/**
 * Auth State (para Zustand o Context)
 */
export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  permisos: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth Actions
 */
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
