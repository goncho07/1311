/**
 * Models Types - Tipos de modelos de datos del sistema
 */

// ════════════════════════════════════════════════════════
// TIPOS COMUNES
// ════════════════════════════════════════════════════════

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ════════════════════════════════════════════════════════
// ESTUDIANTE
// ════════════════════════════════════════════════════════

export interface Estudiante {
  id: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  foto_url?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'TRASLADADO';
  created_at: string;
  updated_at: string;

  // Relaciones
  apoderado?: Apoderado;
  grado_actual?: string;
  seccion_actual?: string;
}

export interface EstudianteFilters {
  search?: string;
  grado?: string;
  seccion?: string;
  estado?: string;
  page?: number;
  per_page?: number;
}

// ════════════════════════════════════════════════════════
// APODERADO
// ════════════════════════════════════════════════════════

export interface Apoderado {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  parentesco: 'PADRE' | 'MADRE' | 'TUTOR' | 'ABUELO' | 'TIO' | 'OTRO';
  telefono: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// DOCENTE
// ════════════════════════════════════════════════════════

export interface Docente {
  id: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  especialidad?: string;
  telefono?: string;
  email: string;
  direccion?: string;
  foto_url?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA';
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// MATRÍCULA
// ════════════════════════════════════════════════════════

export interface Matricula {
  id: number;
  estudiante_id: number;
  periodo_academico_id: number;
  grado: string;
  seccion: string;
  fecha_matricula: string;
  estado_matricula: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'RETIRADA';
  observaciones?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  periodo?: PeriodoAcademico;
}

export interface MatriculaCreate {
  estudiante_id: number;
  periodo_academico_id: number;
  grado: string;
  seccion: string;
  observaciones?: string;
}

// ════════════════════════════════════════════════════════
// EVALUACIÓN
// ════════════════════════════════════════════════════════

export interface Evaluacion {
  id: number;
  estudiante_id: number;
  matricula_id: number;
  competencia_id: number;
  bimestre: '1' | '2' | '3' | '4';
  calificativo: string;
  nota_numerica?: number;
  conclusion_descriptiva?: string;
  fecha_evaluacion: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  estudiante?: Estudiante;
  competencia?: CompetenciaMinedu;
}

export interface EvaluacionCreate {
  estudiante_id: number;
  matricula_id: number;
  competencia_id: number;
  bimestre: '1' | '2' | '3' | '4';
  calificativo: string;
  nota_numerica?: number;
  conclusion_descriptiva?: string;
}

// ════════════════════════════════════════════════════════
// ASISTENCIA
// ════════════════════════════════════════════════════════

export interface Asistencia {
  id: number;
  estudiante_id: number;
  fecha: string;
  turno: 'MAÑANA' | 'TARDE';
  estado: 'PRESENTE' | 'TARDE' | 'AUSENTE' | 'JUSTIFICADO';
  hora_ingreso?: string;
  observaciones?: string;
  created_at: string;

  // Relaciones
  estudiante?: Estudiante;
}

export interface AsistenciaCreate {
  estudiante_id: number;
  fecha: string;
  turno: 'MAÑANA' | 'TARDE';
  estado: 'PRESENTE' | 'TARDE' | 'AUSENTE' | 'JUSTIFICADO';
  hora_ingreso?: string;
  observaciones?: string;
}

// ════════════════════════════════════════════════════════
// PERIODO ACADÉMICO
// ════════════════════════════════════════════════════════

export interface PeriodoAcademico {
  id: number;
  año: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  configuracion: {
    bimestre_1: { inicio: string; fin: string };
    bimestre_2: { inicio: string; fin: string };
    bimestre_3: { inicio: string; fin: string };
    bimestre_4: { inicio: string; fin: string };
    vacaciones?: { inicio: string; fin: string };
  };
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// ÁREA CURRICULAR
// ════════════════════════════════════════════════════════

export interface AreaCurricular {
  id: number;
  codigo_minedu: string;
  nombre: string;
  horas_semanales_1: number;
  horas_semanales_2: number;
  horas_semanales_3: number;
  horas_semanales_4: number;
  horas_semanales_5: number;
  color_identificacion: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// COMPETENCIA MINEDU
// ════════════════════════════════════════════════════════

export interface CompetenciaMinedu {
  id: number;
  numero_competencia: number;
  area_curricular_id?: number;
  nombre: string;
  descripcion: string;
  ciclo_educativo: string;
  activo: boolean;
  created_at: string;
  updated_at: string;

  // Relaciones
  area_curricular?: AreaCurricular;
}

// ════════════════════════════════════════════════════════
// COMUNICACIÓN
// ════════════════════════════════════════════════════════

export interface Comunicacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'ANUNCIO' | 'ALERTA' | 'RECORDATORIO' | 'EMERGENCIA';
  destinatarios: 'TODOS' | 'APODERADOS' | 'DOCENTES' | 'ESTUDIANTES' | 'PERSONALIZADO';
  fecha_envio: string;
  enviado: boolean;
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// TAREA
// ════════════════════════════════════════════════════════

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_asignacion: string;
  fecha_entrega: string;
  area_curricular_id: number;
  docente_id: number;
  grado: string;
  seccion: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  area_curricular?: AreaCurricular;
  docente?: Docente;
}

// ════════════════════════════════════════════════════════
// INVENTARIO
// ════════════════════════════════════════════════════════

export interface Inventario {
  id: number;
  codigo_patrimonio: string;
  descripcion: string;
  categoria: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  estado: 'BUENO' | 'REGULAR' | 'MALO' | 'BAJA';
  ubicacion?: string;
  valor_adquisicion?: number;
  fecha_adquisicion?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// ════════════════════════════════════════════════════════
// TRANSACCIÓN FINANCIERA
// ════════════════════════════════════════════════════════

export interface TransaccionFinanciera {
  id: number;
  tipo: 'INGRESO' | 'EGRESO';
  categoria: string;
  descripcion: string;
  monto: number;
  fecha_transaccion: string;
  metodo_pago?: string;
  comprobante_numero?: string;
  responsable?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}
