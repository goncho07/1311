/**
 * ═══════════════════════════════════════════════════════════
 * CREAR/EDITAR TAREA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Formulario para crear o editar tareas académicas
 * - Información básica (título, descripción, instrucciones)
 * - Configuración (área, grado, sección, fecha entrega)
 * - Puntos y peso
 * - Opciones de archivos adjuntos
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, AlertCircle, FileText } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

export default function CrearTareaPage() {
  const navigate = useNavigate();
  const { tareaId } = useParams();
  const isEditing = !!tareaId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    area_curricular_id: '',
    grado_id: '',
    seccion_id: '',
    titulo: '',
    descripcion: '',
    instrucciones: '',
    fecha_entrega: '',
    puntos_maximos: 20,
    peso: 1,
    tipo: 'Tarea',
    permite_archivos: true,
    max_archivos: 5,
  });

  useEffect(() => {
    if (isEditing && tareaId) {
      // TODO: Cargar datos de la tarea para editar
    }
  }, [tareaId, isEditing]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    if (!formData.fecha_entrega) {
      setError('La fecha de entrega es obligatoria');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditing && tareaId) {
        await docenteApi.actualizarTarea(tareaId, formData);
      } else {
        await docenteApi.crearTarea(formData);
      }

      navigate('/tareas');
    } catch (err: any) {
      setError(err.message || 'Error al guardar tarea');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </h1>
        <p className="text-gray-600">Gestión de Tareas Académicas</p>
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

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Ensayo sobre la Fotosíntesis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente la tarea..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones (opcional)
                </label>
                <textarea
                  value={formData.instrucciones}
                  onChange={(e) => handleChange('instrucciones', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Instrucciones detalladas para completar la tarea..."
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área *</label>
                <select
                  value={formData.area_curricular_id}
                  onChange={(e) => handleChange('area_curricular_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar área</option>
                  {/* TODO: Cargar áreas dinámicamente */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado *</label>
                <select
                  value={formData.grado_id}
                  onChange={(e) => handleChange('grado_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar grado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sección *</label>
                <select
                  value={formData.seccion_id}
                  onChange={(e) => handleChange('seccion_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar sección</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Tarea
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tarea">Tarea</option>
                  <option value="Proyecto">Proyecto</option>
                  <option value="Investigación">Investigación</option>
                  <option value="Práctica">Práctica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega *
                </label>
                <input
                  type="date"
                  value={formData.fecha_entrega}
                  onChange={(e) => handleChange('fecha_entrega', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntos Máximos
                </label>
                <input
                  type="number"
                  value={formData.puntos_maximos}
                  onChange={(e) => handleChange('puntos_maximos', parseInt(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (para el promedio)
                </label>
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => handleChange('peso', parseFloat(e.target.value))}
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Opciones de Archivos */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Archivos Adjuntos</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="permite_archivos"
                  checked={formData.permite_archivos}
                  onChange={(e) => handleChange('permite_archivos', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="permite_archivos" className="text-sm font-medium text-gray-700">
                  Permitir que los estudiantes adjunten archivos
                </label>
              </div>

              {formData.permite_archivos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de archivos permitidos
                  </label>
                  <input
                    type="number"
                    value={formData.max_archivos}
                    onChange={(e) => handleChange('max_archivos', parseInt(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
            </button>
            <Link
              to="/tareas"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
