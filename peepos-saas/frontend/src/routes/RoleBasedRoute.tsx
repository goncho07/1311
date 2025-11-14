/**
 * ═══════════════════════════════════════════════════════════
 * ROLE BASED ROUTE - Componente para rutas basadas en roles
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';

/**
 * Props del componente
 */
interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * Componente de ruta basada en roles
 * Redirige si el usuario no tiene el rol permitido
 */
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  redirectTo = '/dashboard',
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene el rol permitido
  const hasPermission = allowedRoles.includes(user.rol);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  // Si tiene permiso, renderizar el contenido
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
