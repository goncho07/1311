import { useEffect, useState } from 'react';
import { estudianteApi, type DashboardEstudianteResponse } from '../../api/endpoints/estudiante';
import { Link } from 'react-router-dom';

export default function DashboardEstudiantePage() {
  const [dashboard, setDashboard] = useState<DashboardEstudianteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getMiDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar dashboard');
    } finally {
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
        <div className="flex items-center gap-4 mb-2">
          {dashboard.estudiante.foto_perfil && (
            <img
              src={dashboard.estudiante.foto_perfil}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
            />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              ¡Hola, {dashboard.estudiante.nombre_completo.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">
              {dashboard.estudiante.grado} - {dashboard.estudiante.seccion} • Código: {dashboard.estudiante.codigo}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Promedio General"
          value={dashboard.kpis.promedio_general.toFixed(1)}
          icon="📊"
          color="blue"
        />
        <KPICard
          title="Asistencia"
          value={`${dashboard.kpis.asistencia_porcentaje.toFixed(0)}%`}
          icon="📅"
          color="green"
        />
        <KPICard
          title="Tareas Pendientes"
          value={dashboard.kpis.tareas_pendientes.toString()}
          icon="📝"
          color="yellow"
        />
        <KPICard
          title="Competencias Logradas"
          value={dashboard.kpis.competencias_logradas.toString()}
          icon="🎯"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notas por Área */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📚 Notas por Área</h2>
              <Link
                to="/estudiante/notas"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard.notas_por_area.map((nota, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{nota.area}</p>
                    <p className="text-sm text-gray-600">
                      {nota.competencias_logradas} competencias logradas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{nota.promedio}</p>
                    <p className={`text-sm font-semibold ${getColorCalificacion(nota.calificacion_literal)}`}>
                      {nota.calificacion_literal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tareas Próximas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📝 Tareas Próximas</h2>
              <Link
                to="/estudiante/tareas"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard.tareas_proximas.length > 0 ? (
                dashboard.tareas_proximas.map((tarea) => (
                  <Link
                    key={tarea.id}
                    to={`/estudiante/tareas/${tarea.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tarea.titulo}</p>
                        <p className="text-sm text-gray-600">{tarea.area}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">
                          {tarea.dias_restantes === 0 ? 'Hoy' : `${tarea.dias_restantes}d`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tarea.fecha_entrega).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No tienes tareas pendientes</p>
              )}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Horario de Hoy */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🕐 Horario de Hoy</h2>
              <Link
                to="/estudiante/horario"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver completo →
              </Link>
            </div>
            <div className="space-y-2">
              {dashboard.horario_hoy.length > 0 ? (
                dashboard.horario_hoy.map((clase, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-blue-900">{clase.hora}</p>
                    <p className="text-sm text-gray-900">{clase.area}</p>
                    <p className="text-xs text-gray-600">{clase.docente} • {clase.aula}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No hay clases hoy</p>
              )}
            </div>
          </div>

          {/* Próximas Evaluaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📆 Próximas Evaluaciones</h2>
              <Link
                to="/estudiante/evaluaciones"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-2">
              {dashboard.proximas_evaluaciones.length > 0 ? (
                dashboard.proximas_evaluaciones.map((eval) => (
                  <div key={eval.id} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                    <p className="text-sm font-semibold text-red-900">{eval.area}</p>
                    <p className="text-xs text-gray-900">{eval.titulo}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(eval.fecha).toLocaleDateString()} • {eval.tipo}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No hay evaluaciones próximas</p>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
            <div className="space-y-2">
              {dashboard.quick_actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.route}
                  className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition font-medium text-sm"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente KPI Card
interface KPICardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function KPICard({ title, value, icon, color }: KPICardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

// Helper para colores de calificación
function getColorCalificacion(literal: string): string {
  switch (literal) {
    case 'AD':
      return 'text-green-600';
    case 'A':
      return 'text-blue-600';
    case 'B':
      return 'text-yellow-600';
    case 'C':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
