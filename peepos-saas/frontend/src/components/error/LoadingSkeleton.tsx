/**
 * PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
 * LOADING SKELETON - Componente de carga animado
 * PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
 */

import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  rows?: number;
  className?: string;
}

const Skeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  rows = 1,
  className = '',
}) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'text':
        return 'rounded h-4';
      case 'card':
        return 'rounded-lg';
      case 'table':
        return 'rounded';
      default:
        return 'rounded';
    }
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '1rem' : '200px'),
  };

  if (rows > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`${baseClass} ${getVariantClass()}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${getVariantClass()} ${className}`}
      style={style}
    />
  );
};

// Skeleton para tabla
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width="100%" height="20px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Skeleton para card
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <Skeleton variant="text" width="60%" height="24px" />
          <Skeleton variant="text" rows={3} />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width="80px" height="32px" />
            <Skeleton variant="rectangular" width="80px" height="32px" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton para lista
export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height="16px" />
            <Skeleton variant="text" width="80%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
