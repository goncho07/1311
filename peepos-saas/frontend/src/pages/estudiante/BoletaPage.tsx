import { useState } from 'react';
import { estudianteApi } from '../../api/endpoints/estudiante';

export default function BoletaPage() {
  const [periodoId, setPeriodoId] = useState('');
  const [bimestre, setBimestre] = useState('');
  const [descargando, setDescargando] = useState(false);

  const handleDescargar = async () => {
    if (!periodoId || !bimestre) {
      alert('Debes seleccionar un periodo y bimestre');
      return;
    }

    try {
      setDescargando(true);
      const blob = await estudianteApi.descargarBoleta({ periodo_id: periodoId, bimestre });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${bimestre}_${periodoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Error al descargar boleta');
      console.error(err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">📄 Descargar Boleta</h1>
          <p className="text-gray-600 mt-2">Selecciona el periodo y bimestre para descargar tu boleta de notas</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo Académico
            </label>
            <select
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona un periodo</option>
              <option value="1">2024</option>
              <option value="2">2025</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bimestre
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['I', 'II', 'III', 'IV'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBimestre(b)}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    bimestre === b
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bimestre {b}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDescargar}
            disabled={descargando || !periodoId || !bimestre}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {descargando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Descargando...
              </>
            ) : (
              <>
                📥 Descargar Boleta PDF
              </>
            )}
          </button>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La boleta incluye todas tus calificaciones del bimestre</li>
              <li>• Puedes descargar boletas de periodos anteriores</li>
              <li>• El archivo se descarga en formato PDF</li>
              <li>• Verifica que tengas un lector de PDF instalado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
