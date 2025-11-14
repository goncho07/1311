import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { useHotkey } from '@/hooks/useHotkey';
import { useUIStore } from '@/store/uiStore';

interface ModulePageProps {
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  kpis?: ReactNode;
  actionsRight?: ReactNode;
  filters: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  bulkBar?: ReactNode;
}

export const ModulePage: React.FC<ModulePageProps> = ({
  title,
  description,
  icon: Icon,
  kpis,
  actionsRight,
  filters,
  content,
  footer,
  bulkBar,
}) => {
  const { setCommandMenuOpen } = useUIStore();
  useHotkey(() => setCommandMenuOpen(true));

  return (
    <div className="flex flex-col gap-4 h-full">
      {bulkBar}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl">
            <Icon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            <p className="mt-1 text-base text-slate-500 dark:text-slate-400 max-w-4xl">{description}</p>
          </div>
        </div>
        {actionsRight && <div className="flex items-center gap-2 shrink-0">{actionsRight}</div>}
      </motion.header>

      {kpis && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {kpis}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="shrink-0"
      >
        {filters}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-grow min-h-0"
      >
        {content}
      </motion.div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
};