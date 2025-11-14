/**
 * ═══════════════════════════════════════════════════════════
 * EVALUACIONES PAGE - Adaptado para usar API real
 * ═══════════════════════════════════════════════════════════
 *
 * CAMBIOS REALIZADOS:
 * - ✅ Usar useEvaluaciones hook (React Query)
 * - ✅ Registro masivo de evaluaciones
 * - ✅ Filtros por área curricular, bimestre
 * - ✅ Sistema de calificación cualitativa (AD, A, B, C)
 * - ✅ Generar boleta de notas PDF
 */

import React, { useState } from 'react';
import { Download, Save, FileText } from 'lucide-react';
import {
  useEvaluaciones,
  useCreateBulkEvaluaciones,
  useGenerarBoleta,
} from '@/hooks/useEvaluaciones';
import { useEstudiantesByAula } from '@/hooks/useEstudiantes';
import type { EvaluacionFilters, EvaluacionCreate } from '@/src/types/models.types';
import { getCurrentUser } from '@/utils/auth';
import toast from 'react-hot-toast';

const EvaluacionesPage: React.FC = () => {
  // 🔴 CAMBIO 1: Estados para filtros
  const [filters, setFilters] = useState<EvaluacionFilters>({
    area_curricular_id: undefined,
    periodo_academico_id: 1, // Periodo actual
    bimestre: 'I',
  });

  const [selectedAulaId, setSelectedAulaId] = useState<number | undefined>();
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>();
  const [selectedCompetenciaId, setSelectedCompetenciaId] = useState<number | undefined>();

  // 🔴 CAMBIO 2: Usar React Query hooks
  const { data: evaluaciones, isLoading } = useEvaluaciones(filters);
  const { data: estudiantes } = useEstudiantesByAula(selectedAulaId || 0);
  const createBulkMutation = useCreateBulkEvaluaciones();
  const generarBoletaMutation = useGenerarBoleta();

  // 🔴 CAMBIO 3: Estado para calificaciones masivas
  const [calificaciones, setCalificaciones] = useState<Record<number, string>>({});

  // ════════════════════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════════════════════

  const handleCalificacionChange = (estudianteId: number, calificacion: string) => {
    setCalificaciones((prev) => ({
      ...prev,
      [estudianteId]: calificacion,
    }));
  };

  const handleRegistroMasivo = async () => {
    if (!selectedAreaId || !selectedCompetenciaId) {
      toast.error('Seleccione área curricular y competencia');
      return;
    }

    // Obtener el usuario actual
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('No se pudo obtener el usuario actual');
      return;
    }

    // Construir array de evaluaciones
    const evaluacionesArray: EvaluacionCreate[] = Object.entries(calificaciones).map(
      ([estudianteId, calificacion]) => ({
        estudiante_id: parseInt(estudianteId),
        docente_id: currentUser.id,
        area_curricular_id: selectedAreaId,
        competencia_id: selectedCompetenciaId,
        periodo_academico_id: filters.periodo_academico_id || 1,
        bimestre: filters.bimestre || 'I',
        calificacion: calificacion,
        tipo_evaluacion: 'FORMATIVA',
        fecha_evaluacion: new Date().toISOString().split('T')[0],
      })
    );

    try {
      const result = await createBulkMutation.mutateAsync(evaluacionesArray);
      toast.success(`Evaluaciones registradas: ${result.created}`);
      setCalificaciones({}); // Limpiar formulario
    } catch (error: any) {
      console.error('Error registrando evaluaciones:', error);
      toast.error('Error al registrar evaluaciones');
    }
  };

  const handleGenerarBoleta = async (estudianteId: number) => {
    try {
      const blob = await generarBoletaMutation.mutateAsync({
        estudianteId,
        periodoId: filters.periodo_academico_id || 1,
        bimestre: filters.bimestre || 'I',
      });

      // Descargar PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boleta_${estudianteId}_${filters.bimestre}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Boleta generada exitosamente');
    } catch (error: any) {
      console.error('Error generando boleta:', error);
      toast.error('Error al generar boleta');
    }
  };

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  const estudiantesList = estudiantes?.data || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registro de Evaluaciones</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sistema de evaluación por competencias - MINEDU
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro Aula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
            <select
              value={selectedAulaId || ''}
              onChange={(e) => setSelectedAulaId(parseInt(e.target.value) || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar aula</option>
              <option value="1">1° A - Mañana</option>
              <option value="2">1° B - Mañana</option>
              <option value="3">2° A - Mañana</option>
              {/* Cargar desde API */}
            </select>
          </div>

          {/* Filtro Área Curricular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Curricular
            </label>
            <select
              value={selectedAreaId || ''}
              onChange={(e) => setSelectedAreaId(parseInt(e.target.value) || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar área</option>
              <option value="1">Comunicación</option>
              <option value="2">Matemática</option>
              <option value="3">Personal Social</option>
              <option value="4">Ciencia y Tecnología</option>
              {/* Cargar desde API */}
            </select>
          </div>

          {/* Filtro Competencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competencia</label>
            <select
              value={selectedCompetenciaId || ''}
              onChange={(e) =>
                setSelectedCompetenciaId(parseInt(e.target.value) || undefined)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedAreaId}
            >
              <option value="">Seleccionar competencia</option>
              {/* Cargar competencias según el área seleccionada */}
              <option value="1">Competencia 1</option>
              <option value="2">Competencia 2</option>
            </select>
          </div>

          {/* Filtro Bimestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bimestre</label>
            <select
              value={filters.bimestre || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, bimestre: e.target.value as any }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="I">I Bimestre</option>
              <option value="II">II Bimestre</option>
              <option value="III">III Bimestre</option>
              <option value="IV">IV Bimestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de registro de evaluaciones */}
      {selectedAulaId && selectedAreaId && selectedCompetenciaId ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Registro de Calificaciones
            </h3>
            <p className="text-sm text-gray-600">
              Escala: AD (Logro Destacado), A (Logro Esperado), B (En Proceso), C (En Inicio)
            </p>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estudiantesList.map((estudiante, index) => (
                <tr key={estudiante.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {estudiante.usuario?.nombre_completo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estudiante.codigo_estudiante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      {['AD', 'A', 'B', 'C'].map((calif) => (
                        <button
                          key={calif}
                          onClick={() => handleCalificacionChange(estudiante.id, calif)}
                          className={`px-4 py-2 rounded-md font-semibold ${
                            calificaciones[estudiante.id] === calif
                              ? calif === 'AD'
                                ? 'bg-green-600 text-white'
                                : calif === 'A'
                                ? 'bg-blue-600 text-white'
                                : calif === 'B'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {calif}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleGenerarBoleta(estudiante.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Generar boleta"
                      disabled={generarBoletaMutation.isPending}
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleRegistroMasivo}
              disabled={
                Object.keys(calificaciones).length === 0 || createBulkMutation.isPending
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={20} />
              {createBulkMutation.isPending ? 'Guardando...' : 'Guardar Evaluaciones'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <p>Seleccione aula, área curricular y competencia para comenzar el registro</p>
        </div>
      )}
    </div>
  );
};

export default EvaluacionesPage;

/**
 * 📝 NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. Sistema de evaluación por competencias (MINEDU):
 *    - Calificación cualitativa: AD, A, B, C
 *    - Por área curricular y competencia
 *    - Registro masivo por aula
 *
 * 2. Flujo de registro:
 *    - Seleccionar aula, área, competencia, bimestre
 *    - Asignar calificación a cada estudiante
 *    - Guardar evaluaciones en batch (más eficiente)
 *
 * 3. Generación de boletas:
 *    - Descarga PDF por estudiante
 *    - Incluye todas las evaluaciones del bimestre
 *
 * 4. Mejoras pendientes:
 *    - Cargar áreas curriculares desde API
 *    - Cargar competencias según área seleccionada
 *    - Permitir agregar observaciones
 *    - Vista previa de boleta
 */
