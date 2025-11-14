/**
 * ═══════════════════════════════════════════════════════════
 * RESPONSE TYPES - Tipos para respuestas de API
 * ═══════════════════════════════════════════════════════════
 */

// Tipo genérico para respuestas de éxito
export interface SuccessResponse<T = unknown> {
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

// Tipo genérico para respuestas de error
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
  code?: string;
}

// Respuesta de operaciones bulk
export interface BulkOperationResponse {
  message: string;
  created?: number;
  updated?: number;
  deleted?: number;
  imported?: number;
  failed?: number;
  errors?: Array<{
    row?: number;
    field?: string;
    message: string;
  }>;
}

// Respuesta de importación
export interface ImportResponse extends BulkOperationResponse {
  imported: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// Estudiante en riesgo (para asistencias)
export interface EstudianteRiesgo {
  id: number;
  codigo_estudiante: string;
  nombre_completo: string;
  grado: string;
  seccion: string;
  faltas: number;
  tardanzas: number;
  porcentaje_asistencia: number;
}

// Resumen de asistencia
export interface ResumenAsistencia {
  total_estudiantes: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  porcentaje_asistencia: number;
}

// Periodo académico resumido
export interface PeriodoResumen {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

// Competencia resumida
export interface CompetenciaResumen {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

// Área curricular resumida
export interface AreaCurricularResumen {
  id: number;
  nombre: string;
  codigo: string;
  competencias?: CompetenciaResumen[];
}

// Información del estudiante para evaluaciones
export interface EstudianteEvaluacion {
  id: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  foto_perfil?: string;
}

// Curso con información completa
export interface CursoCompleto {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  horas_semanales: number;
  area_curricular: AreaCurricularResumen;
}

// Respuesta de validación de archivo
export interface FileValidationResponse {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  preview?: Array<Record<string, unknown>>;
}

// Estadísticas generales
export interface EstadisticasGenerales {
  total_estudiantes: number;
  total_docentes: number;
  total_apoderados: number;
  total_cursos: number;
  promedio_asistencia: number;
  promedio_general: number;
}
