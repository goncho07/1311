/**
 * ═══════════════════════════════════════════════════════════
 * EJEMPLO: Configuración de App.tsx con Providers y Rutas
 * ═══════════════════════════════════════════════════════════
 *
 * Este archivo muestra cómo configurar tu App.tsx con:
 * - React Query Provider
 * - Auth Context Provider
 * - Tenant Context Provider
 * - Rutas protegidas
 * - Rutas basadas en roles
 */

// main.tsx - Punto de entrada
// ═══════════════════════════════════════════════════════════
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, TenantProvider } from '@/src/contexts';
import App from './App';
import './index.css';

// Configurar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TenantProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// App.tsx - Configuración de rutas
// ═══════════════════════════════════════════════════════════
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, RoleBasedRoute } from '@/src/routes';
import { UserRole } from '@/src/types/auth.types';

// Páginas públicas
import LoginPage from '@/pages/Auth/LoginPage';
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage';

// Páginas privadas
import Dashboard from '@/pages/Dashboard';
import UsuariosPage from '@/pages/Usuarios';
import EstudiantesPage from '@/pages/Estudiantes';
import MatriculaPage from '@/pages/Matricula';
import EvaluacionesPage from '@/pages/Evaluaciones';
import AsistenciasPage from '@/pages/Asistencias';
import ComunicacionesPage from '@/pages/Comunicaciones';
import FinanzasPage from '@/pages/Finanzas';
import ReportesPage from '@/pages/Reportes';
import ConfiguracionPage from '@/pages/Configuracion';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Rutas privadas - Requieren autenticación */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rutas para DIRECTOR */}
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.DIRECTOR]} />}>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/estudiantes" element={<EstudiantesPage />} />
          <Route path="/matriculas" element={<MatriculaPage />} />
          <Route path="/finanzas" element={<FinanzasPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>

        {/* Rutas para DOCENTE */}
        <Route
          element={
            <RoleBasedRoute allowedRoles={[UserRole.DIRECTOR, UserRole.DOCENTE]} />
          }
        >
          <Route path="/evaluaciones" element={<EvaluacionesPage />} />
          <Route path="/asistencias" element={<AsistenciasPage />} />
        </Route>

        {/* Rutas para todos los usuarios autenticados */}
        <Route path="/comunicaciones" element={<ComunicacionesPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
      </Route>

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

// EJEMPLO: LoginPage.tsx
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [tenantCode, setTenantCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({
        tenant_code: tenantCode,
        email,
        password,
      });
      // El hook useLogin ya redirige al dashboard automáticamente
    } catch (error: any) {
      console.error('Error en login:', error);
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Código de Institución</label>
            <input
              type="text"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loginMutation.isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          {loginMutation.isError && (
            <p className="text-red-500 mt-4 text-center">
              {loginMutation.error?.message || 'Error al iniciar sesión'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// EJEMPLO: EstudiantesPage.tsx
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { useEstudiantes, useCreateEstudiante } from '@/hooks/useEstudiantes';

export default function EstudiantesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Obtener lista de estudiantes
  const { data, isLoading, isError } = useEstudiantes({
    page,
    per_page: 20,
    search,
    estado: 'activo',
  });

  // Mutation para crear estudiante
  const createMutation = useCreateEstudiante();

  const handleCreate = () => {
    createMutation.mutate({
      nombre: 'Juan',
      apellido_paterno: 'Pérez',
      apellido_materno: 'García',
      dni: '12345678',
      fecha_nacimiento: '2010-05-15',
      genero: 'M',
      estado: 'activo',
    });
  };

  if (isLoading) {
    return <div className="p-8">Cargando estudiantes...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Error al cargar estudiantes</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Estudiantes</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Agregar Estudiante
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Nombre Completo</th>
              <th className="px-6 py-3 text-left">DNI</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((estudiante) => (
              <tr key={estudiante.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{estudiante.codigo_estudiante}</td>
                <td className="px-6 py-4">
                  {estudiante.nombre} {estudiante.apellido_paterno} {estudiante.apellido_materno}
                </td>
                <td className="px-6 py-4">{estudiante.dni}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    estudiante.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {estudiante.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {data?.meta.from} - {data?.meta.to} de {data?.meta.total} estudiantes
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === data?.meta.last_page}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
