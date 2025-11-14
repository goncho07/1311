/**
 * ═══════════════════════════════════════════════════════════
 * PLAN DE TUTORÍA - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Plan anual de tutoría según 4 dimensiones MINEDU:
 * - Personal: Autoconocimiento, autoestima
 * - Social: Convivencia, ciudadanía
 * - Aprendizaje: Estrategias de estudio
 * - Vocacional: Orientación profesional
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Save, AlertCircle, Heart, Users, BookOpen, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface Dimension {
  dimension: 'Personal' | 'Social' | 'Aprendizaje' | 'Vocacional';
  objetivos: string;
  actividades: string;
  recursos: string;
  icon: any;
  color: string;
}

export default function PlanTutoriaPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dimensiones, setDimensiones] = useState<Dimension[]>([
    { dimension: 'Personal', objetivos: '', actividades: '', recursos: '', icon: Heart, color: 'pink' },
    { dimension: 'Social', objetivos: '', actividades: '', recursos: '', icon: Users, color: 'blue' },
    { dimension: 'Aprendizaje', objetivos: '', actividades: '', recursos: '', icon: BookOpen, color: 'green' },
    { dimension: 'Vocacional', objetivos: '', actividades: '', recursos: '', icon: Briefcase, color: 'purple' },
  ]);

  const [seccionId, setSeccionId] = useState<string>('');
  const [periodoId, setPeriodoId] = useState<string>('');

  useEffect(() => {
    // TODO: Cargar plan existente si hay
  }, []);

  const handleDimensionChange = (
    index: number,
    field: 'objetivos' | 'actividades' | 'recursos',
    value: string
  ) => {
    setDimensiones((prev) =>
      prev.map((dim, i) => (i === index ? { ...dim, [field]: value } : dim))
    );
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      setError(null);

      await docenteApi.guardarPlanTutoria({
        periodo_id: periodoId,
        seccion_id: seccionId,
        dimensiones: dimensiones.map((d) => ({
          dimension: d.dimension,
          objetivos: d.objetivos,
          actividades: d.actividades,
          recursos: d.recursos,
        })),
      });

      setSuccess('Plan de tutoría guardado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar plan');
    } finally {
      setSaving(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: any = {
      pink: 'bg-pink-50 border-pink-200 text-pink-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link to="/dashboard-docente" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Plan de Tutoría</h1>
        <p className="text-gray-600">PEEPOS TUTOR - Planificación Anual según 4 Dimensiones MINEDU</p>
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-2">Dimensiones de la Tutoría</h2>
        <p className="text-blue-700 text-sm">
          Según el MINEDU, el plan de tutoría debe abordar 4 dimensiones del desarrollo integral del estudiante.
          Completa los objetivos, actividades y recursos para cada dimensión.
        </p>
      </div>

      {/* Dimensiones */}
      <div className="space-y-6 mb-6">
        {dimensiones.map((dim, index) => {
          const Icon = dim.icon;
          return (
            <div key={dim.dimension} className={`border-2 rounded-lg p-6 ${getColorClasses(dim.color)}`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">{dim.dimension}</h3>
                  <p className="text-sm">
                    {dim.dimension === 'Personal' && 'Autoconocimiento, autoestima, gestión de emociones'}
                    {dim.dimension === 'Social' && 'Convivencia, relaciones saludables, ciudadanía'}
                    {dim.dimension === 'Aprendizaje' && 'Estrategias de estudio, hábitos, organización'}
                    {dim.dimension === 'Vocacional' && 'Orientación profesional, proyecto de vida'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Objetivos</label>
                  <textarea
                    value={dim.objetivos}
                    onChange={(e) => handleDimensionChange(index, 'objetivos', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="¿Qué se busca lograr en esta dimensión?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Actividades</label>
                  <textarea
                    value={dim.actividades}
                    onChange={(e) => handleDimensionChange(index, 'actividades', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe las actividades que realizarás durante el año..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Recursos</label>
                  <textarea
                    value={dim.recursos}
                    onChange={(e) => handleDimensionChange(index, 'recursos', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Materiales, herramientas, aliados..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar Plan de Tutoría'}
        </button>
      </div>
    </div>
  );
}
