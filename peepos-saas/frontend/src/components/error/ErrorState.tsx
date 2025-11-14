/**
 * ═══════════════════════════════════════════════════════════
 * ERROR STATE - Componente para mostrar errores
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/ui/Button';

interface ErrorStateProps {
  error?: Error | { message: string } | string;
  title?: string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Error al cargar los datos',
  onRetry,
  className = '',
  showDetails = import.meta.env.DEV,
}) => {
  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message || 'Ocurrió un error desconocido'
    : 'No se pudo cargar la información. Por favor, intenta nuevamente.';

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="p-4 bg-red-100 rounded-full mb-4">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 text-center max-w-md mb-2">{errorMessage}</p>

      {showDetails && error && typeof error !== 'string' && error.message && (
        <details className="mb-4 max-w-lg w-full">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2 text-center">
            Ver detalles técnicos
          </summary>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-xs overflow-auto max-h-40">
            <pre className="text-red-700 whitespace-pre-wrap">
              {error instanceof Error ? error.stack || error.message : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {onRetry && (
        <Button
          variant="tonal"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
