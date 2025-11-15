/**
 * ═══════════════════════════════════════════════════════════
 * SESIONES DE APRENDIZAJE - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Planificación curricular de sesiones de clase
 * - Título, competencias, propósito
 * - Momentos pedagógicos: Inicio, Desarrollo, Cierre
 * - Recursos y evaluación
 * - Calendario mensual
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface SesionAprendizaje {
  id: string;
  fecha: string;
  titulo: string;
  area: string;
  grado: string;
  seccion: string;
  competencias: string[];
  proposito: string;
  momentos_pedagogicos: {
    inicio: string;
    desarrollo: string;
    cierre: string;
  };
}

export default function SesionesAprendizajePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sesiones, setSesiones] = useState<SesionAprendizaje[]>([]);

  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [anio, setAnio] = useState(currentDate.getFullYear());

  useEffect(() => {
    cargarSesiones();
  }, [mes, anio]);

  const cargarSesiones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getSesionesAprendizaje({ mes });
      setSesiones(data.sesiones || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link
          to="/dashboard-docente"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sesiones de Aprendizaje
            </h1>
            <p className="text-gray-600">Planificación Curricular</p>
          </div>
          <Link
            to="/planificacion/sesiones/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Sesión
          </Link>
        </div>
      </div>

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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {meses.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Sesiones */}
      {!loading && sesiones.length > 0 && (
        <div className="space-y-4">
          {sesiones.map((sesion) => (
            <div key={sesion.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{sesion.titulo}</h3>
                  <p className="text-sm text-gray-600">
                    {sesion.area} • {sesion.grado} - {sesion.seccion}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(sesion.fecha).toLocaleDateString('es-PE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Propósito:</p>
                  <p className="text-gray-700">{sesion.proposito}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Competencias:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {sesion.competencias.map((comp, idx) => (
                      <li key={idx} className="text-sm">
                        {comp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Inicio</p>
                    <p className="text-sm text-gray-700">{sesion.momentos_pedagogicos.inicio}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-2">Desarrollo</p>
                    <p className="text-sm text-gray-700">{sesion.momentos_pedagogicos.desarrollo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-2">Cierre</p>
                    <p className="text-sm text-gray-700">{sesion.momentos_pedagogicos.cierre}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando sesiones...</p>
          </div>
        </div>
      )}

      {!loading && sesiones.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No hay sesiones planificadas</p>
          <p className="text-blue-600 text-sm mt-2">
            Crea tu primera sesión de aprendizaje para este mes
          </p>
        </div>
      )}
    </div>
  );
}
