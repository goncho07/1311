/**
 * ═══════════════════════════════════════════════════════════
 * API CLIENT - Cliente Axios configurado con interceptors
 * ═══════════════════════════════════════════════════════════
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getTenantCode, getAuthToken, clearAuthData } from '@/utils/auth';
import { ENV_CONFIG } from '@/src/config/env';
import toast from 'react-hot-toast';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: ENV_CONFIG.API_BASE_URL,
      timeout: ENV_CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // ════════════════════════════════════════════════════════
    // REQUEST INTERCEPTOR
    // ════════════════════════════════════════════════════════
    this.instance.interceptors.request.use(
      (config) => {
        // 1. Agregar tenant code (CRÍTICO para multi-tenant)
        const tenantCode = getTenantCode();
        if (tenantCode) {
          config.headers['X-Tenant-Code'] = tenantCode;
        }

        // 2. Agregar token de autenticación
        const token = getAuthToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 3. Log para desarrollo
        if (import.meta.env.DEV) {
          console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            tenant: tenantCode,
            hasAuth: !!token,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // ════════════════════════════════════════════════════════
    // RESPONSE INTERCEPTOR
    // ════════════════════════════════════════════════════════
    this.instance.interceptors.response.use(
      (response) => {
        // Log para desarrollo
        if (import.meta.env.DEV) {
          console.log('📥 API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        // 401 - Token expirado
        if (error.response?.status === 401) {
          console.warn('🔒 Token expirado, redirigiendo a login...');
          clearAuthData();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 403 - Tenant inactivo o sin permisos
        if (error.response?.status === 403) {
          const errorData = error.response.data as any;
          console.error('🚫 Acceso denegado:', errorData?.error);

          // Si es tenant inactivo, mostrar mensaje especial
          if (errorData?.error?.includes('suspendida')) {
            toast.error('Su institución está suspendida. Contacte con soporte.');
          }
        }

        // 422 - Validation errors
        if (error.response?.status === 422) {
          const validationErrors = error.response.data as any;
          console.warn('⚠️ Errores de validación:', validationErrors);
        }

        // 500 - Server error
        if (error.response?.status === 500) {
          console.error('💥 Error del servidor:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // ════════════════════════════════════════════════════════
  // MÉTODOS HTTP PÚBLICOS
  // ════════════════════════════════════════════════════════

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Obtener instancia de Axios para casos especiales
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
export default apiClient;
