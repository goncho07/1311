import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { estudianteApi, type TareasResponse } from '../../api/endpoints/estudiante';

export default function MisTareasPage() {
  const [tareas, setTareas] = useState<TareasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'pendientes' | 'entregadas' | 'vencidas' | 'todas'>('pendientes');

  useEffect(() => {
    cargarTareas();
  }, [filtro]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getMisTareas(filtro);
      setTareas(data);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📝 Mis Tareas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus tareas y entregas</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'pendientes', label: 'Pendientes', icon: '⏳' },
            { key: 'entregadas', label: 'Entregadas', icon: '✅' },
            { key: 'vencidas', label: 'Vencidas', icon: '⚠️' },
            { key: 'todas', label: 'Todas', icon: '📋' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                filtro === f.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Tareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareas?.tareas.map((tarea) => (
            <Link
              key={tarea.id}
              to={`/estudiante/tareas/${tarea.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-5"
            >
              {/* Badge de estado */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(tarea.estado)}`}>
                  {tarea.estado}
                </span>
                <span className="text-sm text-gray-600">{tarea.area}</span>
              </div>

              {/* Título */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{tarea.titulo}</h3>

              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tarea.descripcion}</p>

              {/* Detalles */}
              <div className="space-y-1 mb-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Docente:</span> {tarea.docente}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Entrega:</span> {new Date(tarea.fecha_entrega).toLocaleString()}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium text-gray-600">
                  {tarea.puntos_maximos} puntos
                </span>
                {tarea.entregado && tarea.calificacion && (
                  <span className="text-lg font-bold text-green-600">{tarea.calificacion} pts</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {(!tareas?.tareas || tareas.tareas.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay tareas {filtro}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getEstadoBadge(estado: string): string {
  switch (estado) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
    case 'ENTREGADA': return 'bg-green-100 text-green-800';
    case 'REVISADA': return 'bg-blue-100 text-blue-800';
    case 'VENCIDA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
