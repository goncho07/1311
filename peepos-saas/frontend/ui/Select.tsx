import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, className, children, ...props }, ref) => {
  const baseClasses = `w-full pl-4 pr-10 h-12 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] bg-transparent text-base text-[var(--color-text-primary)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition focus:outline-none appearance-none disabled:opacity-50`;
  
  return (
    <div>
      {label && <label htmlFor={props.id} className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${className || ''}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
});

export default Select;