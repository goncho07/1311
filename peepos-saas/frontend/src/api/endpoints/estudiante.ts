/**
 * ═══════════════════════════════════════════════════════════
 * ESTUDIANTE ENDPOINTS - API para rol estudiante
 * ═══════════════════════════════════════════════════════════
 */

import { apiClient } from '../client';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface DashboardEstudianteResponse {
  success: boolean;
  estudiante: {
    nombre_completo: string;
    codigo: string;
    grado: string;
    seccion: string;
    foto_perfil?: string;
  };
  kpis: {
    promedio_general: number;
    asistencia_porcentaje: number;
    tareas_pendientes: number;
    competencias_logradas: number;
  };
  notas_por_area: Array<{
    area: string;
    promedio: number;
    competencias_logradas: number;
    calificacion_literal: string;
  }>;
  horario_hoy: Array<{
    hora: string;
    area: string;
    docente: string;
    aula: string;
  }>;
  tareas_proximas: Array<{
    id: string;
    titulo: string;
    area: string;
    fecha_entrega: string;
    dias_restantes: number;
  }>;
  proximas_evaluaciones: Array<{
    id: string;
    titulo: string;
    area: string;
    fecha: string;
    tipo: string;
  }>;
  quick_actions: Array<{
    label: string;
    route: string;
    icon: string;
  }>;
}

export interface NotasResponse {
  success: boolean;
  notas: Array<{
    area: string;
    promedio: number;
    evaluaciones: Array<{
      competencia: string;
      calificacion_literal: string;
      calificacion_numerica: number;
      descripcion_logro: string;
      fecha: string;
      bimestre: string;
    }>;
  }>;
  promedio_general: number;
}

export interface TareasResponse {
  success: boolean;
  tareas: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    area: string;
    docente: string;
    fecha_asignacion: string;
    fecha_entrega: string;
    puntos_maximos: number;
    estado: string;
    entregado: boolean;
    calificacion?: number;
  }>;
  total: number;
}

export interface TareaDetalleResponse {
  success: boolean;
  tarea: {
    id: string;
    titulo: string;
    descripcion: string;
    instrucciones: string;
    area: string;
    docente: string;
    tipo: string;
    fecha_asignacion: string;
    fecha_entrega: string;
    permite_entrega_tardia: boolean;
    puntos_maximos: number;
    peso: number;
    archivos_adjuntos?: Array<any>;
    rubrica?: any;
  };
  entrega?: {
    id: string;
    fecha_entrega: string;
    contenido: string;
    archivos: Array<any>;
    estado: string;
    puntos_obtenidos?: number;
    retroalimentacion?: string;
    fecha_revision?: string;
  };
}

export interface EntregarTareaRequest {
  contenido: string;
  archivos?: File[];
}

export interface HorarioResponse {
  success: boolean;
  horario: Array<{
    dia: string;
    clases: Array<{
      hora_inicio: string;
      hora_fin: string;
      area: string;
      docente: string;
      aula: string;
    }>;
  }>;
  grado: string;
  seccion: string;
}

export interface AsistenciaResponse {
  success: boolean;
  asistencias: Array<{
    fecha: string;
    estado: string;
    hora_registro?: string;
    observaciones?: string;
  }>;
  resumen: {
    total_dias: number;
    presentes: number;
    faltas: number;
    tardanzas: number;
    justificadas: number;
    porcentaje_asistencia: number;
  };
  mes: number;
  anio: number;
}

export interface ProximasEvaluacionesResponse {
  success: boolean;
  evaluaciones: Array<{
    id: string;
    titulo: string;
    area: string;
    docente: string;
    fecha: string;
    hora: string;
    tipo: string;
    temas?: Array<string>;
    materiales?: Array<string>;
    descripcion: string;
  }>;
  total: number;
}

