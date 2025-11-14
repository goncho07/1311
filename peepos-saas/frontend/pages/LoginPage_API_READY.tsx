/**
 * ═══════════════════════════════════════════════════════════
 * LOGIN PAGE - Adaptado para usar API real
 * ═══════════════════════════════════════════════════════════
 *
 * CAMBIOS REALIZADOS:
 * - ✅ Agregado campo tenant_code
 * - ✅ Usar useLogin hook para consumir API
 * - ✅ Manejo de errores de API
 * - ✅ Redirección basada en roles
 * - ✅ Validación de formulario
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/settingsStore';
import { setTenantCode } from '@/utils/auth';
import Button from '@/ui/Button';
import Input from '@/ui/Input';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginLogoUrl, loginImageUrl } = useSettingsStore();

  // 🔴 CAMBIO 1: Usar hook useLogin (conecta con API real)
  const loginMutation = useLogin();

  // 🔴 CAMBIO 2: Agregar campo tenant_code
  const [tenantCode, setTenantCodeState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 🔴 CAMBIO 3: Validar campos requeridos
    if (!tenantCode || !email || !password) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      // 🔴 CAMBIO 4: Guardar tenant code antes de hacer login
      setTenantCode(tenantCode);

      // 🔴 CAMBIO 5: Llamar API de login con credentials
      await loginMutation.mutateAsync({
        tenant_code: tenantCode,
        email,
        password,
      });

      // 🔴 CAMBIO 6: La redirección se maneja en el hook useLogin
      // El hook redirige automáticamente después del login exitoso

    } catch (error: any) {
      console.error('Error en login:', error);

      // 🔴 CAMBIO 7: Manejo de errores de API
      if (error.response?.status === 401) {
        setError('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        setError('Su institución está suspendida. Contacte con soporte.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al iniciar sesión. Intente nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-background)]">
      {/* Imagen lateral */}
      <div className="w-full lg:w-3/5 h-screen relative hidden lg:block">
        <img src={loginImageUrl} alt="School background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8 md:p-12">
          {/* Contenido opcional */}
        </div>
      </div>

      {/* Formulario de login */}
      <div className="w-full lg:w-2/5 h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={loginLogoUrl} alt="Logo" className="w-full max-w-56 h-auto mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">Bienvenido</h1>
            <p className="text-[var(--color-text-secondary)] text-lg mt-2">
              Ingrese sus credenciales para acceder.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-7 rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)]">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* 🔴 NUEVO CAMPO: Código de Institución */}
              <Input
                label="Código de Institución"
                id="tenant-code"
                type="text"
                value={tenantCode}
                onChange={(e) => setTenantCodeState(e.target.value)}
                placeholder="ej: ricardo-palma"
                aria-label="Código de Institución"
                required
                disabled={loginMutation.isPending}
              />

              {/* Campo Email (antes era DNI) */}
              <Input
                label="Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@colegio.edu.pe"
                aria-label="Email"
                required
                disabled={loginMutation.isPending}
              />

              {/* Campo Contraseña */}
              <Input
                label="Contraseña"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-label="Contraseña"
                required
                disabled={loginMutation.isPending}
              />

              {/* Mensaje de error */}
              {(error || loginMutation.isError) && (
                <p className="text-sm text-center text-[var(--color-danger)]">
                  {error || 'Error al iniciar sesión'}
                </p>
              )}

              {/* Botón de login */}
              <Button
                type="submit"
                variant="filled"
                className="w-full !text-lg"
                icon={loginMutation.isPending ? () => <Loader2 className="animate-spin" /> : LogIn}
                aria-label="Ingresar al sistema"
                disabled={loginMutation.isPending}
              >
                <span>{loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}</span>
              </Button>
            </form>

            {/* Link olvidó contraseña */}
            <div className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              ¿Primera vez?{' '}
              <a href="/contacto" className="text-[var(--color-primary)] hover:underline">
                Solicita una demo
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

/**
 * 📝 NOTAS PARA IMPLEMENTACIÓN:
 *
 * 1. El hook useLogin maneja automáticamente:
 *    - Llamada a la API
 *    - Guardado del token en localStorage
 *    - Guardado de datos del usuario
 *    - Redirección al dashboard
 *
 * 2. El tenant_code es CRÍTICO para multi-tenant:
 *    - Se guarda en localStorage
 *    - Se envía en cada request (header X-Tenant-Code)
 *    - Identifica la institución educativa
 *
 * 3. Errores comunes:
 *    - 401: Credenciales incorrectas
 *    - 403: Tenant suspendido
 *    - 422: Errores de validación
 *
 * 4. Para probar:
 *    - tenant_code: "COLEGIO01"
 *    - email: "director@colegio.com"
 *    - password: "12345678"
 */
