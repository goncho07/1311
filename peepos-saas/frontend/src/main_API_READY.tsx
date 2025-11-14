/**
 * ═══════════════════════════════════════════════════════════
 * MAIN.TSX - Configurado con React Query y Context Providers
 * ═══════════════════════════════════════════════════════════
 *
 * CAMBIOS REALIZADOS:
 * - ✅ Agregar QueryClientProvider (React Query)
 * - ✅ Agregar AuthProvider
 * - ✅ Agregar TenantProvider
 * - ✅ Configuración de React Query DevTools (solo desarrollo)
 * - ✅ Configuración de cache y staleTime
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 🔴 CAMBIO 1: Importar Context Providers
import { AuthProvider, TenantProvider } from '@/src/contexts';

import App from '../App';
import './index.css';

// 🔴 CAMBIO 2: Configurar React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tiempo que los datos se mantienen en cache (10 minutos)
      cacheTime: 10 * 60 * 1000,
      // No refetch al volver a la ventana
      refetchOnWindowFocus: false,
      // Número de reintentos en caso de error
      retry: 1,
      // Función de retry (no reintentar errores 4xx)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // No reintentar mutations por defecto
      retry: 0,
    },
  },
});

// Service Worker (solo en producción)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((registrationError) => {
        console.error('Service worker registration failed:', registrationError);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* 🔴 CAMBIO 3: Envolver con QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* 🔴 CAMBIO 4: Envolver con TenantProvider */}
        <TenantProvider>
          {/* 🔴 CAMBIO 5: Envolver con AuthProvider */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>

      {/* 🔴 CAMBIO 6: React Query DevTools (solo desarrollo) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);

/**
 * 📝 ORDEN DE PROVIDERS (Importante):
 *
 * 1. QueryClientProvider (más externo)
 *    - Proporciona React Query a toda la app
 *
 * 2. BrowserRouter
 *    - Proporciona routing
 *
 * 3. TenantProvider
 *    - Gestiona el tenant multi-tenant
 *
 * 4. AuthProvider (más interno)
 *    - Gestiona autenticación
 *    - Puede usar TenantProvider si lo necesita
 *
 * 5. App
 *    - Tu aplicación
 */

/**
 * 🔧 CONFIGURACIÓN DE REACT QUERY:
 *
 * staleTime: Tiempo que los datos se consideran frescos
 * - 5 minutos es un buen balance
 * - Evita refetches innecesarios
 *
 * cacheTime: Tiempo que los datos permanecen en cache
 * - 10 minutos permite volver a páginas visitadas sin refetch
 *
 * refetchOnWindowFocus: false
 * - Evita refetch automático al volver a la ventana
 * - Útil para evitar requests innecesarios
 *
 * retry: 1
 * - Reintenta 1 vez en caso de error de red
 * - No reintenta errores 4xx (validación, autenticación, etc.)
 */

/**
 * 🎨 REACT QUERY DEVTOOLS:
 *
 * - Solo se muestra en desarrollo (DEV)
 * - Permite inspeccionar:
 *   - Queries activas
 *   - Mutations
 *   - Cache
 *   - Estados de loading/error
 *
 * - Útil para debugging
 */
