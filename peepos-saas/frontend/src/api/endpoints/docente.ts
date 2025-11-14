/**
 * ═══════════════════════════════════════════════════════════
 * ENDPOINTS API - PANEL DOCENTE
 * ═══════════════════════════════════════════════════════════
 * Endpoints para todas las funcionalidades del panel docente
 */

import apiClient from '../client';

export const docenteApi = {
  // ════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════
  getDashboard: async () => {
    const response = await apiClient.get('/docente/dashboard');
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // PEEPOS ATTEND - Asistencia
  // ════════════════════════════════════════════════════════

  // Obtener secciones del docente para registrar asistencia
  getMisSecciones: async () => {
    const response = await apiClient.get('/docente/asistencia/secciones');
    return response.data;
  },

  // Obtener lista de estudiantes de una sección para registrar asistencia
  getEstudiantesParaAsistencia: async (seccionId: string, fecha: string) => {
    const response = await apiClient.get(`/docente/asistencia/estudiantes/${seccionId}`, {
      params: { fecha },
    });
    return response.data;
  },

  // Registrar asistencia (manual)
  registrarAsistencia: async (data: {
    seccion_id: string;
    fecha: string;
    asistencias: Array<{
      estudiante_id: string;
      estado: 'PRESENTE' | 'FALTA' | 'TARDANZA' | 'JUSTIFICADO';
      observaciones?: string;
    }>;
  }) => {
    const response = await apiClient.post('/docente/asistencia/registrar', data);
    return response.data;
  },

  // Generar QR para registro de asistencia
  generarQRAsistencia: async (seccionId: string, fecha: string) => {
    const response = await apiClient.post('/docente/asistencia/generar-qr', {
      seccion_id: seccionId,
      fecha,
    });
    return response.data;
  },

  // Obtener reporte de asistencia
  getReporteAsistencia: async (params: {
    seccion_id?: string;
    periodo_id?: string;
    mes?: number;
    anio?: number;
  }) => {
    const response = await apiClient.get('/docente/asistencia/reporte', { params });
    return response.data;
  },

  // Obtener justificaciones pendientes
  getJustificaciones: async (estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA') => {
    const response = await apiClient.get('/docente/asistencia/justificaciones', {
      params: { estado },
    });
    return response.data;
  },

  // Aprobar/Rechazar justificación
  procesarJustificacion: async (
    justificacionId: string,
    accion: 'APROBAR' | 'RECHAZAR',
    observaciones?: string
  ) => {
    const response = await apiClient.post(
      `/docente/asistencia/justificaciones/${justificacionId}/${accion.toLowerCase()}`,
      { observaciones }
    );
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // PEEPOS ACADEMIC - Evaluaciones y Notas
  // ════════════════════════════════════════════════════════

  // Obtener áreas que dicta el docente
  getMisAreas: async () => {
    const response = await apiClient.get('/docente/evaluaciones/areas');
    return response.data;
  },

  // Obtener competencias por área
  getCompetenciasPorArea: async (areaId: string) => {
    const response = await apiClient.get(`/docente/evaluaciones/areas/${areaId}/competencias`);
    return response.data;
  },

  // Crear evaluación
  crearEvaluacion: async (data: {
    area_curricular_id: string;
    grado_id: string;
    seccion_id: string;
    tipo_evaluacion: string;
    titulo: string;
    descripcion?: string;
    fecha_evaluacion: string;
    bimestre: number;
    peso: number;
    competencias: string[]; // IDs de competencias
  }) => {
    const response = await apiClient.post('/docente/evaluaciones', data);
    return response.data;
  },

  // Obtener estudiantes para registrar notas
  getEstudiantesParaNotas: async (evaluacionId: string) => {
    const response = await apiClient.get(`/docente/evaluaciones/${evaluacionId}/estudiantes`);
    return response.data;
  },

  // Registrar notas masivamente
  registrarNotas: async (
    evaluacionId: string,
    notas: Array<{
      estudiante_id: string;
      calificacion_literal: 'AD' | 'A' | 'B' | 'C';
      calificacion_numerica?: number;
      observaciones?: string;
    }>
  ) => {
    const response = await apiClient.post(`/docente/evaluaciones/${evaluacionId}/notas`, {
      notas,
    });
    return response.data;
  },

  // Obtener libro de calificaciones
  getLibroCalificaciones: async (params: {
    area_id?: string;
    grado_id?: string;
    seccion_id?: string;
    bimestre?: number;
  }) => {
    const response = await apiClient.get('/docente/evaluaciones/libro', { params });
    return response.data;
  },

  // Obtener mis evaluaciones
  getMisEvaluaciones: async (params?: {
    area_id?: string;
    seccion_id?: string;
    bimestre?: number;
  }) => {
    const response = await apiClient.get('/docente/evaluaciones', { params });
    return response.data;
  },

  // Obtener boletas generadas
  getBoletasGeneradas: async (params: {
    periodo_id: string;
    seccion_id?: string;
    bimestre?: number;
  }) => {
    const response = await apiClient.get('/docente/evaluaciones/boletas', { params });
    return response.data;
  },

  // Generar boletas para sección
  generarBoletas: async (data: {
    seccion_id: string;
    periodo_id: string;
    bimestre: number;
  }) => {
    const response = await apiClient.post('/docente/evaluaciones/boletas/generar', data);
    return response.data;
  },

  // Obtener comparativa entre secciones
  getComparativaSeccion: async (params: {
    area_id: string;
    grado_id: string;
    periodo_id: string;
    bimestre?: number;
  }) => {
    const response = await apiClient.get('/docente/evaluaciones/comparativa', { params });
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // TAREAS ACADÉMICAS
  // ════════════════════════════════════════════════════════

  // Obtener mis tareas (como docente)
  getTareas: async (params?: {
    area_id?: string;
    seccion_id?: string;
    estado?: 'ACTIVA' | 'CERRADA';
  }) => {
    const response = await apiClient.get('/docente/tareas', { params });
    return response.data;
  },

  // Crear tarea
  crearTarea: async (data: {
    area_curricular_id: string;
    grado_id: string;
    seccion_id: string;
    titulo: string;
    descripcion: string;
    instrucciones?: string;
    fecha_entrega: string;
    puntos_maximos: number;
    peso: number;
    tipo: string;
    permite_archivos: boolean;
    max_archivos?: number;
  }) => {
    const response = await apiClient.post('/docente/tareas', data);
    return response.data;
  },

  // Actualizar tarea
  actualizarTarea: async (tareaId: string, data: any) => {
    const response = await apiClient.put(`/docente/tareas/${tareaId}`, data);
    return response.data;
  },

  // Eliminar tarea
  eliminarTarea: async (tareaId: string) => {
    const response = await apiClient.delete(`/docente/tareas/${tareaId}`);
    return response.data;
  },

  // Obtener entregas de una tarea
  getEntregasTarea: async (tareaId: string) => {
    const response = await apiClient.get(`/docente/tareas/${tareaId}/entregas`);
    return response.data;
  },

  // Calificar entrega
  calificarEntrega: async (
    entregaId: string,
    data: {
      calificacion: number;
      retroalimentacion?: string;
      estado: 'CALIFICADO' | 'DEVUELTO';
    }
  ) => {
    const response = await apiClient.post(`/docente/tareas/entregas/${entregaId}/calificar`, data);
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // PEEPOS TUTOR - Tutoría
  // ════════════════════════════════════════════════════════

  // Obtener mi plan de tutoría
  getPlanTutoria: async (periodoId: string) => {
    const response = await apiClient.get('/docente/tutoria/plan', {
      params: { periodo_id: periodoId },
    });
    return response.data;
  },

  // Crear/Actualizar plan de tutoría
  guardarPlanTutoria: async (data: {
    periodo_id: string;
    seccion_id: string;
    dimensiones: Array<{
      dimension: string; // Personal, Social, Aprendizaje, Vocacional
      objetivos: string;
      actividades: string;
      recursos: string;
    }>;
  }) => {
    const response = await apiClient.post('/docente/tutoria/plan', data);
    return response.data;
  },

  // Obtener sesiones de tutoría
  getSesionesTutoria: async (params?: { mes?: number; anio?: number }) => {
    const response = await apiClient.get('/docente/tutoria/sesiones', { params });
    return response.data;
  },

  // Registrar sesión de tutoría
  registrarSesionTutoria: async (data: {
    seccion_id: string;
    fecha: string;
    tema: string;
    dimension: string;
    actividades_realizadas: string;
    conclusiones: string;
    asistentes?: number;
  }) => {
    const response = await apiClient.post('/docente/tutoria/sesiones', data);
    return response.data;
  },

  // Obtener casos de tutoría individual
  getCasosTutoria: async (params?: {
    prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    estado?: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
  }) => {
    const response = await apiClient.get('/docente/tutoria/casos', { params });
    return response.data;
  },

  // Crear caso de tutoría
  crearCasoTutoria: async (data: {
    estudiante_id: string;
    tipo_caso: string;
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    descripcion: string;
    acciones_tomadas?: string;
  }) => {
    const response = await apiClient.post('/docente/tutoria/casos', data);
    return response.data;
  },

  // Actualizar caso de tutoría
  actualizarCasoTutoria: async (
    casoId: string,
    data: {
      seguimiento?: string;
      acciones_tomadas?: string;
      estado?: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
    }
  ) => {
    const response = await apiClient.put(`/docente/tutoria/casos/${casoId}`, data);
    return response.data;
  },

  // Derivar caso
  derivarCaso: async (
    casoId: string,
    data: {
      derivado_a: 'PSICOLOGO' | 'DIRECTOR' | 'COORDINADOR' | 'OTRO';
      motivo_derivacion: string;
    }
  ) => {
    const response = await apiClient.post(`/docente/tutoria/casos/${casoId}/derivar`, data);
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // COMUNICACIONES
  // ════════════════════════════════════════════════════════

  // Enviar comunicado
  enviarComunicado: async (data: {
    seccion_id: string;
    asunto: string;
    mensaje: string;
    tipo: 'INFORMATIVO' | 'URGENTE' | 'CITACION';
    destinatarios: 'TODOS' | 'SELECTIVO';
    estudiantes_ids?: string[];
  }) => {
    const response = await apiClient.post('/docente/comunicaciones/enviar', data);
    return response.data;
  },

  // Obtener historial de comunicaciones
  getHistorialComunicaciones: async (params?: {
    seccion_id?: string;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }) => {
    const response = await apiClient.get('/docente/comunicaciones/historial', { params });
    return response.data;
  },

  // Programar reunión con apoderados
  programarReunion: async (data: {
    seccion_id: string;
    tipo: 'INDIVIDUAL' | 'GRUPAL';
    estudiante_id?: string; // Si es individual
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    motivo: string;
    modalidad: 'PRESENCIAL' | 'VIRTUAL';
    enlace_virtual?: string;
  }) => {
    const response = await apiClient.post('/docente/comunicaciones/reuniones', data);
    return response.data;
  },

  // Obtener reuniones programadas
  getReuniones: async (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
    estado?: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';
  }) => {
    const response = await apiClient.get('/docente/comunicaciones/reuniones', { params });
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // PLANIFICACIÓN CURRICULAR
  // ════════════════════════════════════════════════════════

  // Obtener sesiones de aprendizaje
  getSesionesAprendizaje: async (params?: {
    area_id?: string;
    seccion_id?: string;
    mes?: number;
  }) => {
    const response = await apiClient.get('/docente/planificacion/sesiones', { params });
    return response.data;
  },

  // Crear/Editar sesión de aprendizaje
  guardarSesionAprendizaje: async (data: {
    area_curricular_id: string;
    grado_id: string;
    seccion_id: string;
    fecha: string;
    titulo: string;
    competencias: string[];
    proposito: string;
    momentos_pedagogicos: {
      inicio: string;
      desarrollo: string;
      cierre: string;
    };
    recursos: string;
    evaluacion: string;
  }) => {
    const response = await apiClient.post('/docente/planificacion/sesiones', data);
    return response.data;
  },

  // Obtener calendario de sesiones
  getCalendarioSesiones: async (params: {
    area_id: string;
    seccion_id: string;
    mes: number;
    anio: number;
  }) => {
    const response = await apiClient.get('/docente/planificacion/calendario', { params });
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // MI HORARIO
  // ════════════════════════════════════════════════════════

  getHorario: async (periodoId?: string) => {
    const response = await apiClient.get('/docente/horario', {
      params: { periodo_id: periodoId },
    });
    return response.data;
  },

  // ════════════════════════════════════════════════════════
  // PERFIL
  // ════════════════════════════════════════════════════════

  getPerfil: async () => {
    const response = await apiClient.get('/docente/perfil');
    return response.data;
  },

  actualizarPerfil: async (formData: FormData) => {
    const response = await apiClient.post('/docente/perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
