/**
 * ═══════════════════════════════════════════════════════════
 * MIS TAREAS - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Lista de tareas creadas por el docente
 * - Filtros por área, sección, estado
 * - Crear nueva tarea
 * - Editar/Eliminar tarea
 * - Ver entregas pendientes
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Edit, Trash2, FileText, Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  grado: string;
  seccion: string;
  fecha_entrega: string;
  puntos_maximos: number;
  tipo: string;
  estado: 'ACTIVA' | 'CERRADA';
  total_estudiantes: number;
  entregas_recibidas: number;
  entregas_calificadas: number;
}

export default function MisTareasPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'ACTIVA' | 'CERRADA'>('ACTIVA');

  useEffect(() => {
    cargarTareas();
  }, [filtroEstado]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);
      const estado = filtroEstado === 'TODAS' ? undefined : filtroEstado;
      const data = await docenteApi.getTareas({ estado });
      setTareas(data.tareas || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (tareaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await docenteApi.eliminarTarea(tareaId);
      setSuccess('Tarea eliminada correctamente');
      cargarTareas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar tarea');
    }
  };

  const getEstadoBadge = (estado: Tarea['estado']) => {
    return estado === 'ACTIVA'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const estaVencida = (fechaEntrega: string) => {
    return new Date(fechaEntrega) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link to="/dashboard-docente" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mis Tareas</h1>
            <p className="text-gray-600">Gestión de Tareas Académicas</p>
          </div>
          <Link
            to="/tareas/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
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
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center mt-0.5">✓</div>
            <p className="text-green-800 flex-1">{success}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['TODAS', 'ACTIVA', 'CERRADA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tareas */}
      {!loading && tareas.length > 0 && (
        <div className="space-y-4">
          {tareas.map((tarea) => (
            <div key={tarea.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <FileText className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{tarea.titulo}</h3>
                      <p className="text-sm text-gray-600">
                        {tarea.area} • {tarea.grado} - {tarea.seccion}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{tarea.descripcion}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(tarea.estado)}`}>
                  {tarea.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Entrega</p>
                    <p className={`font-medium ${estaVencida(tarea.fecha_entrega) ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(tarea.fecha_entrega).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Entregas</p>
                    <p className="font-medium text-gray-900">
                      {tarea.entregas_recibidas}/{tarea.total_estudiantes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Calificadas</p>
                    <p className="font-medium text-gray-900">{tarea.entregas_calificadas}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Puntos</p>
                    <p className="font-medium text-gray-900">{tarea.puntos_maximos} pts</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/tareas/${tarea.id}/entregas`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Ver Entregas
                </Link>
                <Link
                  to={`/tareas/${tarea.id}/editar`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={() => handleEliminar(tarea.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tareas...</p>
          </div>
        </div>
      )}

      {!loading && tareas.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No tienes tareas creadas</p>
          <p className="text-blue-600 text-sm mt-2">Crea tu primera tarea para comenzar</p>
          <Link
            to="/tareas/crear"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </Link>
        </div>
      )}
    </div>
  );
}
