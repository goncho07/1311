import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getTenantCode, getAuthToken, clearAuthData } from '@/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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
      (config: AxiosRequestConfig) => {
        // 1. Agregar tenant code (CRÍTICO para multi-tenant)
        const tenantCode = getTenantCode();
        if (tenantCode && config.headers) {
          config.headers['X-Tenant-Code'] = tenantCode;
        }

        // 2. Agregar token de autenticación
        const token = getAuthToken();
        if (token && config.headers) {
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
      (error: AxiosError) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // ════════════════════════════════════════════════════════
    // RESPONSE INTERCEPTOR
    // ════════════════════════════════════════════════════════
    this.instance.interceptors.response.use(
      (response: any) => {
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
            alert('Su institución está suspendida. Contacte con soporte.');
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

  // Método para upload de archivos
  async upload<T>(url: string, file: File, fieldName: string = 'file', config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
