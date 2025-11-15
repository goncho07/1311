/**
 * ═══════════════════════════════════════════════════════════
 * CASOS DE TUTORÍA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Gestión de casos de tutoría individual
 * - Crear casos por estudiante (conducta, académico, familiar, emocional)
 * - Prioridad: Baja, Media, Alta, Urgente
 * - Seguimiento y acciones tomadas
 * - Derivación a especialistas
 * - Estados: Abierto, En Seguimiento, Cerrado
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, AlertTriangle, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Caso {
  id: string;
  estudiante: {
    id: string;
    nombre_completo: string;
    codigo: string;
    foto_perfil?: string;
  };
  tipo_caso: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  descripcion: string;
  acciones_tomadas?: string;
  estado: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
  fecha_registro: string;
  seguimientos: Array<{
    fecha: string;
    descripcion: string;
  }>;
  derivado_a?: string;
}

export default function CasosTutoriaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [casos, setCasos] = useState<Caso[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | Caso['estado']>('ABIERTO');
  const [filtroPrioridad, setFiltroPrioridad] = useState<'TODAS' | Caso['prioridad']>('TODAS');

  const [casoSeleccionado, setCasoSeleccionado] = useState<Caso | null>(null);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState<string>('');

  useEffect(() => {
    cargarCasos();
  }, [filtroEstado, filtroPrioridad]);

  const cargarCasos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filtroEstado !== 'TODOS') params.estado = filtroEstado;
      if (filtroPrioridad !== 'TODAS') params.prioridad = filtroPrioridad;

      const data = await docenteApi.getCasosTutoria(params);
      setCasos(data.casos || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar casos');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadBadge = (prioridad: Caso['prioridad']) => {
    const badges = {
      BAJA: 'bg-blue-100 text-blue-800',
      MEDIA: 'bg-yellow-100 text-yellow-800',
      ALTA: 'bg-orange-100 text-orange-800',
      URGENTE: 'bg-red-100 text-red-800',
    };
    return badges[prioridad];
  };

  const getEstadoBadge = (estado: Caso['estado']) => {
    const badges = {
      ABIERTO: 'bg-green-100 text-green-800',
      EN_SEGUIMIENTO: 'bg-blue-100 text-blue-800',
      CERRADO: 'bg-gray-100 text-gray-800',
    };
    return badges[estado];
  };

  const contadores = {
    abiertos: casos.filter((c) => c.estado === 'ABIERTO').length,
    enSeguimiento: casos.filter((c) => c.estado === 'EN_SEGUIMIENTO').length,
    cerrados: casos.filter((c) => c.estado === 'CERRADO').length,
  };

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
              Casos de Tutoría Individual
            </h1>
            <p className="text-gray-600">PEEPOS TUTOR - Seguimiento de Casos</p>
          </div>
          <Link
            to="/tutoria/casos/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Caso
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Abiertos</p>
          <p className="text-3xl font-bold text-green-900">{contadores.abiertos}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">En Seguimiento</p>
          <p className="text-3xl font-bold text-blue-900">{contadores.enSeguimiento}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Cerrados</p>
          <p className="text-3xl font-bold text-gray-900">{contadores.cerrados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <div className="flex gap-2 flex-wrap">
              {(['TODOS', 'ABIERTO', 'EN_SEGUIMIENTO', 'CERRADO'] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtroEstado === estado
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {estado.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <div className="flex gap-2 flex-wrap">
              {(['TODAS', 'BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((prioridad) => (
                <button
                  key={prioridad}
                  onClick={() => setFiltroPrioridad(prioridad)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtroPrioridad === prioridad
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {prioridad}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Casos */}
      {!loading && casos.length > 0 && (
        <div className="space-y-4">
          {casos.map((caso) => (
            <div key={caso.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {caso.estudiante.nombre_completo}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {caso.estudiante.codigo} • {caso.tipo_caso}
                    </p>
                    <p className="text-sm text-gray-500">
                      Registrado: {new Date(caso.fecha_registro).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getPrioridadBadge(
                      caso.prioridad
                    )}`}
                  >
                    {caso.prioridad}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(
                      caso.estado
                    )}`}
                  >
                    {caso.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                  <p className="text-gray-700">{caso.descripcion}</p>
                </div>

                {caso.acciones_tomadas && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Acciones Tomadas:</p>
                    <p className="text-gray-700">{caso.acciones_tomadas}</p>
                  </div>
                )}

                {caso.derivado_a && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-900">
                      Derivado a: {caso.derivado_a}
                    </p>
                  </div>
                )}

                {caso.seguimientos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Seguimientos ({caso.seguimientos.length})
                    </p>
                    <div className="space-y-2">
                      {caso.seguimientos.slice(0, 2).map((seg, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(seg.fecha).toLocaleDateString('es-PE')}
                          </p>
                          <p className="text-sm text-gray-700">{seg.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setCasoSeleccionado(caso)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Ver Detalles
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
            <p className="mt-4 text-gray-600">Cargando casos...</p>
          </div>
        </div>
      )}

      {!loading && casos.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No hay casos registrados</p>
          <p className="text-blue-600 text-sm mt-2">
            Crea un nuevo caso para darle seguimiento individualizado a un estudiante
          </p>
        </div>
      )}
    </div>
  );
}
