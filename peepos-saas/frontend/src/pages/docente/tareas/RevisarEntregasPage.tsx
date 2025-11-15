/**
 * ═══════════════════════════════════════════════════════════
 * REVISAR ENTREGAS - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Calificar entregas de tareas de los estudiantes
 * - Ver contenido de la entrega
 * - Descargar archivos adjuntos
 * - Calificar con nota y retroalimentación
 * - Estado: Calificado o Devuelto
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Download, FileText, Users, AlertCircle, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Entrega {
  id: string;
  estudiante: {
    id: string;
    nombre_completo: string;
    codigo: string;
    foto_perfil?: string;
  };
  contenido: string;
  archivos_adjuntos: Array<{
    nombre: string;
    url: string;
    tamano: number;
  }>;
  fecha_entrega: string;
  calificacion?: number;
  retroalimentacion?: string;
  estado: 'ENTREGADO' | 'CALIFICADO' | 'DEVUELTO';
}

export default function RevisarEntregasPage() {
  const { tareaId } = useParams<{ tareaId: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tarea, setTarea] = useState<any>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState<Entrega | null>(null);
  const [calificacion, setCalificacion] = useState<number>(0);
  const [retroalimentacion, setRetroalimentacion] = useState<string>('');

  useEffect(() => {
    if (tareaId) {
      cargarEntregas();
    }
  }, [tareaId]);

  const cargarEntregas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getEntregasTarea(tareaId!);
      setTarea(data.tarea);
      setEntregas(data.entregas || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCalificar = (entrega: Entrega) => {
    setEntregaSeleccionada(entrega);
    setCalificacion(entrega.calificacion || 0);
    setRetroalimentacion(entrega.retroalimentacion || '');
  };

  const cerrarModal = () => {
    setEntregaSeleccionada(null);
    setCalificacion(0);
    setRetroalimentacion('');
  };

  const handleCalificar = async (estado: 'CALIFICADO' | 'DEVUELTO') => {
    if (!entregaSeleccionada) return;

    if (estado === 'CALIFICADO' && (calificacion < 0 || calificacion > (tarea?.puntos_maximos || 20))) {
      setError(`La calificación debe estar entre 0 y ${tarea?.puntos_maximos || 20}`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await docenteApi.calificarEntrega(entregaSeleccionada.id, {
        calificacion,
        retroalimentacion: retroalimentacion || undefined,
        estado,
      });

      setSuccess(
        estado === 'CALIFICADO' ? 'Entrega calificada correctamente' : 'Entrega devuelta al estudiante'
      );
      cerrarModal();
      cargarEntregas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al calificar entrega');
    } finally {
      setSaving(false);
    }
  };

  const getEstadoBadge = (estado: Entrega['estado']) => {
    const badges = {
      ENTREGADO: 'bg-blue-100 text-blue-800',
      CALIFICADO: 'bg-green-100 text-green-800',
      DEVUELTO: 'bg-orange-100 text-orange-800',
    };
    return badges[estado];
  };

  const entregasPendientes = entregas.filter((e) => e.estado === 'ENTREGADO').length;
  const entregasCalificadas = entregas.filter((e) => e.estado === 'CALIFICADO').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link
          to="/tareas"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a Mis Tareas
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Revisar Entregas</h1>
        {tarea && (
          <p className="text-gray-600">
            {tarea.titulo} • {tarea.area} • {tarea.grado} - {tarea.seccion}
          </p>
        )}
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

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 font-medium">Total Entregas</p>
          <p className="text-3xl font-bold text-gray-900">{entregas.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-blue-900">{entregasPendientes}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Calificadas</p>
          <p className="text-3xl font-bold text-green-900">{entregasCalificadas}</p>
        </div>
      </div>

      {/* Lista de Entregas */}
      {!loading && entregas.length > 0 && (
        <div className="space-y-4">
          {entregas.map((entrega) => (
            <div
              key={entrega.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {entrega.estudiante.foto_perfil ? (
                    <img
                      src={entrega.estudiante.foto_perfil}
                      alt={entrega.estudiante.nombre_completo}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-7 h-7 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {entrega.estudiante.nombre_completo}
                    </h3>
                    <p className="text-sm text-gray-600">{entrega.estudiante.codigo}</p>
                    <p className="text-sm text-gray-500">
                      Entregado el: {new Date(entrega.fecha_entrega).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(
                    entrega.estado
                  )}`}
                >
                  {entrega.estado}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Contenido:</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{entrega.contenido}</p>
              </div>

              {entrega.archivos_adjuntos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Archivos adjuntos:</p>
                  <div className="space-y-2">
                    {entrega.archivos_adjuntos.map((archivo, idx) => (
                      <a
                        key={idx}
                        href={archivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        {archivo.nombre} ({(archivo.tamano / 1024).toFixed(2)} KB)
                        <Download className="w-4 h-4 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {entrega.calificacion !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-green-700">
                    Calificación: {entrega.calificacion} / {tarea?.puntos_maximos || 20} pts
                  </p>
                  {entrega.retroalimentacion && (
                    <p className="text-sm text-green-600 mt-2">{entrega.retroalimentacion}</p>
                  )}
                </div>
              )}

              {entrega.estado === 'ENTREGADO' && (
                <button
                  onClick={() => abrirModalCalificar(entrega)}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Calificar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando entregas...</p>
          </div>
        </div>
      )}

      {!loading && entregas.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No hay entregas aún</p>
          <p className="text-blue-600 text-sm mt-2">
            Los estudiantes aún no han entregado esta tarea
          </p>
        </div>
      )}

      {/* Modal Calificar */}
      {entregaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Calificar Entrega</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Estudiante</p>
                  <p className="font-semibold text-gray-900">
                    {entregaSeleccionada.estudiante.nombre_completo}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación (0 - {tarea?.puntos_maximos || 20} pts) *
                  </label>
                  <input
                    type="number"
                    value={calificacion}
                    onChange={(e) => setCalificacion(parseFloat(e.target.value))}
                    min={0}
                    max={tarea?.puntos_maximos || 20}
                    step={0.5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retroalimentación (opcional)
                  </label>
                  <textarea
                    value={retroalimentacion}
                    onChange={(e) => setRetroalimentacion(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe comentarios para el estudiante..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleCalificar('CALIFICADO')}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Calificar'}
                </button>

                <button
                  onClick={() => handleCalificar('DEVUELTO')}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
                >
                  Devolver para Corrección
                </button>

                <button
                  onClick={cerrarModal}
                  disabled={saving}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
