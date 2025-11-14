/**
 * ═══════════════════════════════════════════════════════════
 * USE AUTH HOOK - Hook para autenticación
 * ═══════════════════════════════════════════════════════════
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/src/api/endpoints';
import type { LoginRequest, ChangePasswordRequest } from '@/src/types/auth.types';
import {
  setAuthToken,
  setCurrentUser,
  setCurrentTenant,
  setUserPermissions,
  setTenantCode,
  clearAuthData,
} from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Guardar datos en localStorage
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setCurrentTenant(data.tenant);
      setUserPermissions(data.permisos);
      setTenantCode(data.tenant.codigo);

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Redirigir al dashboard
      navigate('/');
    },
    onError: (error: any) => {
      console.error('Error en login:', error);
    },
  });
};

/**
 * Hook para logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Limpiar datos
      clearAuthData();

      // Limpiar cache
      queryClient.clear();

      // Redirigir al login
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Error en logout:', error);
      // Limpiar datos de todas formas
      clearAuthData();
      queryClient.clear();
      navigate('/login');
    },
  });
};

/**
 * Hook para obtener usuario actual
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });
};

/**
 * Hook para cambiar contraseña
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: (data) => {
      console.log('Contraseña cambiada:', data.message);
    },
  });
};

/**
 * Hook para actualizar perfil
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (data) => {
      // Actualizar usuario en localStorage
      setCurrentUser(data.data);

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

/**
 * Hook para subir avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      console.log('Avatar subido:', data.avatar_url);

      // Invalidar cache del usuario
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

/**
 * Hook para forgot password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
  });
};

/**
 * Hook para reset password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string; password_confirmation: string }) =>
      authApi.resetPassword(data),
  });
};
