/**
 * ═══════════════════════════════════════════════════════════
 * INVENTARIO ENDPOINTS - API de inventario
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type { Inventario, PaginatedResponse } from '@/src/types/models.types';

export const inventarioApi = {
  /**
   * Listar inventario
   */
  list: async (filters?: any): Promise<PaginatedResponse<Inventario>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/director/inventario?${queryString}` : '/director/inventario';

    return apiClient.get<PaginatedResponse<Inventario>>(url);
  },

  /**
   * Obtener item por ID
   */
  get: async (id: number): Promise<{ data: Inventario }> => {
    return apiClient.get(`/director/inventario/${id}`);
  },

  /**
   * Crear item
   */
  create: async (data: Partial<Inventario>): Promise<{ data: Inventario; message: string }> => {
    return apiClient.post('/director/inventario', data);
  },

  /**
   * Actualizar item
   */
  update: async (
    id: number,
    data: Partial<Inventario>
  ): Promise<{ data: Inventario; message: string }> => {
    return apiClient.put(`/director/inventario/${id}`, data);
  },

  /**
   * Eliminar item
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/director/inventario/${id}`);
  },

  /**
   * Cambiar estado de item
   */
  changeStatus: async (
    id: number,
    estado: 'disponible' | 'prestado' | 'mantenimiento' | 'dado_de_baja'
  ): Promise<{ data: Inventario; message: string }> => {
    return apiClient.patch(`/director/inventario/${id}/estado`, { estado });
  },

  /**
   * Exportar inventario a Excel
   */
  export: async (filters?: any): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString
      ? `/director/inventario/export?${queryString}`
      : '/director/inventario/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default inventarioApi;
