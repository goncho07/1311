import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideProps } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'disabled' | 'children'> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'danger' | 'warning' | 'text';
  size?: 'md';
  icon?: React.ComponentType<LucideProps> | (() => React.ReactElement);
  iconOnly?: boolean;
  'aria-label': string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button = ({
  children,
  variant = 'filled',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  className = '',
  disabled = false,
  ...props
}: ButtonProps): React.ReactElement => {
  const baseClasses = `inline-flex items-center justify-center gap-2 font-bold rounded-[var(--radius-md)] transition-all duration-200 focus:outline-none focus-visible:ring-4`;

  const sizeClasses = {
    md: `px-5 h-11 text-sm`,
    iconMd: `w-11 h-11`,
  };

  const variantClasses = {
    filled: `bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:bg-[var(--color-primary-hover)]
             focus-visible:ring-[var(--color-primary)]/50
             disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed`,

    tonal: `bg-[var(--color-primary-light)] text-[var(--color-primary-text)]
            hover:bg-opacity-75
            focus-visible:ring-[var(--color-primary)]/50
            disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed`,

    outlined: `bg-transparent border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]
               hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)]
               focus-visible:ring-[var(--color-primary)]/50
               disabled:border-slate-200 dark:disabled:border-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed`,

    danger: `bg-[var(--color-danger)] text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
             focus-visible:ring-[var(--color-danger)]/50
             disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed`,

    warning: `bg-[var(--color-warning)] text-[var(--color-warning-text)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
             focus-visible:ring-[var(--color-warning)]/50
             disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed`,

    text: `bg-transparent text-[var(--color-text-secondary)]
           hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]
           disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed`,
  };

  const currentSizeClass = iconOnly ? sizeClasses.iconMd : sizeClasses.md;

  return (
    <motion.button
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98, y: -1 } : {}}
      className={`${baseClasses} ${currentSizeClass} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {!iconOnly && children}
    </motion.button>
  );
};

export default Button;