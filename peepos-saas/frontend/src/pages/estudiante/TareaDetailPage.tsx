import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { estudianteApi, type TareaDetalleResponse } from '../../api/endpoints/estudiante';
import { AlertCircle, CheckCircle, Upload, X, FileText } from 'lucide-react';

export default function TareaDetailPage() {
  const { tareaId } = useParams<{ tareaId: string }>();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState<TareaDetalleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tareaId) {
      cargarTarea();
    }
  }, [tareaId]);

  const cargarTarea = async () => {
    try {
      setLoading(true);
      const data = await estudianteApi.getTareaDetalle(tareaId!);
      setTarea(data);
    } catch (err) {
      console.error('Error al cargar tarea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validar cantidad máxima de archivos (5)
    if (files.length > 5) {
      setError('Puedes adjuntar un máximo de 5 archivos');
      e.target.value = '';
      return;
    }

    // Validar tamaño de cada archivo (máximo 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const archivoGrande = files.find(file => file.size > MAX_FILE_SIZE);

    if (archivoGrande) {
      setError(`El archivo "${archivoGrande.name}" supera los 10MB. Por favor selecciona archivos más pequeños.`);
      e.target.value = '';
      return;
    }

    setError(null);
    setArchivos(files);
  };

  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleEntregar = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);

    // Validación de contenido
    if (!contenido.trim()) {
      setError('Debes escribir un contenido para la entrega');
      return;
    }

    // Validación de longitud mínima
    if (contenido.trim().length < 10) {
      setError('El contenido debe tener al menos 10 caracteres');
      return;
    }

    try {
      setEnviando(true);
      await estudianteApi.entregarTarea(tareaId!, { contenido, archivos });

      setSuccessMessage('¡Tarea entregada exitosamente! Tu docente la revisará pronto.');

      // Limpiar formulario
      setContenido('');
      setArchivos([]);

      // Recargar para ver la entrega
      setTimeout(() => {
        cargarTarea();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al entregar tarea. Por favor intenta nuevamente.');
      console.error('Error al entregar tarea:', err);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tarea) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tarea no encontrada</p>
          <button onClick={() => navigate('/estudiante/tareas')} className="text-blue-600">
            Volver a tareas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button onClick={() => navigate('/mis-tareas')} className="text-blue-600 mb-4 flex items-center gap-2 hover:underline">
          ← Volver a tareas
        </button>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Éxito</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {tarea.tarea.area}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tarea.tarea.titulo}</h1>
          <p className="text-gray-600 mb-4">{tarea.tarea.docente} • {tarea.tarea.tipo}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Fecha asignación</p>
              <p className="font-medium">{new Date(tarea.tarea.fecha_asignacion).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Fecha entrega</p>
              <p className="font-medium text-red-600">{new Date(tarea.tarea.fecha_entrega).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Puntos máximos</p>
              <p className="font-medium text-blue-600">{tarea.tarea.puntos_maximos}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Peso</p>
              <p className="font-medium">{tarea.tarea.peso}%</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Descripción:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{tarea.tarea.descripcion}</p>
          </div>

          {tarea.tarea.instrucciones && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Instrucciones:</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{tarea.tarea.instrucciones}</p>
              </div>
            </div>
          )}
        </div>

        {/* Entrega del estudiante o formulario */}
        {tarea.entrega ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📤 Tu Entrega</h2>
            <div className="mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                {tarea.entrega.estado}
              </span>
              <span className="ml-3 text-sm text-gray-600">
                Entregado: {new Date(tarea.entrega.fecha_entrega).toLocaleString()}
              </span>
            </div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Contenido:</h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">{tarea.entrega.contenido}</p>
            </div>

            {tarea.entrega.puntos_obtenidos !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Calificación</p>
                <p className="text-3xl font-bold text-green-600">{tarea.entrega.puntos_obtenidos} pts</p>
              </div>
            )}

            {tarea.entrega.retroalimentacion && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold text-blue-900 mb-2">Retroalimentación del docente:</h3>
                <p className="text-gray-700">{tarea.entrega.retroalimentacion}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📤 Entregar Tarea</h2>
            <form onSubmit={handleEntregar}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido de la entrega *
                </label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribe aquí tu respuesta, procedimiento o análisis..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos adjuntos (opcional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click para seleccionar</span> o arrastra archivos
                      </p>
                      <p className="text-xs text-gray-500">Máximo 5 archivos, 10MB cada uno</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                    />
                  </label>
                </div>

                {/* Lista de archivos seleccionados */}
                {archivos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Archivos seleccionados ({archivos.length}/5):
                    </p>
                    {archivos.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                          title="Eliminar archivo"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Enviando...' : 'Entregar Tarea'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
