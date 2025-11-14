/**
 * Auth Types - Tipos relacionados con autenticación
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    token: string;
    tenant: TenantInfo;
  };
}

export interface User {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  avatar?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'DIRECTOR'
  | 'SUBDIRECTOR'
  | 'COORDINADOR'
  | 'DOCENTE'
  | 'TUTOR'
  | 'ADMINISTRATIVO'
  | 'APODERADO'
  | 'ESTUDIANTE';

export interface TenantInfo {
  id: number;
  tenant_code: string;
  nombre_institucion: string;
  codigo_modular: string;
  tipo_gestion: 'PUBLICO' | 'PRIVADO';
  nivel_educativo: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA' | 'MULTIPLE';
  plan_suscripcion: 'BASICO' | 'ESTANDAR' | 'PREMIUM' | 'ENTERPRISE';
  modulos_activos: string[];
  logo_url?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}
