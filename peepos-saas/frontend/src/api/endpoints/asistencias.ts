/**
 * ═══════════════════════════════════════════════════════════
 * ASISTENCIAS ENDPOINTS - API de asistencias
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type {
  Asistencia,
  AsistenciaCreate,
  AsistenciaFilters,
  PaginatedResponse,
} from '@/src/types/models.types';
import type {
  BulkOperationResponse,
  EstudianteRiesgo,
  ResumenAsistencia,
} from '@/src/types/responses.types';

export const asistenciasApi = {
  /**
   * Listar asistencias con filtros
   */
  list: async (filters?: AsistenciaFilters): Promise<PaginatedResponse<Asistencia>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/docente/asistencias?${queryString}` : '/docente/asistencias';

    return apiClient.get<PaginatedResponse<Asistencia>>(url);
  },

  /**
   * Obtener asistencia por ID
   */
  get: async (id: number): Promise<{ data: Asistencia }> => {
    return apiClient.get(`/docente/asistencias/${id}`);
  },

  /**
   * Registrar asistencia
   */
  create: async (data: AsistenciaCreate): Promise<{ data: Asistencia; message: string }> => {
    return apiClient.post('/docente/asistencias', data);
  },

  /**
   * Registro masivo de asistencias (toda el aula)
   */
  createBulk: async (
    asistencias: AsistenciaCreate[]
  ): Promise<BulkOperationResponse> => {
    return apiClient.post('/docente/asistencias/masiva', { asistencias });
  },

  /**
   * Actualizar asistencia
   */
  update: async (
    id: number,
    data: Partial<Asistencia>
  ): Promise<{ data: Asistencia; message: string }> => {
    return apiClient.put(`/docente/asistencias/${id}`, data);
  },

  /**
   * Eliminar asistencia
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/docente/asistencias/${id}`);
  },

  /**
   * Obtener asistencias de un estudiante
   */
  getByEstudiante: async (
    estudianteId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<{ data: Asistencia[] }> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryString = params.toString();
    const url = queryString
      ? `/apoderado/estudiantes/${estudianteId}/asistencias?${queryString}`
      : `/apoderado/estudiantes/${estudianteId}/asistencias`;

    return apiClient.get(url);
  },

  /**
   * Obtener asistencias por aula y fecha
   */
  getByAulaAndDate: async (aulaId: number, fecha: string): Promise<{ data: Asistencia[] }> => {
    return apiClient.get(`/docente/aulas/${aulaId}/asistencias/${fecha}`);
  },

  /**
   * Obtener resumen de asistencia de un estudiante
   */
  getResumen: async (
    estudianteId: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<{ data: ResumenAsistencia }> => {
    return apiClient.get(
      `/apoderado/estudiantes/${estudianteId}/asistencias/resumen?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
  },

  /**
   * Obtener estadísticas de asistencia por aula
   */
  getEstadisticasAula: async (
    aulaId: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<{
    data: {
      total_estudiantes: number;
      promedio_asistencia: number;
      estudiantes_riesgo: EstudianteRiesgo[];
    };
  }> => {
    return apiClient.get(
      `/docente/aulas/${aulaId}/asistencias/estadisticas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
  },

  /**
   * Exportar asistencias a Excel
   */
  export: async (filters?: AsistenciaFilters): Promise<Blob> => {
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
      ? `/docente/asistencias/export?${queryString}`
      : '/docente/asistencias/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Generar reporte de asistencia PDF
   */
  generateReporte: async (
    estudianteId: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<Blob> => {
    const response = await apiClient.getAxiosInstance().get(
      `/apoderado/estudiantes/${estudianteId}/asistencias/reporte?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default asistenciasApi;
