/**
 * ═══════════════════════════════════════════════════════════
 * REPORTE DE ASISTENCIA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Reporte mensual de asistencia por sección
 * - Filtros por sección, mes, año
 * - Tabla con porcentajes de asistencia por estudiante
 * - Resumen estadístico
 * - Exportar a Excel/PDF
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Download, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Seccion {
  id: string;
  nombre: string;
  grado: string;
}

interface ReporteEstudiante {
  id: string;
  codigo: string;
  nombre_completo: string;
  total_dias: number;
  presentes: number;
  faltas: number;
  tardanzas: number;
  justificados: number;
  porcentaje_asistencia: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface ResumenReporte {
  total_estudiantes: number;
  promedio_asistencia: number;
  total_presentes: number;
  total_faltas: number;
  total_tardanzas: number;
  estudiantes_riesgo: number; // < 85%
}

export default function ReporteAsistenciaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>('');

  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [anio, setAnio] = useState<number>(currentDate.getFullYear());

  const [estudiantes, setEstudiantes] = useState<ReporteEstudiante[]>([]);
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);

  useEffect(() => {
    cargarSecciones();
  }, []);

  useEffect(() => {
    if (seccionSeleccionada) {
      cargarReporte();
    }
  }, [seccionSeleccionada, mes, anio]);

  const cargarSecciones = async () => {
    try {
      const data = await docenteApi.getMisSecciones();
      setSecciones(data.secciones || []);
      if (data.secciones?.length > 0) {
        setSeccionSeleccionada(data.secciones[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar secciones');
    }
  };

  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await docenteApi.getReporteAsistencia({
        seccion_id: seccionSeleccionada,
        mes,
        anio,
      });

      setEstudiantes(data.estudiantes || []);
      setResumen(data.resumen || null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const anios = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 95) return 'text-green-700 bg-green-100';
    if (porcentaje >= 85) return 'text-blue-700 bg-blue-100';
    if (porcentaje >= 75) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const seccionActual = secciones.find((s) => s.id === seccionSeleccionada);

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

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reporte de Asistencia</h1>
        <p className="text-gray-600">PEEPOS ATTEND - Análisis Mensual</p>
      </div>

      {/* Error */}
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

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
            <select
              value={seccionSeleccionada}
              onChange={(e) => setSeccionSeleccionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {secciones.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.grado} - {seccion.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {meses.map((nombreMes, index) => (
                <option key={index + 1} value={index + 1}>
                  {nombreMes}
                </option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {seccionActual && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Reporte:</span> {seccionActual.grado} -{' '}
              {seccionActual.nombre} • {meses[mes - 1]} {anio}
            </p>
          </div>
        )}
      </div>

      {/* Resumen Estadístico */}
      {resumen && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Promedio General</p>
            <p className="text-3xl font-bold text-blue-900">{resumen.promedio_asistencia}%</p>
            <p className="text-xs text-gray-500 mt-1">{resumen.total_estudiantes} estudiantes</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Presentes</p>
            <p className="text-3xl font-bold text-green-900">{resumen.total_presentes}</p>
            <p className="text-xs text-green-700 mt-1">Días asistidos</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">Faltas</p>
            <p className="text-3xl font-bold text-red-900">{resumen.total_faltas}</p>
            <p className="text-xs text-red-700 mt-1">Total acumulado</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">En Riesgo</p>
            <p className="text-3xl font-bold text-orange-900">{resumen.estudiantes_riesgo}</p>
            <p className="text-xs text-orange-700 mt-1">Asistencia &lt; 85%</p>
          </div>
        </div>
      )}

      {/* Tabla de Reporte */}
      {!loading && estudiantes.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Detalle por Estudiante</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Días
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Presentes
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Faltas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Tardanzas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Just.
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    % Asist.
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Tend.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{estudiante.codigo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{estudiante.nombre_completo}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {estudiante.total_dias}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {estudiante.presentes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                        {estudiante.faltas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                        {estudiante.tardanzas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {estudiante.justificados}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-sm ${getColorPorcentaje(
                          estudiante.porcentaje_asistencia
                        )}`}
                      >
                        {estudiante.porcentaje_asistencia}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {estudiante.tendencia === 'up' && (
                        <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                      )}
                      {estudiante.tendencia === 'down' && (
                        <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                      {estudiante.tendencia === 'stable' && (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reporte...</p>
          </div>
        </div>
      )}

      {/* Sin datos */}
      {!loading && estudiantes.length === 0 && seccionSeleccionada && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-medium">No hay datos de asistencia</p>
          <p className="text-yellow-600 text-sm mt-2">
            No se encontró información para el período seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
