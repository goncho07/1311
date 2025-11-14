/**
 * ═══════════════════════════════════════════════════════════
 * EVALUACIONES ENDPOINTS - API de evaluaciones
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  Evaluacion,
  EvaluacionCreate,
  EvaluacionFilters,
  PaginatedResponse,
} from '@/src/types/models.types';

export const evaluacionesApi = {
  /**
   * Listar evaluaciones con filtros
   */
  list: async (filters?: EvaluacionFilters): Promise<PaginatedResponse<Evaluacion>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/docente/evaluaciones?${queryString}` : '/docente/evaluaciones';

    return apiClient.get<PaginatedResponse<Evaluacion>>(url);
  },

  /**
   * Listar evaluaciones de un estudiante
   */
  listByEstudiante: async (
    estudianteId: number,
    periodoId: number,
    bimestre?: string
  ): Promise<PaginatedResponse<Evaluacion>> => {
    const params = new URLSearchParams({
      estudiante_id: estudianteId.toString(),
      periodo_academico_id: periodoId.toString(),
      ...(bimestre && { bimestre }),
    });

    return apiClient.get<PaginatedResponse<Evaluacion>>(
      `/docente/evaluaciones?${params.toString()}`
    );
  },

  /**
   * Obtener evaluación por ID
   */
  get: async (id: number): Promise<{ data: Evaluacion }> => {
    return apiClient.get(`/docente/evaluaciones/${id}`);
  },

  /**
   * Registrar evaluación
   */
  create: async (data: EvaluacionCreate): Promise<{ data: Evaluacion; message: string }> => {
    return apiClient.post('/docente/evaluaciones', data);
  },

  /**
   * Registro masivo de evaluaciones (toda el aula)
   */
  createBulk: async (
    evaluaciones: EvaluacionCreate[]
  ): Promise<{ message: string; created: number; errors?: any[] }> => {
    return apiClient.post('/docente/evaluaciones/masiva', { evaluaciones });
  },

  /**
   * Actualizar evaluación
   */
  update: async (
    id: number,
    data: Partial<Evaluacion>
  ): Promise<{ data: Evaluacion; message: string }> => {
    return apiClient.put(`/docente/evaluaciones/${id}`, data);
  },

  /**
   * Eliminar evaluación
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/docente/evaluaciones/${id}`);
  },

  /**
   * Generar boleta de notas PDF
   */
  generarBoleta: async (
    estudianteId: number,
    periodoId: number,
    bimestre: string
  ): Promise<Blob> => {
    const response = await apiClient.getAxiosInstance().get(
      `/apoderado/estudiantes/${estudianteId}/boleta/${periodoId}/${bimestre}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Obtener resumen de notas de un estudiante
   */
  getResumenNotas: async (
    estudianteId: number,
    periodoId: number
  ): Promise<{
    data: {
      estudiante: any;
      periodo: any;
      cursos: any[];
      promedio_general: number;
    };
  }> => {
    return apiClient.get(
      `/apoderado/estudiantes/${estudianteId}/notas/${periodoId}`
    );
  },

  /**
   * Obtener estadísticas de evaluaciones por curso
   */
  getEstadisticasCurso: async (
    cursoId: number,
    periodoId: number,
    bimestre: string
  ): Promise<{
    data: {
      promedio: number;
      nota_mas_alta: number;
      nota_mas_baja: number;
      aprobados: number;
      desaprobados: number;
      total_estudiantes: number;
    };
  }> => {
    return apiClient.get(
      `/docente/evaluaciones/estadisticas/curso/${cursoId}?periodo_academico_id=${periodoId}&bimestre=${bimestre}`
    );
  },

  /**
   * Obtener historial de evaluaciones de un estudiante
   */
  getHistorial: async (
    estudianteId: number,
    cursoId?: number
  ): Promise<{ data: Evaluacion[] }> => {
    const params = new URLSearchParams();
    if (cursoId) params.append('curso_id', cursoId.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/apoderado/estudiantes/${estudianteId}/historial?${queryString}`
      : `/apoderado/estudiantes/${estudianteId}/historial`;

    return apiClient.get(url);
  },

  /**
   * Exportar evaluaciones a Excel
   */
  export: async (filters?: EvaluacionFilters): Promise<Blob> => {
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
      ? `/docente/evaluaciones/export?${queryString}`
      : '/docente/evaluaciones/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default evaluacionesApi;
