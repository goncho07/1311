/**
 * ═══════════════════════════════════════════════════════════
 * MODELS TYPES - Modelos de datos del sistema educativo
 * ═══════════════════════════════════════════════════════════
 */

import type { PaginationParams, SortParams, SearchParams } from './api.types';

// ═══════════════════════════════════════════════════════════
// USUARIO
// ═══════════════════════════════════════════════════════════

export interface Usuario {
  id: number;
  uuid: string;
  tipo_usuario: 'ESTUDIANTE' | 'DOCENTE' | 'APODERADO' | 'ADMINISTRATIVO' | 'DIRECTIVO';
  codigo_usuario: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  dni?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F' | 'OTRO';
  direccion?: string;
  distrito?: string;
  foto_perfil?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  roles?: Role[];
  estudiante?: Estudiante;
  docente?: Docente;
  apoderado?: Apoderado;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

// ═══════════════════════════════════════════════════════════
// ESTUDIANTE
// ═══════════════════════════════════════════════════════════

export interface Estudiante {
  id: number;
  usuario_id: number;
  codigo_estudiante: string;
  codigo_siagie?: string;
  grado: '1°' | '2°' | '3°' | '4°' | '5°';
  seccion: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  turno: 'MAÑANA' | 'TARDE';
  situacion: 'MATRICULADO' | 'TRASLADADO' | 'RETIRADO' | 'CULMINO';
  fecha_ingreso: string;
  lugar_nacimiento?: string;
  lengua_materna?: string;
  grupo_sanguineo?: string;
  seguro_salud?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  usuario?: Usuario;
  apoderados?: Apoderado[];
  matriculas?: Matricula[];
  evaluaciones?: Evaluacion[];
  asistencias?: Asistencia[];
}

export interface EstudianteFilters extends PaginationParams, SortParams, SearchParams {
  grado?: string;
  seccion?: string;
  turno?: string;
  situacion?: string;
}

// ═══════════════════════════════════════════════════════════
// APODERADO
// ═══════════════════════════════════════════════════════════

export interface Apoderado {
  id: number;
  usuario_id: number;
  tipo_apoderado: 'PADRE' | 'MADRE' | 'TUTOR' | 'OTRO';
  ocupacion?: string;
  lugar_trabajo?: string;
  grado_instruccion?: string;
  vive_con_estudiante: boolean;
  es_responsable_economico: boolean;
  created_at: string;
  updated_at: string;

  // Relaciones
  usuario?: Usuario;
  estudiantes?: Estudiante[];
}

// ═══════════════════════════════════════════════════════════
// DOCENTE
// ═══════════════════════════════════════════════════════════

export interface Docente {
  id: number;
  usuario_id: number;
  codigo_docente: string;
  especialidad?: string;
  nivel_educativo: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
  fecha_ingreso: string;
  tipo_contrato: 'NOMBRADO' | 'CONTRATADO' | 'DESTACADO';
  jornada_laboral: 'COMPLETA' | 'PARCIAL';
  estado: 'ACTIVO' | 'CESADO' | 'LICENCIA';
  created_at: string;
  updated_at: string;

