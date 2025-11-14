import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  'aria-label': string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  const baseClasses = `h-4 w-4 rounded-[var(--radius-sm)] border-slate-300 dark:border-slate-600 text-indigo-600 bg-slate-100 dark:bg-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900`;

  if (label) {
    return (
      <label className="flex items-center gap-2">
        <input type="checkbox" className={`${baseClasses} ${className || ''}`} {...props} />
        <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
      </label>
    );
  }
  
  return (
    <input
      type="checkbox"
      className={`${baseClasses} ${className || ''}`}
      {...props}
    />
  );
};

export default Checkbox;
