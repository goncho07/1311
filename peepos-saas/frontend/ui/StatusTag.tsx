import React from 'react';
import { UserStatus } from '@/types';
import { statusConfig } from '@/data/constants';

interface StatusTagProps {
  status: UserStatus;
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Inactivo;
  const { label, icon: Icon, colorClasses } = config;

  return (
    <div
      role="status"
      aria-label={`Estado: ${label}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      <Icon size={12} />
      {label}
    </div>
  );
};

export default StatusTag;