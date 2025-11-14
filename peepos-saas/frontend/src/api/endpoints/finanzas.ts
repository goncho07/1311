/**
 * ═══════════════════════════════════════════════════════════
 * FINANZAS ENDPOINTS - API de finanzas y pagos
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';
import type { Pago, PagoCreate, PaginatedResponse } from '@/src/types/models.types';

export const finanzasApi = {
  /**
   * Listar pagos
   */
  list: async (filters?: any): Promise<PaginatedResponse<Pago>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/director/pagos?${queryString}` : '/director/pagos';

    return apiClient.get<PaginatedResponse<Pago>>(url);
  },

  /**
   * Obtener pago por ID
   */
  get: async (id: number): Promise<{ data: Pago }> => {
    return apiClient.get(`/director/pagos/${id}`);
  },

  /**
   * Registrar pago
   */
  create: async (data: PagoCreate): Promise<{ data: Pago; message: string }> => {
    return apiClient.post('/director/pagos', data);
  },

  /**
   * Actualizar pago
   */
  update: async (id: number, data: Partial<Pago>): Promise<{ data: Pago; message: string }> => {
    return apiClient.put(`/director/pagos/${id}`, data);
  },

  /**
   * Anular pago
   */
  cancel: async (id: number, motivo?: string): Promise<{ message: string }> => {
    return apiClient.patch(`/director/pagos/${id}/anular`, { motivo });
  },

  /**
   * Obtener pagos de un estudiante
   */
  getByEstudiante: async (estudianteId: number): Promise<{ data: Pago[] }> => {
    return apiClient.get(`/apoderado/estudiantes/${estudianteId}/pagos`);
  },

  /**
   * Obtener pagos pendientes de un estudiante
   */
  getPendingByEstudiante: async (estudianteId: number): Promise<{ data: Pago[] }> => {
    return apiClient.get(`/apoderado/estudiantes/${estudianteId}/pagos/pendientes`);
  },

  /**
   * Obtener resumen financiero
   */
  getResumen: async (fechaInicio?: string, fechaFin?: string): Promise<{
    data: {
      total_ingresos: number;
      total_pendiente: number;
      total_vencido: number;
      pagos_este_mes: number;
    };
  }> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryString = params.toString();
    const url = queryString
      ? `/director/pagos/resumen?${queryString}`
      : '/director/pagos/resumen';

    return apiClient.get(url);
  },

  /**
   * Generar comprobante de pago PDF
   */
  generateComprobante: async (id: number): Promise<Blob> => {
    const response = await apiClient.getAxiosInstance().get(`/director/pagos/${id}/comprobante`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Exportar pagos a Excel
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
    const url = queryString ? `/director/pagos/export?${queryString}` : '/director/pagos/export';

    const response = await apiClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default finanzasApi;
