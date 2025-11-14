import { useEffect, useState } from 'react';
import { estudianteApi, type NotasResponse } from '../../api/endpoints/estudiante';

export default function MisNotasPage() {
  const [notas, setNotas] = useState<NotasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bimestre, setBimestre] = useState<string>('');

  useEffect(() => {
    cargarNotas();
  }, [bimestre]);

  const cargarNotas = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getMisNotas({ bimestre: bimestre || undefined });
      setNotas(data);
    } catch (err) {
      console.error('Error al cargar notas:', err);
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
            <h1 className="text-3xl font-bold text-gray-900">📖 Mis Notas</h1>
            <p className="text-gray-600 mt-1">Historial completo de tus evaluaciones</p>
          </div>
          <select
            value={bimestre}
            onChange={(e) => setBimestre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los bimestres</option>
            <option value="I">Bimestre I</option>
            <option value="II">Bimestre II</option>
            <option value="III">Bimestre III</option>
            <option value="IV">Bimestre IV</option>
          </select>
        </div>

        {/* Promedio General */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <p className="text-lg font-medium opacity-90">Promedio General</p>
          <p className="text-5xl font-bold mt-2">{notas?.promedio_general.toFixed(1) || '0.0'}</p>
        </div>

        {/* Notas por Área */}
        <div className="space-y-6">
          {notas?.notas.map((area, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{area.area}</h3>
                  <p className="text-sm text-gray-600">{area.evaluaciones.length} evaluaciones</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Promedio</p>
                  <p className="text-3xl font-bold text-blue-600">{area.promedio}</p>
                </div>
              </div>

              {/* Tabla de Evaluaciones */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Competencia</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Nota</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Literal</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Bimestre</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {area.evaluaciones.map((eval, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{eval.competencia}</td>
                        <td className="px-4 py-3 text-center text-lg font-bold text-blue-600">
                          {eval.calificacion_numerica}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorBadge(eval.calificacion_literal)}`}>
                            {eval.calificacion_literal}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{eval.bimestre}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {new Date(eval.fecha).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {(!notas?.notas || notas.notas.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay notas registradas aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getColorBadge(literal: string): string {
  switch (literal) {
    case 'AD': return 'bg-green-100 text-green-800';
    case 'A': return 'bg-blue-100 text-blue-800';
    case 'B': return 'bg-yellow-100 text-yellow-800';
    case 'C': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
