/**
 * ═══════════════════════════════════════════════════════════
 * MI HORARIO - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Vista semanal del horario del docente
 * - Distribución de horas por día
 * - Áreas que dicta
 * - Grados y secciones
 * - Carga horaria total
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

interface HorarioClase {
  hora_inicio: string;
  hora_fin: string;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  area: string;
  grado: string;
  seccion: string;
  aula: string;
}

export default function MiHorarioDocentePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horario, setHorario] = useState<HorarioClase[]>([]);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const horas = [
    '08:00 - 08:45',
    '08:45 - 09:30',
    '09:30 - 10:15',
    '10:15 - 11:00',
    '11:00 - 11:45',
    '11:45 - 12:30',
    '14:00 - 14:45',
    '14:45 - 15:30',
  ];

  useEffect(() => {
    cargarHorario();
  }, []);

  const cargarHorario = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docenteApi.getHorario();
      setHorario(data.horario || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar horario');
    } finally {
      setLoading(false);
    }
  };

  const getClasePorDiaHora = (dia: string, hora: string) => {
    return horario.find(
      (clase) =>
        clase.dia === dia &&
        `${clase.hora_inicio} - ${clase.hora_fin}` === hora
    );
  };

  const cargaHoraria = horario.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link to="/dashboard-docente" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi Horario</h1>
        <p className="text-gray-600">Distribución Semanal de Clases</p>
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

      {/* Resumen */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Carga Horaria Total</p>
            <p className="text-3xl font-bold text-blue-900">{cargaHoraria} horas</p>
          </div>
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Tabla de Horario */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Hora</th>
                  {dias.map((dia) => (
                    <th key={dia} className="px-4 py-3 text-center font-semibold">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((hora, horaIndex) => (
                  <tr key={hora} className={horaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {hora}
                      </div>
                    </td>
                    {dias.map((dia) => {
                      const clase = getClasePorDiaHora(dia, hora);
                      return (
                        <td key={dia} className="px-2 py-2 border-l">
                          {clase ? (
                            <div className="bg-blue-100 border-l-4 border-blue-600 rounded p-2">
                              <p className="text-sm font-bold text-blue-900">{clase.area}</p>
                              <p className="text-xs text-blue-700">
                                {clase.grado} - {clase.seccion}
                              </p>
                              <p className="text-xs text-blue-600">{clase.aula}</p>
                            </div>
                          ) : (
                            <div className="h-16"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando horario...</p>
          </div>
        </div>
      )}
    </div>
  );
}
