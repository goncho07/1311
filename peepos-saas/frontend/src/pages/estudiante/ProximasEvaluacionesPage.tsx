import { useEffect, useState } from 'react';
import { estudianteApi, type ProximasEvaluacionesResponse } from '../../api/endpoints/estudiante';

export default function ProximasEvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<ProximasEvaluacionesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getProximasEvaluaciones();
      setEvaluaciones(data);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📆 Próximas Evaluaciones</h1>
          <p className="text-gray-600 mt-1">
            {evaluaciones?.total || 0} evaluaciones programadas
          </p>
        </div>

        {/* Lista de Evaluaciones */}
        <div className="space-y-4">
          {evaluaciones?.evaluaciones.map((eval) => (
            <div key={eval.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                      {eval.area}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {eval.tipo}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{eval.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1">{eval.docente}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {new Date(eval.fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-sm text-gray-600">{eval.hora}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDiasRestantes(eval.fecha)}
                  </p>
                </div>
              </div>

              {eval.descripcion && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{eval.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eval.temas && eval.temas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">📚 Temas a evaluar:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {eval.temas.map((tema, idx) => (
                        <li key={idx}>{tema}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eval.materiales && eval.materiales.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">📝 Materiales necesarios:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {eval.materiales.map((material, idx) => (
                        <li key={idx}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!evaluaciones?.evaluaciones || evaluaciones.evaluaciones.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 text-lg">No hay evaluaciones próximas programadas</p>
            <p className="text-gray-400 text-sm mt-2">Mantente atento, tu docente puede programar nuevas evaluaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getDiasRestantes(fecha: string): string {
  const hoy = new Date();
  const fechaEval = new Date(fecha);
  const diff = Math.ceil((fechaEval.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return '¡Hoy!';
  if (diff === 1) return 'Mañana';
  if (diff < 0) return 'Pasada';
  return `En ${diff} días`;
}
