/**
 * ═══════════════════════════════════════════════════════════
 * REGISTRAR ASISTENCIA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Página para registrar asistencia de estudiantes
 * - Modo manual (checkboxes)
 * - Modo QR (genera código QR para que estudiantes escaneen)
 * - Selección de sección y fecha
 * - Estados: PRESENTE, FALTA, TARDANZA, JUSTIFICADO
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, QrCode, Save, Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Seccion {
  id: string;
  nombre: string;
  grado: string;
  nivel: string;
  total_estudiantes: number;
}

interface Estudiante {
  id: string;
  codigo: string;
  nombre_completo: string;
  foto_perfil?: string;
  asistencia_actual?: 'PRESENTE' | 'FALTA' | 'TARDANZA' | 'JUSTIFICADO';
  observaciones?: string;
}

type ModoRegistro = 'MANUAL' | 'QR';

export default function RegistrarAsistenciaPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modo, setModo] = useState<ModoRegistro>('MANUAL');

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpira, setQrExpira] = useState<Date | null>(null);

  useEffect(() => {
    cargarSecciones();
  }, []);

  useEffect(() => {
    if (seccionSeleccionada && fecha) {
      cargarEstudiantes();
    }
  }, [seccionSeleccionada, fecha]);

  const cargarSecciones = async () => {
    try {
      setLoading(true);
      const data = await docenteApi.getMisSecciones();
      setSecciones(data.secciones || []);
      if (data.secciones?.length > 0) {
        setSeccionSeleccionada(data.secciones[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar secciones');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getEstudiantesParaAsistencia(seccionSeleccionada, fecha);
      setEstudiantes(data.estudiantes || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const generarQR = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.generarQRAsistencia(seccionSeleccionada, fecha);
      setQrCode(data.qr_code);
      setQrExpira(new Date(data.expira_en));
      setModo('QR');
    } catch (err: any) {
      setError(err.message || 'Error al generar código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (estudianteId: string, estado: Estudiante['asistencia_actual']) => {
    setEstudiantes((prev) =>
      prev.map((est) => (est.id === estudianteId ? { ...est, asistencia_actual: estado } : est))
    );
  };

  const handleObservacionChange = (estudianteId: string, observacion: string) => {
    setEstudiantes((prev) =>
      prev.map((est) => (est.id === estudianteId ? { ...est, observaciones: observacion } : est))
    );
  };

  const marcarTodos = (estado: Estudiante['asistencia_actual']) => {
    setEstudiantes((prev) => prev.map((est) => ({ ...est, asistencia_actual: estado })));
  };

  const handleGuardar = async () => {
    try {
      // Validar que todos tengan un estado
      const sinEstado = estudiantes.filter((est) => !est.asistencia_actual);
      if (sinEstado.length > 0) {
        setError(
          `Hay ${sinEstado.length} estudiante(s) sin estado de asistencia. Por favor marca a todos.`
        );
        return;
      }

      setSaving(true);
      setError(null);

      await docenteApi.registrarAsistencia({
        seccion_id: seccionSeleccionada,
        fecha,
        asistencias: estudiantes.map((est) => ({
          estudiante_id: est.id,
          estado: est.asistencia_actual!,
          observaciones: est.observaciones,
        })),
      });

      setSuccess('Asistencia registrada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar asistencia');
    } finally {
      setSaving(false);
    }
  };

  const seccionActual = secciones.find((s) => s.id === seccionSeleccionada);

  const contadores = {
    presentes: estudiantes.filter((e) => e.asistencia_actual === 'PRESENTE').length,
    faltas: estudiantes.filter((e) => e.asistencia_actual === 'FALTA').length,
    tardanzas: estudiantes.filter((e) => e.asistencia_actual === 'TARDANZA').length,
    justificados: estudiantes.filter((e) => e.asistencia_actual === 'JUSTIFICADO').length,
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
          Registrar Asistencia
        </h1>
        <p className="text-gray-600">PEEPOS ATTEND - Control de Asistencia</p>
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

      {/* Controles principales */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Selección de Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={seccionSeleccionada}
              onChange={(e) => setSeccionSeleccionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {secciones.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.grado} - {seccion.nombre} ({seccion.total_estudiantes} estudiantes)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Modo de Registro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Registro
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setModo('MANUAL')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  modo === 'MANUAL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Manual
              </button>
              <button
                onClick={generarQR}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  modo === 'QR'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                <QrCode className="w-4 h-4 inline mr-1" />
                Código QR
              </button>
            </div>
          </div>
        </div>

        {/* Información de la sección */}
        {seccionActual && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Sección Actual</p>
                <p className="text-lg font-bold text-blue-900">
                  {seccionActual.grado} - {seccionActual.nombre}
                </p>
                <p className="text-sm text-blue-700">
                  {seccionActual.total_estudiantes} estudiantes • {seccionActual.nivel}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* Modo Manual */}
      {modo === 'MANUAL' && !loading && estudiantes.length > 0 && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Presentes</p>
              <p className="text-2xl font-bold text-green-900">{contadores.presentes}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Faltas</p>
              <p className="text-2xl font-bold text-red-900">{contadores.faltas}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Tardanzas</p>
              <p className="text-2xl font-bold text-yellow-900">{contadores.tardanzas}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Justificados</p>
              <p className="text-2xl font-bold text-blue-900">{contadores.justificados}</p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Marcar a todos como:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => marcarTodos('PRESENTE')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
              >
                ✓ Presente
              </button>
              <button
                onClick={() => marcarTodos('FALTA')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                ✕ Falta
              </button>
              <button
                onClick={() => marcarTodos('TARDANZA')}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium"
              >
                ⏱ Tardanza
              </button>
            </div>
          </div>

          {/* Lista de Estudiantes */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estudiante
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50">
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
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {estudiante.nombre_completo}
                            </p>
                            <p className="text-sm text-gray-500">{estudiante.codigo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEstadoChange(estudiante.id, 'PRESENTE')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              estudiante.asistencia_actual === 'PRESENTE'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleEstadoChange(estudiante.id, 'FALTA')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              estudiante.asistencia_actual === 'FALTA'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleEstadoChange(estudiante.id, 'TARDANZA')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              estudiante.asistencia_actual === 'TARDANZA'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ⏱
                          </button>
                          <button
                            onClick={() => handleEstadoChange(estudiante.id, 'JUSTIFICADO')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              estudiante.asistencia_actual === 'JUSTIFICADO'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            J
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={estudiante.observaciones || ''}
                          onChange={(e) => handleObservacionChange(estudiante.id, e.target.value)}
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
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </>
      )}

      {/* Modo QR */}
      {modo === 'QR' && qrCode && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Código QR para Registro de Asistencia
            </h2>
            <p className="text-gray-600 mb-6">
              Los estudiantes deben escanear este código QR para marcar su asistencia
            </p>

            <div className="inline-block p-6 bg-white border-4 border-purple-600 rounded-lg">
              <img src={qrCode} alt="Código QR" className="w-64 h-64" />
            </div>

            {qrExpira && (
              <p className="mt-4 text-sm text-gray-500">
                Este código expira en: {qrExpira.toLocaleTimeString()}
              </p>
            )}

            <div className="mt-6">
              <button
                onClick={generarQR}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Regenerar Código QR
              </button>
            </div>
          </div>
        </div>
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

      {/* Sin estudiantes */}
      {!loading && modo === 'MANUAL' && estudiantes.length === 0 && seccionSeleccionada && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-medium">No se encontraron estudiantes</p>
          <p className="text-yellow-600 text-sm mt-2">
            Verifica que la sección y fecha sean correctas
          </p>
        </div>
      )}
    </div>
  );
}