  // Relaciones
  usuario?: Usuario;
  areas_curriculares?: AreaCurricular[];
}

// ═══════════════════════════════════════════════════════════
// MATRÍCULA
// ═══════════════════════════════════════════════════════════

export interface Matricula {
  id: number;
  codigo_matricula: string;
  estudiante_id: number;
  periodo_academico_id: number;
  grado: '1°' | '2°' | '3°' | '4°' | '5°';
  seccion: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  turno: 'MAÑANA' | 'TARDE';
  fecha_matricula: string;
  tipo_matricula: 'NUEVA' | 'RATIFICACION' | 'TRASLADO';
  estado: 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA' | 'CONFIRMADA';
  observaciones?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  periodo_academico?: PeriodoAcademico;
  documentos?: DocumentoMatricula[];
}

export interface DocumentoMatricula {
  id: number;
  matricula_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  created_at: string;
}

export interface MatriculaCreate {
  estudiante_id: number;
  periodo_academico_id: number;
  grado: string;
  seccion: string;
  turno: string;
  fecha_matricula: string;
  tipo_matricula: string;
  observaciones?: string;
}

export interface MatriculaFilters extends PaginationParams, SortParams, SearchParams {
  periodo_academico_id?: number;
  grado?: string;
  seccion?: string;
  estado?: string;
}

// ═══════════════════════════════════════════════════════════
// PERIODO ACADÉMICO
// ═══════════════════════════════════════════════════════════

export interface PeriodoAcademico {
  id: number;
  tenant_id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activo' | 'cerrado';
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// ÁREA CURRICULAR Y COMPETENCIAS
// ═══════════════════════════════════════════════════════════

export interface AreaCurricular {
  id: number;
  codigo_minedu: string;
  nombre: string;
  nivel_educativo: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
  descripcion?: string;
  orden: number;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at: string;
  updated_at: string;

  // Relaciones
  competencias?: CompetenciaMinedu[];
}

export interface CompetenciaMinedu {
  id: number;
  area_curricular_id: number;
  codigo_minedu: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  created_at: string;
  updated_at: string;

