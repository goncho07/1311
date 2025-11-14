/**
 * ═══════════════════════════════════════════════════════════
 * TENANT CONTEXT - Context para gestión multi-tenant
 * ═══════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Tenant } from '../types/auth.types';
import {
  getCurrentTenant,
  getTenantCode,
  setCurrentTenant as saveCurrentTenant,
  setTenantCode as saveTenantCode,
  isTenantActive,
  isSubscriptionExpired,
} from '@/utils/auth';

/**
 * Interface del contexto
 */
interface TenantContextType {
  tenant: Tenant | null;
  tenantCode: string | null;
  isActive: boolean;
  isExpired: boolean;
  setTenant: (tenant: Tenant) => void;
  setCode: (code: string) => void;
  clearTenant: () => void;
}

/**
 * Crear contexto
 */
const TenantContext = createContext<TenantContextType | undefined>(undefined);

/**
 * Props del provider
 */
interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de tenant
 */
export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenantState] = useState<Tenant | null>(getCurrentTenant());
  const [tenantCode, setTenantCodeState] = useState<string | null>(getTenantCode());
  const [isActive, setIsActive] = useState<boolean>(isTenantActive());
  const [isExpired, setIsExpired] = useState<boolean>(isSubscriptionExpired());

  /**
   * Actualizar estado cuando cambia el tenant
   */
  useEffect(() => {
    if (tenant) {
      setIsActive(tenant.estado === 'activo');

      if (tenant.fecha_expiracion) {
        const expirationDate = new Date(tenant.fecha_expiracion);
        const today = new Date();
        setIsExpired(expirationDate < today);
      } else {
        setIsExpired(false);
      }
    }
  }, [tenant]);

  /**
   * Guardar tenant
   */
  const setTenant = (newTenant: Tenant) => {
    setTenantState(newTenant);
    saveCurrentTenant(newTenant);
  };

  /**
   * Guardar código de tenant
   */
  const setCode = (code: string) => {
    setTenantCodeState(code);
    saveTenantCode(code);
  };

  /**
   * Limpiar tenant
   */
  const clearTenant = () => {
    setTenantState(null);
    setTenantCodeState(null);
    setIsActive(false);
    setIsExpired(false);
  };

  const value: TenantContextType = {
    tenant,
    tenantCode,
    isActive,
    isExpired,
    setTenant,
    setCode,
    clearTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

/**
 * Hook para usar el contexto de tenant
 */
export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;
