/**
 * ═══════════════════════════════════════════════════════════
 * MI PERFIL - Panel Estudiante
 * ═══════════════════════════════════════════════════════════
 * Página para ver y editar el perfil del estudiante:
 * - Ver datos personales (nombre, DNI, fecha nacimiento, dirección)
 * - Editar foto de perfil
 * - Ver información de matrícula (grado, sección)
 * - Ver apoderados (nombre, relación, contacto)
 * - Cambiar contraseña (si aplica)
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef } from 'react';
import { estudianteApi, type PerfilEstudianteResponse } from '../../api/endpoints/estudiante';
import { User, Camera, Mail, Phone, MapPin, Calendar, Shield, Users } from 'lucide-react';

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState<PerfilEstudianteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estudianteApi.getMiPerfil();
      setPerfil(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);

      await estudianteApi.actualizarPerfil({
        foto_perfil: file,
      });

      setSuccessMessage('Foto de perfil actualizada correctamente');

      // Recargar perfil para ver la nueva foto
      await cargarPerfil();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar foto de perfil');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={cargarPerfil}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Información personal y configuración</p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Foto de Perfil */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              {/* Foto de perfil */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mx-auto">
                  {perfil.estudiante.foto_perfil ? (
                    <img
                      src={perfil.estudiante.foto_perfil}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Botón para cambiar foto */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                  title="Cambiar foto de perfil"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {perfil.estudiante.nombre_completo}
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Código: {perfil.estudiante.codigo}
              </p>

              {/* Información de Matrícula */}
              {perfil.matricula && (
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-900 font-semibold">
                    {perfil.matricula.grado} - {perfil.matricula.seccion}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {perfil.matricula.nivel} • {perfil.matricula.periodo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Información Personal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Datos Personales */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Datos Personales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Tipo de Documento"
                  value={perfil.estudiante.tipo_documento}
                />
                <InfoField
                  label="Número de Documento"
                  value={perfil.estudiante.numero_documento}
                />
                <InfoField
                  label="Fecha de Nacimiento"
                  value={new Date(perfil.estudiante.fecha_nacimiento).toLocaleDateString('es-PE')}
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                />
                <InfoField
                  label="Edad"
                  value={`${perfil.estudiante.edad} años`}
                />
                <InfoField
                  label="Género"
                  value={perfil.estudiante.genero}
                />
                <InfoField
                  label="Distrito"
                  value={perfil.estudiante.distrito}
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="mt-4">
                <InfoField
                  label="Dirección"
                  value={perfil.estudiante.direccion}
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
                  fullWidth
                />
              </div>

              {perfil.estudiante.telefono_emergencia && (
                <div className="mt-4">
                  <InfoField
                    label="Teléfono de Emergencia"
                    value={perfil.estudiante.telefono_emergencia}
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                    fullWidth
                  />
                </div>
              )}
            </div>

            {/* Apoderados */}
            {perfil.apoderados && perfil.apoderados.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Mis Apoderados
                </h3>

                <div className="space-y-4">
                  {perfil.apoderados.map((apoderado, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {apoderado.nombre_completo}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {apoderado.tipo_relacion}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{apoderado.telefono}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{apoderado.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold">
                  Nota sobre edición de datos
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Solo puedes editar tu foto de perfil. Para modificar otros datos personales,
                  solicita a tus apoderados o al personal administrativo del colegio realizar los cambios necesarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE AUXILIAR - INFO FIELD
// ═══════════════════════════════════════════════════════════

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

function InfoField({ label, value, icon, fullWidth }: InfoFieldProps) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 text-gray-900">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