export interface PerfilEstudianteResponse {
  success: boolean;
  estudiante: {
    nombre_completo: string;
    codigo: string;
    tipo_documento: string;
    numero_documento: string;
    fecha_nacimiento: string;
    edad: number;
    genero: string;
    direccion: string;
    distrito: string;
    telefono_emergencia?: string;
    foto_perfil?: string;
  };
  matricula?: {
    grado: string;
    seccion: string;
    nivel: string;
    periodo: string;
  };
  apoderados: Array<{
    nombre_completo: string;
    tipo_relacion: string;
    telefono: string;
    email: string;
  }>;
}

export interface ActualizarPerfilRequest {
  foto_perfil?: File;
  telefono_emergencia?: string;
}

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════

export const estudianteApi = {
  /**
   * 📊 Get Mi Dashboard
   */
  getMiDashboard: async (): Promise<DashboardEstudianteResponse> => {
    return apiClient.get<DashboardEstudianteResponse>('/estudiante/dashboard');
  },

  /**
   * 📖 Get Mis Notas
   */
  getMisNotas: async (params?: {
    bimestre?: string;
    area_id?: string;
  }): Promise<NotasResponse> => {
    return apiClient.get<NotasResponse>('/estudiante/notas', { params });
  },

  /**
   * 📝 Get Mis Tareas
   */
  getMisTareas: async (filtro?: 'pendientes' | 'entregadas' | 'vencidas' | 'todas'): Promise<TareasResponse> => {
    return apiClient.get<TareasResponse>('/estudiante/tareas', {
      params: { filtro: filtro || 'pendientes' },
    });
  },

  /**
   * 🔍 Get Tarea Detalle
   */
  getTareaDetalle: async (tareaId: string): Promise<TareaDetalleResponse> => {
    return apiClient.get<TareaDetalleResponse>(`/estudiante/tareas/${tareaId}`);
  },

  /**
   * 📤 Entregar Tarea
   */
  entregarTarea: async (tareaId: string, data: EntregarTareaRequest): Promise<any> => {
    const formData = new FormData();
    formData.append('contenido', data.contenido);

    if (data.archivos) {
      data.archivos.forEach((archivo, index) => {
        formData.append(`archivos[${index}]`, archivo);
      });
    }

    return apiClient.post(`/estudiante/tareas/${tareaId}/entregar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * 🕐 Get Mi Horario
   */
  getMiHorario: async (): Promise<HorarioResponse> => {
    return apiClient.get<HorarioResponse>('/estudiante/horario');
  },

  /**
   * 📅 Get Mi Asistencia
   */
  getMiAsistencia: async (params?: {
    mes?: number;
    anio?: number;
  }): Promise<AsistenciaResponse> => {
    return apiClient.get<AsistenciaResponse>('/estudiante/asistencia', { params });
  },

  /**
   * 📆 Get Próximas Evaluaciones
   */
  getProximasEvaluaciones: async (): Promise<ProximasEvaluacionesResponse> => {
    return apiClient.get<ProximasEvaluacionesResponse>('/estudiante/evaluaciones/proximas');
  },

  /**
   * 👤 Get Mi Perfil
   */
  getMiPerfil: async (): Promise<PerfilEstudianteResponse> => {
    return apiClient.get<PerfilEstudianteResponse>('/estudiante/perfil');
  },

  /**
   * ✏️ Actualizar Perfil
   */
  actualizarPerfil: async (data: ActualizarPerfilRequest): Promise<any> => {
    const formData = new FormData();

    if (data.foto_perfil) {
      formData.append('foto_perfil', data.foto_perfil);
    }

    if (data.telefono_emergencia) {
      formData.append('telefono_emergencia', data.telefono_emergencia);
    }

    return apiClient.post('/estudiante/perfil', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * 📄 Descargar Boleta
   */
  descargarBoleta: async (params: {
    periodo_id: string;
    bimestre: string;
  }): Promise<Blob> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/estudiante/boleta/descargar?periodo_id=${params.periodo_id}&bimestre=${params.bimestre}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Tenant-Code': localStorage.getItem('tenant_code') || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al descargar boleta');
    }

    return response.blob();
  },
};

export default estudianteApi;
