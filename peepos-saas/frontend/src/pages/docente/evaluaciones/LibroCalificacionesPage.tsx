/**
 * ═══════════════════════════════════════════════════════════
 * LIBRO DE CALIFICACIONES - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Vista consolidada de todas las notas por área
 * - Filtros por área, grado, sección, bimestre
 * - Tabla matricial: estudiantes x evaluaciones
 * - Promedio por estudiante y por evaluación
 * - Exportar a Excel
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Download, AlertCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Filtros {
  area_id?: string;
  grado_id?: string;
  seccion_id?: string;
  bimestre?: number;
}

interface Evaluacion {
  id: string;
  titulo: string;
  fecha: string;
  tipo: string;
}

interface NotaEstudiante {
  estudiante_id: string;
  codigo: string;
  nombre_completo: string;
  notas: { [evaluacion_id: string]: number | null };
  promedio: number;
}

export default function LibroCalificacionesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<NotaEstudiante[]>([]);

  useEffect(() => {
    if (filtros.area_id && filtros.seccion_id) {
      cargarLibro();
    }
  }, [filtros]);

  const cargarLibro = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getLibroCalificaciones(filtros);
      setEvaluaciones(data.evaluaciones || []);
      setEstudiantes(data.estudiantes || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar libro');
    } finally {
      setLoading(false);
    }
  };

  const getColorNota = (nota: number | null) => {
    if (nota === null) return 'bg-gray-100 text-gray-400';
    if (nota >= 18) return 'bg-purple-100 text-purple-900';
    if (nota >= 14) return 'bg-green-100 text-green-900';
    if (nota >= 11) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link to="/dashboard-docente" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Libro de Calificaciones</h1>
        <p className="text-gray-600">PEEPOS ACADEMIC - Vista Consolidada</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
            <select
              value={filtros.area_id || ''}
              onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar área</option>
              {/* TODO: Cargar áreas dinámicamente */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={filtros.grado_id || ''}
              onChange={(e) => setFiltros({ ...filtros, grado_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar grado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
            <select
              value={filtros.seccion_id || ''}
              onChange={(e) => setFiltros({ ...filtros, seccion_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar sección</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bimestre</label>
            <select
              value={filtros.bimestre || ''}
              onChange={(e) => setFiltros({ ...filtros, bimestre: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="1">Bimestre 1</option>
              <option value="2">Bimestre 2</option>
              <option value="3">Bimestre 3</option>
              <option value="4">Bimestre 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Libro */}
      {!loading && estudiantes.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Registro de Notas ({estudiantes.length} estudiantes)
            </h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50">
                    Estudiante
                  </th>
                  {evaluaciones.map((eval) => (
                    <th key={eval.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                      <div>{eval.titulo}</div>
                      <div className="text-xs font-normal text-gray-500">{eval.tipo}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 bg-blue-50">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estudiantes.map((est) => (
                  <tr key={est.estudiante_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 sticky left-0 bg-white">
                      <div>
                        <p className="font-medium text-gray-900">{est.nombre_completo}</p>
                        <p className="text-sm text-gray-500">{est.codigo}</p>
                      </div>
                    </td>
                    {evaluaciones.map((eval) => (
                      <td key={eval.id} className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded font-semibold ${getColorNota(est.notas[eval.id])}`}>
                          {est.notas[eval.id] ?? '-'}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center bg-blue-50">
                      <span className="text-lg font-bold text-blue-900">{est.promedio.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando libro...</p>
          </div>
        </div>
      )}
    </div>
  );
}
