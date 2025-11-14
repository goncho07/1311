/**
 * ═══════════════════════════════════════════════════════════
 * ESTUDIANTES ENDPOINTS - API de estudiantes
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  Estudiante,
  EstudianteFilters,
  PaginatedResponse,
} from '@/src/types/models.types';

export const estudiantesApi = {
  /**
   * Listar estudiantes con filtros
   */
  list: async (filters?: EstudianteFilters): Promise<PaginatedResponse<Estudiante>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/director/estudiantes?${queryString}` : '/director/estudiantes';

    return apiClient.get<PaginatedResponse<Estudiante>>(url);
  },

  /**
   * Obtener estudiante por ID
   */
  get: async (id: number): Promise<{ data: Estudiante }> => {
    return apiClient.get(`/director/estudiantes/${id}`);
  },

  /**
   * Crear estudiante
   */
  create: async (data: Partial<Estudiante>): Promise<{ data: Estudiante; message: string }> => {
    return apiClient.post('/director/estudiantes', data);
  },

  /**
   * Actualizar estudiante
   */
  update: async (
    id: number,
    data: Partial<Estudiante>
  ): Promise<{ data: Estudiante; message: string }> => {
    return apiClient.put(`/director/estudiantes/${id}`, data);
  },

  /**
   * Eliminar estudiante
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/director/estudiantes/${id}`);
  },

  /**
   * Importar estudiantes desde Excel
   */
  import: async (file: File): Promise<{ message: string; imported: number; errors?: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/director/usuarios/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Exportar estudiantes a Excel
   */
  export: async (filters?: EstudianteFilters): Promise<Blob> => {
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
      ? `/director/estudiantes/export?${queryString}`
      : '/director/estudiantes/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Buscar estudiante por código
   */
  searchByCode: async (codigo: string): Promise<{ data: Estudiante }> => {
    return apiClient.get(`/director/estudiantes/buscar/${codigo}`);
  },

  /**
   * Obtener estudiantes por aula
   */
  getByAula: async (aulaId: number): Promise<{ data: Estudiante[] }> => {
    return apiClient.get(`/director/aulas/${aulaId}/estudiantes`);
  },

  /**
   * Subir foto de estudiante
   */
  uploadPhoto: async (
    id: number,
    file: File
  ): Promise<{ foto_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('foto', file);

    return apiClient.post(`/director/estudiantes/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Cambiar estado del estudiante
   */
  changeStatus: async (
    id: number,
    estado: 'activo' | 'inactivo' | 'retirado' | 'egresado'
  ): Promise<{ data: Estudiante; message: string }> => {
    return apiClient.patch(`/director/estudiantes/${id}/estado`, { estado });
  },

  /**
   * Obtener historial académico del estudiante
   */
  getHistorial: async (id: number): Promise<{ data: any[] }> => {
    return apiClient.get(`/director/estudiantes/${id}/historial`);
  },

  /**
   * Asignar apoderado a estudiante
   */
  assignApoderado: async (
    estudianteId: number,
    apoderadoId: number
  ): Promise<{ message: string }> => {
    return apiClient.post(`/director/estudiantes/${estudianteId}/apoderados`, {
      apoderado_id: apoderadoId,
    });
  },

  /**
   * Remover apoderado de estudiante
   */
  removeApoderado: async (
    estudianteId: number,
    apoderadoId: number
  ): Promise<{ message: string }> => {
    return apiClient.delete(`/director/estudiantes/${estudianteId}/apoderados/${apoderadoId}`);
  },
};

export default estudiantesApi;
