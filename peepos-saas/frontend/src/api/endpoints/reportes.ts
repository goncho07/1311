/**
 * ═══════════════════════════════════════════════════════════
 * REPORTES ENDPOINTS - API de reportes y estadísticas
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';

export const reportesApi = {
  /**
   * Dashboard principal - Estadísticas generales
   */
  getDashboard: async (): Promise<{
    data: {
      total_estudiantes: number;
      total_docentes: number;
      total_aulas: number;
      estudiantes_activos: number;
      asistencia_hoy: number;
      pagos_pendientes: number;
      mensajes_sin_leer: number;
    };
  }> => {
    return apiClient.get('/dashboard/estadisticas');
  },

  /**
   * Reporte de estudiantes por grado
   */
  getEstudiantesPorGrado: async (): Promise<{
    data: Array<{ grado: string; cantidad: number }>;
  }> => {
    return apiClient.get('/reportes/estudiantes-por-grado');
  },

  /**
   * Reporte de asistencia general
   */
  getAsistenciaGeneral: async (fechaInicio: string, fechaFin: string): Promise<{
    data: {
      promedio_asistencia: number;
      total_presentes: number;
      total_ausentes: number;
      total_tardanzas: number;
      por_dia: Array<{ fecha: string; presentes: number; ausentes: number }>;
    };
  }> => {
    return apiClient.get(
      `/reportes/asistencia-general?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
  },

  /**
   * Reporte académico por periodo
   */
  getAcademicoPorPeriodo: async (periodoId: number): Promise<{
    data: {
      promedio_general: number;
      total_aprobados: number;
      total_desaprobados: number;
      por_curso: Array<{ curso: string; promedio: number }>;
    };
  }> => {
    return apiClient.get(`/reportes/academico-periodo/${periodoId}`);
  },

  /**
   * Reporte financiero por periodo
   */
  getFinancieroPorPeriodo: async (fechaInicio: string, fechaFin: string): Promise<{
    data: {
      total_ingresos: number;
      total_pendiente: number;
      total_vencido: number;
      por_mes: Array<{ mes: string; ingresos: number }>;
      por_concepto: Array<{ concepto: string; monto: number }>;
    };
  }> => {
    return apiClient.get(
      `/reportes/financiero?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
  },

  /**
   * Reporte de rendimiento académico por aula
   */
  getRendimientoAula: async (aulaId: number, periodoId: number): Promise<{
    data: {
      aula: any;
      promedio_aula: number;
      estudiantes_destacados: any[];
      estudiantes_bajo_rendimiento: any[];
      estadisticas_por_curso: any[];
    };
  }> => {
    return apiClient.get(`/reportes/rendimiento-aula/${aulaId}/${periodoId}`);
  },

  /**
   * Exportar reporte a Excel
   */
  exportToExcel: async (tipo: string, params?: any): Promise<Blob> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/reportes/${tipo}/export?${queryString}`
      : `/reportes/${tipo}/export`;

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Exportar reporte a PDF
   */
  exportToPDF: async (tipo: string, params?: any): Promise<Blob> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/reportes/${tipo}/pdf?${queryString}` : `/reportes/${tipo}/pdf`;

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Obtener estadísticas en tiempo real
   */
  getRealTimeStats: async (): Promise<{
    data: {
      usuarios_online: number;
      ultima_actualizacion: string;
      alertas_pendientes: number;
    };
  }> => {
    return apiClient.get('/reportes/real-time-stats');
  },
};

export default reportesApi;
