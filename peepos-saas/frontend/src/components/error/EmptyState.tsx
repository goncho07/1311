/**
 * ═══════════════════════════════════════════════════════════
 * EMPTY STATE - Componente para mostrar estado vacío
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import Button from '@/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title = 'No hay datos',
  description = 'No se encontraron resultados para mostrar.',
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>

      {action && (
        <Button
          variant="filled"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
