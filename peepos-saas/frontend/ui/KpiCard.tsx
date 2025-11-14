import React from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<LucideProps>;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  gradient?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  className = '',
  active = false,
  onClick,
  gradient,
}) => {
  if (gradient) {
    // New gradient style for Dashboard
    return (
      <div
        className={`relative p-5 rounded-[var(--radius-lg)] text-white overflow-hidden flex flex-col h-40 ${gradient} ${className}`}
      >
        <Icon size={96} className="absolute -top-4 -right-4 text-white/10 -rotate-12" />
        <div className="relative z-10 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl leading-tight">{title}</h3>
          </div>
          <div>
            <p className="text-6xl font-black kpi-value">{value}</p>
          </div>
        </div>
      </div>
    );
  }

  // Original clickable/non-clickable style for other pages
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="p-3 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-md)]">
          <Icon size={28} />
        </div>
      </div>
      <div className="mt-auto pt-2">
        <p className="text-4xl font-black text-[var(--color-text-primary)] kpi-value">{value}</p>
        <h3 className="font-bold text-base text-[var(--color-text-secondary)] mt-1">{title}</h3>
      </div>
    </>
  );

  if (onClick) {
    const activeClasses = active
      ? 'ring-2 ring-offset-2 ring-offset-[var(--color-background)] ring-[var(--color-primary)] shadow-[var(--shadow-lg)]'
      : 'hover:shadow-[var(--shadow-md)] hover:-translate-y-1';
    return (
      <button
        onClick={onClick}
        className={`w-full h-full text-left p-5 bg-[var(--color-surface)] rounded-[var(--radius-lg)] transition-all duration-200 border border-[var(--color-border)] flex flex-col ${activeClasses} ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`p-5 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] flex flex-col h-full ${className}`}
    >
      {content}
    </div>
  );
};

export default KpiCard;