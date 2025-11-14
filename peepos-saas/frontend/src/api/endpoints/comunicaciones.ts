/**
 * ═══════════════════════════════════════════════════════════
 * COMUNICACIONES ENDPOINTS - API de comunicaciones
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  Comunicacion,
  ComunicacionCreate,
  PaginatedResponse,
} from '@/src/types/models.types';

export const comunicacionesApi = {
  /**
   * Listar comunicaciones
   */
  list: async (filters?: any): Promise<PaginatedResponse<Comunicacion>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/comunicaciones?${queryString}` : '/comunicaciones';

    return apiClient.get<PaginatedResponse<Comunicacion>>(url);
  },

  /**
   * Obtener comunicación por ID
   */
  get: async (id: number): Promise<{ data: Comunicacion }> => {
    return apiClient.get(`/comunicaciones/${id}`);
  },

  /**
   * Crear comunicación
   */
  create: async (data: ComunicacionCreate): Promise<{ data: Comunicacion; message: string }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'adjuntos' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('adjuntos[]', file);
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return apiClient.post('/comunicaciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Marcar como leído
   */
  markAsRead: async (id: number): Promise<{ message: string }> => {
    return apiClient.patch(`/comunicaciones/${id}/leer`);
  },

  /**
   * Archivar comunicación
   */
  archive: async (id: number): Promise<{ message: string }> => {
    return apiClient.patch(`/comunicaciones/${id}/archivar`);
  },

  /**
   * Eliminar comunicación
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/comunicaciones/${id}`);
  },

  /**
   * Obtener comunicaciones recibidas
   */
  getReceived: async (): Promise<PaginatedResponse<Comunicacion>> => {
    return apiClient.get('/comunicaciones/recibidas');
  },

  /**
   * Obtener comunicaciones enviadas
   */
  getSent: async (): Promise<PaginatedResponse<Comunicacion>> => {
    return apiClient.get('/comunicaciones/enviadas');
  },

  /**
   * Obtener comunicaciones sin leer
   */
  getUnread: async (): Promise<{ data: Comunicacion[]; count: number }> => {
    return apiClient.get('/comunicaciones/sin-leer');
  },
};

export default comunicacionesApi;
