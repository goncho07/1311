/**
 * ═══════════════════════════════════════════════════════════
 * REGISTRAR NOTAS - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Registro masivo de notas por evaluación
 * - Selección de evaluación
 * - Botones AD/A/B/C para calificación rápida (CNEB)
 * - Conversión automática a escala vigesimal
 * - Observaciones por estudiante
 * - Guardado masivo
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Save, AlertCircle, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Evaluacion {
  id: string;
  titulo: string;
  area: string;
  grado: string;
  seccion: string;
  fecha_evaluacion: string;
  bimestre: number;
  tipo: string;
}

interface EstudianteNota {
  id: string;
  estudiante_id: string;
  codigo: string;
  nombre_completo: string;
  foto_perfil?: string;
  calificacion_literal?: 'AD' | 'A' | 'B' | 'C';
  calificacion_numerica?: number;
  observaciones?: string;
  ya_calificado: boolean;
}

export default function RegistrarNotasPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>('');
  const [estudiantes, setEstudiantes] = useState<EstudianteNota[]>([]);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  useEffect(() => {
    if (evaluacionSeleccionada) {
      cargarEstudiantes();
    }
  }, [evaluacionSeleccionada]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await docenteApi.getMisEvaluaciones();
      // Filtrar solo evaluaciones sin calificar o parcialmente calificadas
      setEvaluaciones(data.evaluaciones || []);
      if (data.evaluaciones?.length > 0) {
        setEvaluacionSeleccionada(data.evaluaciones[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getEstudiantesParaNotas(evaluacionSeleccionada);
      setEstudiantes(data.estudiantes || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificacionChange = (
    estudianteId: string,
    calificacion: 'AD' | 'A' | 'B' | 'C'
  ) => {
    setEstudiantes((prev) =>
      prev.map((est) => {
        if (est.estudiante_id === estudianteId) {
          // Conversión CNEB a escala vigesimal
          const conversion = {
            AD: 18, // Logro destacado (18-20)
            A: 15, // Logro esperado (14-17)
            B: 12, // En proceso (11-13)
            C: 9, // En inicio (0-10)
          };
          return {
            ...est,
            calificacion_literal: calificacion,
            calificacion_numerica: conversion[calificacion],
          };
        }
        return est;
      })
    );
  };

  const handleObservacionChange = (estudianteId: string, observacion: string) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.estudiante_id === estudianteId ? { ...est, observaciones: observacion } : est
      )
    );
  };

  const marcarTodos = (calificacion: 'AD' | 'A' | 'B' | 'C') => {
    const conversion = {
      AD: 18,
      A: 15,
      B: 12,
      C: 9,
    };
    setEstudiantes((prev) =>
      prev.map((est) => ({
        ...est,
        calificacion_literal: calificacion,
        calificacion_numerica: conversion[calificacion],
      }))
    );
  };

  const handleGuardar = async () => {
    try {
      // Validar que todos tengan calificación
      const sinNota = estudiantes.filter((est) => !est.calificacion_literal);
      if (sinNota.length > 0) {
        setError(
          `Hay ${sinNota.length} estudiante(s) sin calificación. Por favor califica a todos.`
        );
        return;
      }

      setSaving(true);
      setError(null);

      await docenteApi.registrarNotas(
        evaluacionSeleccionada,
        estudiantes.map((est) => ({
          estudiante_id: est.estudiante_id,
          calificacion_literal: est.calificacion_literal!,
          calificacion_numerica: est.calificacion_numerica,
          observaciones: est.observaciones,
        }))
      );

      setSuccess('Notas registradas correctamente');
      setTimeout(() => {
        setSuccess(null);
        cargarEstudiantes(); // Recargar para actualizar estado
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar notas');
    } finally {
      setSaving(false);
    }
  };

  const evaluacionActual = evaluaciones.find((e) => e.id === evaluacionSeleccionada);

  const contadores = {
    AD: estudiantes.filter((e) => e.calificacion_literal === 'AD').length,
    A: estudiantes.filter((e) => e.calificacion_literal === 'A').length,
    B: estudiantes.filter((e) => e.calificacion_literal === 'B').length,
    C: estudiantes.filter((e) => e.calificacion_literal === 'C').length,
    sinNota: estudiantes.filter((e) => !e.calificacion_literal).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard-docente"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Registrar Notas</h1>
        <p className="text-gray-600">PEEPOS ACADEMIC - Calificaciones</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center mt-0.5">
              ✓
            </div>
            <p className="text-green-800 flex-1">{success}</p>
          </div>
        </div>
      )}

      {/* Selección de Evaluación */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona la Evaluación
        </label>
        <select
          value={evaluacionSeleccionada}
          onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          {evaluaciones.map((evaluacion) => (
            <option key={evaluacion.id} value={evaluacion.id}>
              {evaluacion.titulo} - {evaluacion.area} ({evaluacion.grado} - {evaluacion.seccion}) •
              Bimestre {evaluacion.bimestre}
            </option>
          ))}
        </select>

        {evaluacionActual && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Evaluación Seleccionada</p>
                <p className="text-lg font-bold text-blue-900">{evaluacionActual.titulo}</p>
                <p className="text-sm text-blue-700">
                  {evaluacionActual.area} • {evaluacionActual.grado} - {evaluacionActual.seccion} •
                  {evaluacionActual.tipo}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* Leyenda CNEB */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Escala de Calificación CNEB</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border-l-4 border-purple-600 pl-4">
            <p className="font-bold text-purple-900">AD - Logro Destacado</p>
            <p className="text-sm text-gray-600">Cuando el estudiante evidencia un nivel superior a lo esperado</p>
            <p className="text-xs text-purple-600 mt-1">Equivale: 18-20</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <p className="font-bold text-green-900">A - Logro Esperado</p>
            <p className="text-sm text-gray-600">Cuando el estudiante evidencia el nivel esperado</p>
            <p className="text-xs text-green-600 mt-1">Equivale: 14-17</p>
          </div>
          <div className="border-l-4 border-yellow-600 pl-4">
            <p className="font-bold text-yellow-900">B - En Proceso</p>
            <p className="text-sm text-gray-600">Cuando el estudiante está próximo al nivel esperado</p>
            <p className="text-xs text-yellow-600 mt-1">Equivale: 11-13</p>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <p className="font-bold text-red-900">C - En Inicio</p>
            <p className="text-sm text-gray-600">Cuando el estudiante muestra un progreso mínimo</p>
            <p className="text-xs text-red-600 mt-1">Equivale: 0-10</p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {!loading && estudiantes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">AD</p>
            <p className="text-2xl font-bold text-purple-900">{contadores.AD}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">A</p>
            <p className="text-2xl font-bold text-green-900">{contadores.A}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">B</p>
            <p className="text-2xl font-bold text-yellow-900">{contadores.B}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">C</p>
            <p className="text-2xl font-bold text-red-900">{contadores.C}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Sin Nota</p>
            <p className="text-2xl font-bold text-gray-900">{contadores.sinNota}</p>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      {!loading && estudiantes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Marcar a todos como:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => marcarTodos('AD')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-bold"
            >
              AD
            </button>
            <button
              onClick={() => marcarTodos('A')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-bold"
            >
              A
            </button>
            <button
              onClick={() => marcarTodos('B')}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-bold"
            >
              B
            </button>
            <button
              onClick={() => marcarTodos('C')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold"
            >
              C
            </button>
          </div>
        </div>
      )}

      {/* Lista de Estudiantes */}
      {!loading && estudiantes.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estudiante
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Calificación
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Nota (0-20)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {estudiantes.map((estudiante) => (
                    <tr
                      key={estudiante.estudiante_id}
                      className={`hover:bg-gray-50 ${
                        estudiante.ya_calificado ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {estudiante.foto_perfil ? (
                            <img
                              src={estudiante.foto_perfil}
                              alt={estudiante.nombre_completo}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {estudiante.nombre_completo}
                            </p>
                            <p className="text-sm text-gray-500">{estudiante.codigo}</p>
                          </div>
                          {estudiante.ya_calificado && (
                            <Trophy className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {(['AD', 'A', 'B', 'C'] as const).map((cal) => (
                            <button
                              key={cal}
                              onClick={() => handleCalificacionChange(estudiante.estudiante_id, cal)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                estudiante.calificacion_literal === cal
                                  ? cal === 'AD'
                                    ? 'bg-purple-600 text-white'
                                    : cal === 'A'
                                    ? 'bg-green-600 text-white'
                                    : cal === 'B'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {cal}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {estudiante.calificacion_numerica || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={estudiante.observaciones || ''}
                          onChange={(e) =>
                            handleObservacionChange(estudiante.estudiante_id, e.target.value)
                          }
                          placeholder="Opcional..."
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleGuardar}
              disabled={saving || contadores.sinNota > 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Notas'}
            </button>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      )}

      {/* Sin evaluaciones */}
      {!loading && evaluaciones.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-medium">No tienes evaluaciones disponibles</p>
          <p className="text-yellow-600 text-sm mt-2">
            Crea una evaluación primero para poder registrar notas
          </p>
        </div>
      )}
    </div>
  );
}
