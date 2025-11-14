import { useEffect, useState } from 'react';
import { estudianteApi, type HorarioResponse } from '../../api/endpoints/estudiante';

export default function MiHorarioPage() {
  const [horario, setHorario] = useState<HorarioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHorario();
  }, []);

  const cargarHorario = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getMiHorario();
      setHorario(data);
    } catch (err) {
      console.error('Error al cargar horario:', err);
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
          <h1 className="text-3xl font-bold text-gray-900">🕐 Mi Horario</h1>
          <p className="text-gray-600 mt-1">
            {horario?.grado} - {horario?.seccion}
          </p>
        </div>

        {/* Horario Semanal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {horario?.horario.map((dia, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Día de la semana */}
              <div className="bg-blue-600 text-white py-3 px-4">
                <h3 className="text-lg font-bold text-center">{dia.dia}</h3>
              </div>

              {/* Clases del día */}
              <div className="p-4 space-y-3">
                {dia.clases.length > 0 ? (
                  dia.clases.map((clase, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-semibold text-blue-900">
                        {clase.hora_inicio} - {clase.hora_fin}
                      </p>
                      <p className="font-medium text-gray-900 mt-1">{clase.area}</p>
                      <p className="text-sm text-gray-600">{clase.docente}</p>
                      <p className="text-xs text-gray-500 mt-1">📍 {clase.aula}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6 text-sm">Sin clases</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!horario?.horario || horario.horario.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay horario configurado</p>
          </div>
        )}
      </div>
    </div>
  );
}
