/**
 * ═══════════════════════════════════════════════════════════
 * MATRÍCULAS ENDPOINTS - API de matrículas
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  Matricula,
  MatriculaCreate,
  MatriculaFilters,
  PaginatedResponse,
} from '@/src/types/models.types';

export const matriculasApi = {
  /**
   * Listar matrículas con filtros
   */
  list: async (filters?: MatriculaFilters): Promise<PaginatedResponse<Matricula>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/director/matriculas?${queryString}` : '/director/matriculas';

    return apiClient.get<PaginatedResponse<Matricula>>(url);
  },

  /**
   * Obtener matrícula por ID
   */
  get: async (id: number): Promise<{ data: Matricula }> => {
    return apiClient.get(`/director/matriculas/${id}`);
  },

  /**
   * Crear matrícula
   */
  create: async (data: MatriculaCreate): Promise<{ data: Matricula; message: string }> => {
    return apiClient.post('/director/matriculas', data);
  },

  /**
   * Actualizar matrícula
   */
  update: async (
    id: number,
    data: Partial<Matricula>
  ): Promise<{ data: Matricula; message: string }> => {
    return apiClient.put(`/director/matriculas/${id}`, data);
  },

  /**
   * Eliminar matrícula
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/director/matriculas/${id}`);
  },

  /**
   * Cambiar estado de matrícula
   */
  changeStatus: async (
    id: number,
    estado: 'matriculado' | 'retirado' | 'trasladado',
    observaciones?: string
  ): Promise<{ data: Matricula; message: string }> => {
    return apiClient.patch(`/director/matriculas/${id}/estado`, { estado, observaciones });
  },

  /**
   * Obtener matrículas de un estudiante
   */
  getByEstudiante: async (estudianteId: number): Promise<{ data: Matricula[] }> => {
    return apiClient.get(`/director/estudiantes/${estudianteId}/matriculas`);
  },

  /**
   * Obtener matrículas por aula
   */
  getByAula: async (aulaId: number, periodoId?: number): Promise<{ data: Matricula[] }> => {
    const params = periodoId ? `?periodo_academico_id=${periodoId}` : '';
    return apiClient.get(`/director/aulas/${aulaId}/matriculas${params}`);
  },

  /**
   * Matrícula masiva desde Excel
   */
  import: async (file: File): Promise<{ message: string; imported: number; errors?: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/director/matriculas/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Exportar matrículas a Excel
   */
  export: async (filters?: MatriculaFilters): Promise<Blob> => {
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
      ? `/director/matriculas/export?${queryString}`
      : '/director/matriculas/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Generar ficha de matrícula PDF
   */
  generateFicha: async (id: number): Promise<Blob> => {
    const response = await apiClient.getAxiosInstance().get(
      `/director/matriculas/${id}/ficha`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default matriculasApi;
