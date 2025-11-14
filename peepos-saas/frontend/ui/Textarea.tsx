import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  'aria-label': string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, className, ...props }, ref) => {
  const baseClasses = `w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-[var(--radius-md)] bg-slate-50 dark:bg-slate-800 text-lg text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:outline-none disabled:opacity-50`;
  
  return (
    <div>
      {label && <label htmlFor={props.id} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>}
      <textarea
        ref={ref}
        className={`${baseClasses} ${className || ''}`}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;