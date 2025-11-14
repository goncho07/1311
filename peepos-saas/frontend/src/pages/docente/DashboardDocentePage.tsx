/**
 * ═══════════════════════════════════════════════════════════
 * DASHBOARD DOCENTE - Panel Profesor
 * ═══════════════════════════════════════════════════════════
 * Dashboard principal para rol docente con:
 * - 3 KPIs (Secciones, Estudiantes, Tareas pendientes)
 * - Mi horario de hoy
 * - Estudiantes con alertas
 * - Próximas evaluaciones
 * - Acciones rápidas
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  FileText,
  BookOpen,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';

// Types
interface DashboardDocenteData {
  success: boolean;
  docente: {
    nombre_completo: string;
    especialidad: string;
    foto_perfil?: string;
  };
  kpis: {
    secciones_a_cargo: number;
    estudiantes_totales: number;
    tareas_pendientes_calificar: number;
  };
  horario_hoy: Array<{
    hora_inicio: string;
    hora_fin: string;
    area: string;
    grado: string;
    seccion: string;
    aula: string;
    es_clase_actual: boolean;
  }>;
  estudiantes_con_alertas: Array<{
    id: string;
    nombre_completo: string;
    foto_perfil?: string;
    alertas: string[];
    nivel_riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  }>;
  proximas_evaluaciones: Array<{
    id: string;
    titulo: string;
    area: string;
    grado: string;
    seccion: string;
    fecha: string;
    tipo: string;
  }>;
}

export default function DashboardDocentePage() {
  const [dashboard, setDashboard] = useState<DashboardDocenteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con API real
      // const data = await docenteApi.getDashboard();

      // Mock data temporal
      const mockData: DashboardDocenteData = {
        success: true,
        docente: {
          nombre_completo: 'Prof. María González',
          especialidad: 'Matemáticas',
          foto_perfil: undefined,
        },
        kpis: {
          secciones_a_cargo: 5,
          estudiantes_totales: 150,
          tareas_pendientes_calificar: 12,
        },
        horario_hoy: [
          {
            hora_inicio: '08:00',
            hora_fin: '09:30',
            area: 'Matemáticas',
            grado: '3ro Secundaria',
            seccion: 'A',
            aula: 'Aula 301',
            es_clase_actual: true,
          },
          {
            hora_inicio: '10:00',
            hora_fin: '11:30',
            area: 'Matemáticas',
            grado: '4to Secundaria',
            seccion: 'B',
            aula: 'Aula 305',
            es_clase_actual: false,
          },
        ],
        estudiantes_con_alertas: [
          {
            id: '1',
            nombre_completo: 'Juan Pérez García',
            alertas: ['Promedio bajo < 11', 'Faltas consecutivas > 3'],
            nivel_riesgo: 'alto',
          },
          {
            id: '2',
            nombre_completo: 'María López Sánchez',
            alertas: ['Asistencia < 85%'],
            nivel_riesgo: 'medio',
          },
        ],
        proximas_evaluaciones: [
          {
            id: '1',
            titulo: 'Examen Parcial',
            area: 'Matemáticas',
            grado: '3ro Secundaria',
            seccion: 'A',
            fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'Examen',
          },
        ],
      };

      setTimeout(() => {
        setDashboard(mockData);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error al cargar dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error || 'No se pudo cargar el dashboard'}</p>
          <button
            onClick={cargarDashboard}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          ¡Bienvenido, {dashboard.docente.nombre_completo.split(' ')[1]}!
        </h1>
        <p className="text-gray-600">{dashboard.docente.especialidad}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Secciones a Cargo"
          value={dashboard.kpis.secciones_a_cargo.toString()}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <KPICard
          title="Estudiantes Totales"
          value={dashboard.kpis.estudiantes_totales.toString()}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <KPICard
          title="Tareas Pendientes"
          value={dashboard.kpis.tareas_pendientes_calificar.toString()}
          icon={<ClipboardCheck className="w-6 h-6" />}
          color="yellow"
          subtitle="Por calificar"
        />
      </div>

      {/* Mi Horario de Hoy */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Mi Horario de Hoy</h2>
        </div>

        <div className="space-y-3">
          {dashboard.horario_hoy.map((clase, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                clase.es_clase_actual
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {clase.es_clase_actual && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                        Ahora
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {clase.hora_inicio} - {clase.hora_fin}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{clase.area}</p>
                  <p className="text-sm text-gray-600">
                    {clase.grado} - {clase.seccion} • {clase.aula}
                  </p>
                </div>
                {clase.es_clase_actual && (
                  <Link
                    to="/asistencia/registrar"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Registrar Asistencia
                  </Link>
                )}
              </div>
            </div>
          ))}

          {dashboard.horario_hoy.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No tienes clases programadas para hoy
            </p>
          )}
        </div>

        <Link
          to="/mi-horario"
          className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver horario completo →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes con Alertas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Estudiantes con Alertas
            </h2>
          </div>

          <div className="space-y-3">
            {dashboard.estudiantes_con_alertas.map((estudiante) => (
              <div
                key={estudiante.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {estudiante.nombre_completo}
                  </p>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      estudiante.nivel_riesgo === 'critico'
                        ? 'bg-red-100 text-red-800'
                        : estudiante.nivel_riesgo === 'alto'
                        ? 'bg-orange-100 text-orange-800'
                        : estudiante.nivel_riesgo === 'medio'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {estudiante.nivel_riesgo.toUpperCase()}
                  </span>
                </div>
                <ul className="space-y-1">
                  {estudiante.alertas.map((alerta, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {alerta}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {dashboard.estudiantes_con_alertas.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No hay estudiantes con alertas
              </p>
            )}
          </div>

          <Link
            to="/tutoria/casos"
            className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos los casos →
          </Link>
        </div>

        {/* Próximas Evaluaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Próximas Evaluaciones
            </h2>
          </div>

          <div className="space-y-3">
            {dashboard.proximas_evaluaciones.map((evaluacion) => (
              <div
                key={evaluacion.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {evaluacion.titulo}
                    </p>
                    <p className="text-sm text-gray-600">
                      {evaluacion.area} • {evaluacion.grado} - {evaluacion.seccion}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                    {evaluacion.tipo}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  📅 {new Date(evaluacion.fecha).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}

            {dashboard.proximas_evaluaciones.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No tienes evaluaciones próximas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            to="/asistencia/registrar"
            icon={<ClipboardCheck className="w-6 h-6" />}
            label="Registrar Asistencia"
            color="blue"
          />
          <QuickActionButton
            to="/evaluaciones/registrar-notas"
            icon={<FileText className="w-6 h-6" />}
            label="Registrar Notas"
            color="green"
          />
          <QuickActionButton
            to="/comunicaciones/enviar"
            icon={<Users className="w-6 h-6" />}
            label="Enviar Comunicado"
            color="purple"
          />
          <QuickActionButton
            to="/tareas"
            icon={<BookOpen className="w-6 h-6" />}
            label="Mis Tareas"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}

function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface QuickActionButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickActionButton({ to, icon, label, color }: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      {icon}
      <span className="mt-2 text-sm font-medium text-center">{label}</span>
    </Link>
  );
}
