/**
 * ═══════════════════════════════════════════════════════════
 * AUTH ENDPOINTS - API de autenticación
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  LoginRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/src/types/auth.types';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/login', credentials);
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/logout');
  },

  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    return apiClient.get<User>('/me');
  },

  /**
   * Refresh user data
   */
  refreshUser: async (): Promise<User> => {
    return apiClient.get<User>('/me');
  },

  /**
   * Forgot password
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/forgot-password', data);
  },

  /**
   * Reset password
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/reset-password', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/change-password', data);
  },

  /**
   * Update profile
   */
  updateProfile: async (data: Partial<User>): Promise<{ data: User; message: string }> => {
    return apiClient.put('/profile', data);
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<{ avatar_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default authApi;
