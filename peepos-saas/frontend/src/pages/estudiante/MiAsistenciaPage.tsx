import { useEffect, useState } from 'react';
import { estudianteApi, type AsistenciaResponse } from '../../api/endpoints/estudiante';

export default function MiAsistenciaPage() {
  const [asistencia, setAsistencia] = useState<AsistenciaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarAsistencia();
  }, [mes, anio]);

  const cargarAsistencia = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getMiAsistencia({ mes, anio });
      setAsistencia(data);
    } catch (err) {
      console.error('Error al cargar asistencia:', err);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📅 Mi Asistencia</h1>
            <p className="text-gray-600 mt-1">Registro de asistencias y faltas</p>
          </div>
          <div className="flex gap-2">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(2024, i).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen Mensual */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-sm text-gray-600">Total Días</p>
            <p className="text-3xl font-bold text-gray-900">{asistencia?.resumen.total_dias || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center border border-green-200">
            <p className="text-sm text-green-700">Presentes</p>
            <p className="text-3xl font-bold text-green-600">{asistencia?.resumen.presentes || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center border border-red-200">
            <p className="text-sm text-red-700">Faltas</p>
            <p className="text-3xl font-bold text-red-600">{asistencia?.resumen.faltas || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center border border-yellow-200">
            <p className="text-sm text-yellow-700">Tardanzas</p>
            <p className="text-3xl font-bold text-yellow-600">{asistencia?.resumen.tardanzas || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center border border-blue-200">
            <p className="text-sm text-blue-700">Porcentaje</p>
            <p className="text-3xl font-bold text-blue-600">
              {asistencia?.resumen.porcentaje_asistencia.toFixed(0) || 0}%
            </p>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calendario de Asistencia</h2>
          <div className="space-y-2">
            {asistencia?.asistencias.map((dia, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${getColorAsistencia(dia.estado)}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 font-bold">
                    {new Date(dia.fecha).getDate()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(dia.fecha).toLocaleDateString('es', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    {dia.hora_registro && (
                      <p className="text-sm opacity-75">Hora: {dia.hora_registro}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-4 py-2 bg-white/50 rounded-full font-semibold">
                    {getEstadoLabel(dia.estado)}
                  </span>
                  {dia.observaciones && (
                    <p className="text-sm mt-1 opacity-75">{dia.observaciones}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(!asistencia?.asistencias || asistencia.asistencias.length === 0) && (
            <p className="text-center text-gray-500 py-8">No hay registros de asistencia para este mes</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getColorAsistencia(estado: string): string {
  switch (estado) {
    case 'PRESENTE': return 'bg-green-100 border border-green-200';
    case 'FALTA': return 'bg-red-100 border border-red-200';
    case 'TARDANZA': return 'bg-yellow-100 border border-yellow-200';
    case 'JUSTIFICADA': return 'bg-blue-100 border border-blue-200';
    default: return 'bg-gray-100 border border-gray-200';
  }
}

function getEstadoLabel(estado: string): string {
  switch (estado) {
    case 'PRESENTE': return '✅ Presente';
    case 'FALTA': return '❌ Falta';
    case 'TARDANZA': return '⏰ Tardanza';
    case 'JUSTIFICADA': return '📝 Justificada';
    default: return estado;
  }
}
