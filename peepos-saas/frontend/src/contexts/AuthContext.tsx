/**
 * ═══════════════════════════════════════════════════════════
 * AUTH CONTEXT - Context para autenticación global
 * ═══════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Tenant, Permission, LoginRequest } from '../types/auth.types';
import {
  getAuthToken,
  getCurrentUser,
  getCurrentTenant,
  getUserPermissions,
  setAuthToken,
  setCurrentUser,
  setCurrentTenant,
  setUserPermissions,
  setTenantCode,
  clearAuthData,
  isAuthenticated as checkIsAuthenticated,
} from '@/utils/auth';
import { authApi } from '../api/endpoints';

/**
 * Interface del contexto
 */
interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  permissions: Permission[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

/**
 * Crear contexto
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props del provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [tenant, setTenant] = useState<Tenant | null>(getCurrentTenant());
  const [permissions, setPermissions] = useState<Permission[]>(getUserPermissions());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Inicializar contexto al montar
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (checkIsAuthenticated()) {
          // Verificar token con el servidor
          const userData = await authApi.me();
          setUser(userData);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Si hay error, limpiar datos
        clearAuthData();
        setUser(null);
        setTenant(null);
        setPermissions([]);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      // Guardar datos en estado
      setUser(response.user);
      setTenant(response.tenant);
      setPermissions(response.permisos);
      setToken(response.token);
      setIsAuthenticated(true);

      // Guardar en localStorage
      setAuthToken(response.token);
      setCurrentUser(response.user);
      setCurrentTenant(response.tenant);
      setUserPermissions(response.permisos);
      setTenantCode(response.tenant.codigo);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado
      setUser(null);
      setTenant(null);
      setPermissions([]);
      setToken(null);
      setIsAuthenticated(false);

      // Limpiar localStorage
      clearAuthData();
    }
  };

  /**
   * Refrescar datos del usuario
   */
  const refreshUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      throw error;
    }
  };

  /**
   * Actualizar usuario en el estado
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    tenant,
    permissions,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
