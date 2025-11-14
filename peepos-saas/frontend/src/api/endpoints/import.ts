import { apiClient } from '../client';
import type { PaginatedResponse } from '@/src/types/api.types';

export interface ImportBatch {
  id: number;
  uuid: string;
  nombre_batch: string;
  tipo_origen: 'UPLOAD_DIRECTO' | 'GOOGLE_DRIVE';
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'ERROR' | 'CANCELADO';
  total_archivos: number;
  archivos_procesados: number;
  progreso_porcentaje: number;
  fecha_inicio: string;
  fecha_fin?: string;
  files?: ImportFile[];
}

export interface ImportFile {
  id: number;
  import_batch_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  mime_type: string;
  tamaño_kb: number;
  modulo_detectado?: string;
  confianza_clasificacion?: number;
  total_registros: number;
  registros_validos: number;
  registros_invalidos: number;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'PROCESADO' | 'ERROR';
  errores?: any[];
  tiempo_procesamiento_segundos?: number;
  fecha_procesamiento?: string;
  records?: ImportRecord[];
}

export interface ImportRecord {
  id: number;
  import_file_id: number;
  fila_numero: number;
  datos_originales: Record<string, any>;
  datos_mapeados: Record<string, any>;
  estado_validacion: 'VALIDO' | 'INVALIDO' | 'DUPLICADO';
  errores_validacion: string[];
  advertencias: string[];
  accion_sugerida: 'CREAR' | 'ACTUALIZAR' | 'REVISAR';
  registro_id_creado?: number;
  fecha_importacion?: string;
}

export interface BatchEstado {
  id: number;
  uuid: string;
  nombre_batch: string;
  estado: string;
  total_archivos: number;
  archivos_procesados: number;
  progreso_porcentaje: number;
  fecha_inicio: string;
  fecha_fin?: string;
  archivos_por_estado: {
    pendiente: number;
    procesando: number;
    procesado: number;
    error: number;
  };
  registros_totales: number;
  registros_validos: number;
  registros_invalidos: number;
}

export const importApi = {
  crearBatch: async (data: { nombre?: string; archivos: File[] }): Promise<{ message: string; batch: ImportBatch }> => {
    const formData = new FormData();
    if (data.nombre) {
      formData.append('nombre', data.nombre);
    }
    data.archivos.forEach((archivo) => {
      formData.append('archivos[]', archivo);
    });

    return apiClient.post('/director/import/batches', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listarBatches: async (): Promise<PaginatedResponse<ImportBatch>> => {
    return apiClient.get('/director/import/batches');
  },

  obtenerBatch: async (batchId: number): Promise<BatchEstado> => {
    return apiClient.get(`/director/import/batches/${batchId}`);
  },

  obtenerArchivo: async (fileId: number): Promise<ImportFile> => {
    return apiClient.get(`/director/import/files/${fileId}`);
  },

  obtenerRegistros: async (fileId: number, estado?: string): Promise<PaginatedResponse<ImportRecord>> => {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    return apiClient.get(`/director/import/files/${fileId}/records?${params}`);
  },

  actualizarRegistro: async (recordId: number, data: { datos_mapeados: Record<string, any> }): Promise<{ message: string; record: ImportRecord }> => {
    return apiClient.put(`/director/import/records/${recordId}`, data);
  },

  confirmarImportacion: async (batchId: number): Promise<{ message: string; batch_id: number }> => {
    return apiClient.post(`/director/import/batches/${batchId}/confirmar`);
  },

  cancelarBatch: async (batchId: number): Promise<{ message: string }> => {
    return apiClient.post(`/director/import/batches/${batchId}/cancelar`);
  },
};
