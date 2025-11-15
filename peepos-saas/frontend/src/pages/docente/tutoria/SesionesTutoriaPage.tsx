/**
 * ═══════════════════════════════════════════════════════════
 * SESIONES DE TUTORÍA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Registro de sesiones semanales de tutoría grupal
 * - Fecha, tema, dimensión (Personal/Social/Aprendizaje/Vocacional)
 * - Actividades realizadas y conclusiones
 * - Número de asistentes
 * - Historial mensual
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Calendar, Users, AlertCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Sesion {
  id: string;
  fecha: string;
  tema: string;
  dimension: 'Personal' | 'Social' | 'Aprendizaje' | 'Vocacional';
  actividades_realizadas: string;
  conclusiones: string;
  asistentes: number;
  seccion: string;
}

export default function SesionesTutoriaPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState({
    seccion_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tema: '',
    dimension: 'Personal' as Sesion['dimension'],
    actividades_realizadas: '',
    conclusiones: '',
    asistentes: 0,
  });

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
      const data = await docenteApi.getSesionesTutoria({ mes, anio });
      setSesiones(data.sesiones || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tema.trim() || !formData.actividades_realizadas.trim()) {
      setError('El tema y las actividades son obligatorios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await docenteApi.registrarSesionTutoria(formData);

      setSuccess('Sesión registrada correctamente');
      setMostrarFormulario(false);
      setFormData({
        seccion_id: '',
        fecha: new Date().toISOString().split('T')[0],
        tema: '',
        dimension: 'Personal',
        actividades_realizadas: '',
        conclusiones: '',
        asistentes: 0,
      });
      cargarSesiones();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar sesión');
    } finally {
      setSaving(false);
    }
  };

  const getDimensionColor = (dimension: Sesion['dimension']) => {
    const colors = {
      Personal: 'bg-pink-100 text-pink-800 border-pink-200',
      Social: 'bg-blue-100 text-blue-800 border-blue-200',
      Aprendizaje: 'bg-green-100 text-green-800 border-green-200',
      Vocacional: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[dimension];
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sesiones de Tutoría</h1>
            <p className="text-gray-600">PEEPOS TUTOR - Registro Semanal</p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Sesión
          </button>
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

      {/* Formulario Nueva Sesión */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Registrar Nueva Sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensión *</label>
                <select
                  value={formData.dimension}
                  onChange={(e) => handleChange('dimension', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Personal">Personal</option>
                  <option value="Social">Social</option>
                  <option value="Aprendizaje">Aprendizaje</option>
                  <option value="Vocacional">Vocacional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tema *</label>
              <input
                type="text"
                value={formData.tema}
                onChange={(e) => handleChange('tema', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Gestión de emociones - La inteligencia emocional"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actividades Realizadas *
              </label>
              <textarea
                value={formData.actividades_realizadas}
                onChange={(e) => handleChange('actividades_realizadas', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe las actividades que se realizaron en esta sesión..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conclusiones</label>
              <textarea
                value={formData.conclusiones}
                onChange={(e) => handleChange('conclusiones', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Principales conclusiones y compromisos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Asistentes
              </label>
              <input
                type="number"
                value={formData.asistentes}
                onChange={(e) => handleChange('asistentes', parseInt(e.target.value))}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Sesión'}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sesion.tema}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(sesion.fecha).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getDimensionColor(
                    sesion.dimension
                  )}`}
                >
                  {sesion.dimension}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Actividades:</p>
                  <p className="text-gray-700">{sesion.actividades_realizadas}</p>
                </div>

                {sesion.conclusiones && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Conclusiones:</p>
                    <p className="text-gray-700">{sesion.conclusiones}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{sesion.asistentes} estudiantes asistieron</span>
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
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">No hay sesiones registradas</p>
          <p className="text-blue-600 text-sm mt-2">Registra tu primera sesión de tutoría</p>
        </div>
      )}
    </div>
  );
}
