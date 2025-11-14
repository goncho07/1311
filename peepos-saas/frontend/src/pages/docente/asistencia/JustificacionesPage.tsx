/**
 * ═══════════════════════════════════════════════════════════
 * JUSTIFICACIONES - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Gestión de justificaciones de faltas/tardanzas
 * - Ver justificaciones pendientes, aprobadas y rechazadas
 * - Aprobar o rechazar con observaciones
 * - Ver documentos adjuntos
 * - Filtros por estado
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  FileText,
  Check,
  X,
  AlertCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Justificacion {
  id: string;
  estudiante: {
    id: string;
    nombre_completo: string;
    codigo: string;
    foto_perfil?: string;
  };
  fecha_falta: string;
  motivo: string;
  descripcion: string;
  documento_adjunto?: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha_solicitud: string;
  observaciones_docente?: string;
  procesado_por?: string;
  fecha_procesamiento?: string;
}

export default function JustificacionesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<
    'TODAS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  >('PENDIENTE');
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([]);

  const [justificacionSeleccionada, setJustificacionSeleccionada] =
    useState<Justificacion | null>(null);
  const [observaciones, setObservaciones] = useState<string>('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarJustificaciones();
  }, [filtroEstado]);

  const cargarJustificaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const estado = filtroEstado === 'TODAS' ? undefined : filtroEstado;
      const data = await docenteApi.getJustificaciones(estado);
      setJustificaciones(data.justificaciones || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar justificaciones');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (justificacion: Justificacion) => {
    setJustificacionSeleccionada(justificacion);
    setObservaciones(justificacion.observaciones_docente || '');
  };

  const cerrarModal = () => {
    setJustificacionSeleccionada(null);
    setObservaciones('');
  };

  const procesarJustificacion = async (accion: 'APROBAR' | 'RECHAZAR') => {
    if (!justificacionSeleccionada) return;

    try {
      setProcesando(true);
      setError(null);

      await docenteApi.procesarJustificacion(
        justificacionSeleccionada.id,
        accion,
        observaciones || undefined
      );

      setSuccess(
        `Justificación ${accion === 'APROBAR' ? 'aprobada' : 'rechazada'} correctamente`
      );
      cerrarModal();
      cargarJustificaciones();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || `Error al ${accion.toLowerCase()} justificación`);
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoBadge = (estado: Justificacion['estado']) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      APROBADA: 'bg-green-100 text-green-800',
      RECHAZADA: 'bg-red-100 text-red-800',
    };
    return badges[estado];
  };

  const contadores = {
    pendientes: justificaciones.filter((j) => j.estado === 'PENDIENTE').length,
    aprobadas: justificaciones.filter((j) => j.estado === 'APROBADA').length,
    rechazadas: justificaciones.filter((j) => j.estado === 'RECHAZADA').length,
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

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Justificaciones de Asistencia
        </h1>
        <p className="text-gray-600">PEEPOS ATTEND - Gestión de Justificaciones</p>
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
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-900">{contadores.pendientes}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Aprobadas</p>
          <p className="text-3xl font-bold text-green-900">{contadores.aprobadas}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Rechazadas</p>
          <p className="text-3xl font-bold text-red-900">{contadores.rechazadas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['TODAS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Justificaciones */}
      {!loading && justificaciones.length > 0 && (
        <div className="space-y-4">
          {justificaciones.map((justificacion) => (
            <div
              key={justificacion.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Foto del estudiante */}
                <div className="flex-shrink-0">
                  {justificacion.estudiante.foto_perfil ? (
                    <img
                      src={justificacion.estudiante.foto_perfil}
                      alt={justificacion.estudiante.nombre_completo}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {justificacion.estudiante.nombre_completo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Código: {justificacion.estudiante.codigo}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(
                        justificacion.estado
                      )}`}
                    >
                      {justificacion.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Fecha falta:{' '}
                        {new Date(justificacion.fecha_falta).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>Motivo: {justificacion.motivo}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{justificacion.descripcion}</p>

                  {justificacion.documento_adjunto && (
                    <a
                      href={justificacion.documento_adjunto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-3"
                    >
                      <FileText className="w-4 h-4" />
                      Ver documento adjunto
                    </a>
                  )}

                  {justificacion.observaciones_docente && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Observaciones del docente:
                          </p>
                          <p className="text-sm text-gray-600">
                            {justificacion.observaciones_docente}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {justificacion.estado === 'PENDIENTE' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModal(justificacion)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Revisar
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Procesada el{' '}
                      {justificacion.fecha_procesamiento
                        ? new Date(justificacion.fecha_procesamiento).toLocaleDateString('es-PE')
                        : '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando justificaciones...</p>
          </div>
        </div>
      )}

      {/* Sin justificaciones */}
      {!loading && justificaciones.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No hay justificaciones</p>
          <p className="text-blue-600 text-sm mt-2">
            No se encontraron justificaciones con el filtro seleccionado
          </p>
        </div>
      )}

      {/* Modal de Revisión */}
      {justificacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Revisar Justificación</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Estudiante</p>
                  <p className="font-semibold text-gray-900">
                    {justificacionSeleccionada.estudiante.nombre_completo}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Fecha de la falta</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(justificacionSeleccionada.fecha_falta).toLocaleDateString('es-PE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Motivo</p>
                  <p className="font-semibold text-gray-900">{justificacionSeleccionada.motivo}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-gray-900">{justificacionSeleccionada.descripcion}</p>
                </div>

                {justificacionSeleccionada.documento_adjunto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Documento adjunto</p>
                    <a
                      href={justificacionSeleccionada.documento_adjunto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <FileText className="w-4 h-4" />
                      Abrir documento
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Añade observaciones sobre esta justificación..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => procesarJustificacion('APROBAR')}
                  disabled={procesando}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {procesando ? 'Aprobando...' : 'Aprobar'}
                </button>

                <button
                  onClick={() => procesarJustificacion('RECHAZAR')}
                  disabled={procesando}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {procesando ? 'Rechazando...' : 'Rechazar'}
                </button>

                <button
                  onClick={cerrarModal}
                  disabled={procesando}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
