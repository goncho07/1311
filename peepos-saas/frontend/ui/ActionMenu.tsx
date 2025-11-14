import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideProps, MoreVertical } from 'lucide-react';
import IconButton from './IconButton';

interface Action {
  label: string;
  icon: React.ComponentType<LucideProps>;
  onClick: () => void;
  className?: string;
}

interface ActionMenuProps {
  actions: Action[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div ref={triggerRef}>
        <IconButton
            icon={MoreVertical}
            variant="text"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Más acciones"
            aria-haspopup="true"
            aria-expanded={isOpen}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30"
            role="menu"
          >
            <ul>
              {actions.map((action, index) => (
                <li key={index} role="none">
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      action.className || ''
                    }`}
                    role="menuitem"
                  >
                    <action.icon size={16} />
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;