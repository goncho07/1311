import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  'aria-label': string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className, ...props }, ref) => {
  const baseClasses = `w-full px-4 h-12 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] bg-transparent text-base text-[var(--color-text-primary)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition focus:outline-none disabled:opacity-50`;
  
  return (
    <div>
      {label && <label htmlFor={props.id} className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">{label}</label>}
      <input
        ref={ref}
        className={`${baseClasses} ${className || ''}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
export default Input;