  // Relaciones
  area_curricular?: AreaCurricular;
}

// ═══════════════════════════════════════════════════════════
// EVALUACIÓN
// ═══════════════════════════════════════════════════════════

export interface Evaluacion {
  id: number;
  estudiante_id: number;
  docente_id: number;
  area_curricular_id: number;
  competencia_id: number;
  periodo_academico_id: number;
  bimestre: 'I' | 'II' | 'III' | 'IV';
  calificacion: 'AD' | 'A' | 'B' | 'C';
  calificacion_numerica?: number;
  fecha_evaluacion: string;
  tipo_evaluacion: 'DIAGNOSTICA' | 'FORMATIVA' | 'SUMATIVA';
  observaciones?: string;
  evidencias?: string[];
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  docente?: Docente;
  area_curricular?: AreaCurricular;
  competencia?: CompetenciaMinedu;
  periodo_academico?: PeriodoAcademico;
}

export interface EvaluacionCreate {
  estudiante_id: number;
  docente_id: number;
  area_curricular_id: number;
  competencia_id: number;
  periodo_academico_id: number;
  bimestre: string;
  calificacion: string;
  calificacion_numerica?: number;
  tipo_evaluacion: string;
  fecha_evaluacion: string;
  observaciones?: string;
  evidencias?: string[];
}

export interface EvaluacionFilters extends PaginationParams, SortParams, SearchParams {
  estudiante_id?: number;
  area_curricular_id?: number;
  periodo_academico_id?: number;
  bimestre?: string;
  tipo_evaluacion?: string;
}

// ═══════════════════════════════════════════════════════════
// ASISTENCIA
// ═══════════════════════════════════════════════════════════

export interface Asistencia {
  id: number;
  estudiante_id: number;
  fecha: string;
  turno: 'MAÑANA' | 'TARDE';
  estado: 'PRESENTE' | 'FALTA' | 'TARDANZA' | 'JUSTIFICADO';
  hora_registro?: string;
  metodo_registro: 'MANUAL' | 'QR' | 'BIOMETRICO' | 'APP_MOVIL';
  minutos_tardanza?: number;
  justificacion?: string;
  apoderado_notificado: boolean;
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
}

export interface AsistenciaCreate {
  estudiante_id: number;
  fecha: string;
  turno: string;
  estado: string;
  hora_registro?: string;
  metodo_registro?: string;
  minutos_tardanza?: number;
  justificacion?: string;
}

export interface AsistenciaFilters extends PaginationParams, SortParams, SearchParams {
  estudiante_id?: number;
  grado?: string;
  seccion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  turno?: string;
}

// ═══════════════════════════════════════════════════════════
// COMUNICACIÓN
// ═══════════════════════════════════════════════════════════

export interface Comunicacion {
  id: number;
  tenant_id: number;
  emisor_id: number;
  destinatario_id?: number;
  tipo: 'notificacion' | 'mensaje' | 'circular' | 'evento';
  asunto: string;
  mensaje: string;
  prioridad: 'baja' | 'normal' | 'alta';
  estado: 'enviado' | 'leido' | 'archivado';
  fecha_envio: string;
  fecha_lectura?: string;
  adjuntos?: string[];
  created_at: string;
  updated_at: string;
}

export interface ComunicacionCreate {
  destinatario_id?: number;
  tipo: string;
  asunto: string;
  mensaje: string;
  prioridad?: 'baja' | 'normal' | 'alta';
  adjuntos?: File[];
}

// ═══════════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════════

export interface Inventario {
  id: number;
  tenant_id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  unidad_medida?: string;
  precio_unitario?: number;
  ubicacion?: string;
  estado: 'disponible' | 'prestado' | 'mantenimiento' | 'dado_de_baja';
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// FINANZAS
// ═══════════════════════════════════════════════════════════

export interface TransaccionFinanciera {
  id: number;
  estudiante_id: number;
  tipo_transaccion: 'INGRESO' | 'EGRESO' | 'DEVOLUCION';
  categoria: 'MATRICULA' | 'PENSION' | 'MATERIALES' | 'OTRO';
  monto: number;
  moneda: 'PEN' | 'USD';
  fecha_transaccion: string;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'YAPE' | 'PLIN';
  numero_comprobante?: string;
  descripcion?: string;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  cuenta_por_cobrar?: CuentaPorCobrar;
}

export interface CuentaPorCobrar {
  id: number;
  estudiante_id: number;
  concepto: string;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  fecha_vencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO_PARCIAL' | 'PAGADO' | 'VENCIDO';
  recurrente: boolean;
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  transacciones?: TransaccionFinanciera[];
}

// ═══════════════════════════════════════════════════════════
// REUNIONES APODERADOS
// ═══════════════════════════════════════════════════════════

export interface ReunionApoderado {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin?: string;
  tipo_reunion: 'GRUPAL' | 'INDIVIDUAL';
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';
  link_virtual?: string;
  lugar?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  asistencias?: AsistenciaReunion[];
}

export interface AsistenciaReunion {
  id: number;
  reunion_id: number;
  apoderado_id: number;
  estudiante_id: number;
  asistio: boolean;
  hora_llegada?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// IMPORTACIÓN DE DATOS
// ═══════════════════════════════════════════════════════════

export interface ImportBatch {
  id: number;
  uuid: string;
  tipo_importacion: 'USUARIOS' | 'ESTUDIANTES' | 'MATRICULAS' | 'EVALUACIONES';
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'FALLIDO';
  total_registros: number;
  procesados: number;
  exitosos: number;
  fallidos: number;
  usuario_id: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  archivos?: ImportFile[];
  registros?: ImportRecord[];
}

export interface ImportFile {
  id: number;
  import_batch_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamaño: number;
  created_at: string;
  updated_at: string;
}

export interface ImportRecord {
  id: number;
  import_batch_id: number;
  numero_fila: number;
  datos_originales: Record<string, any>;
  estado: 'PENDIENTE' | 'PROCESADO' | 'FALLIDO';
  errores?: string[];
  registro_id?: number;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════════

export interface InventarioItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: 'MOBILIARIO' | 'TECNOLOGIA' | 'DEPORTIVO' | 'DIDACTICO' | 'OTRO';
  cantidad: number;
  unidad_medida: string;
  estado: 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO' | 'BAJA';
  ubicacion?: string;
  valor_unitario?: number;
  fecha_adquisicion?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// TIPOS DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════

export { PaginatedResponse, ApiResponse } from './api.types';
