/**
 * ═══════════════════════════════════════════════════════════
 * API ENDPOINTS - Exportación centralizada
 * ═══════════════════════════════════════════════════════════
 */

export { authApi } from './auth';
export { estudiantesApi } from './estudiantes';
export { estudianteApi } from './estudiante'; // ROL ESTUDIANTE
export { evaluacionesApi } from './evaluaciones';
export { matriculasApi } from './matriculas';
export { asistenciasApi } from './asistencias';
export { comunicacionesApi } from './comunicaciones';
export { inventarioApi } from './inventario';
export { finanzasApi } from './finanzas';
export { reportesApi } from './reportes';

// Exportación por defecto con todos los endpoints
export default {
  auth: authApi,
  estudiantes: estudiantesApi,
  estudiante: estudianteApi, // ROL ESTUDIANTE
  evaluaciones: evaluacionesApi,
  matriculas: matriculasApi,
  asistencias: asistenciasApi,
  comunicaciones: comunicacionesApi,
  inventario: inventarioApi,
  finanzas: finanzasApi,
  reportes: reportesApi,
};
