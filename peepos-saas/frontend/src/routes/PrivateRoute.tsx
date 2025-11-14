/**
 * ═══════════════════════════════════════════════════════════
 * PRIVATE ROUTE - Componente para rutas protegidas
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * Props del componente
 */
interface PrivateRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * Componente de ruta privada
 * Redirige al login si el usuario no está autenticado
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = '/login',
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

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
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si está autenticado, renderizar el contenido
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
