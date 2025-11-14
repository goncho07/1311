import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import IconButton from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '7xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  const sizeClasses = {
    md: '',
    lg: 'lg:max-w-3xl',
    xl: 'lg:max-w-4xl xl:max-w-5xl',
    '7xl': 'lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-6 sm:px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`flex w-full flex-col max-h-[90vh] rounded-[var(--radius-lg)] bg-slate-50 shadow-xl dark:bg-slate-900 max-w-md sm:max-w-lg md:max-w-xl ${sizeClasses[size]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
              <IconButton
                icon={X}
                onClick={onClose}
                aria-label="Cerrar modal"
                variant="text"
                className="!w-9 !h-9"
              />
            </header>
            <div className="flex-grow overflow-y-auto p-5">{children}</div>
            {footer && (
              <footer className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-b-[var(--radius-lg)] shrink-0">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;