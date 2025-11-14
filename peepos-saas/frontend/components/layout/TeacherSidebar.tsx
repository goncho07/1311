import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import * as api from '@/services/api';
import { NavItem } from '@/types';
import IconButton from '@/ui/IconButton';
import { X } from 'lucide-react';

const TeacherSidebar: React.FC = () => {
  const { isSidebarCollapsed, isSidebarOpen, closeSidebar } = useUIStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    api.getTeacherNavItems().then(setNavItems);
  }, []);

  const linkClasses =
    'flex items-center px-6 py-4 text-lg text-[var(--color-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-light)] transition-all duration-200 group relative font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]';
  const activeLinkClasses = 'bg-[var(--color-primary-light)] text-[var(--color-primary-text)]';
  const logoUrl = '/assets/images/teacher-logo.png';
  const desktopWidth = isSidebarCollapsed ? 'md:w-24' : 'md:w-64';

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[90vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-gray-900 md:static md:z-0 md:flex md:max-w-none md:translate-x-0 md:shadow-none md:w-64 md:shrink-0 ${
          isSidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none md:pointer-events-auto'
        } ${desktopWidth}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-4 md:justify-center md:gap-0 md:py-5">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo del Colegio" className="h-12 w-12 shrink-0 object-contain" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="hidden text-left text-xl font-bold leading-tight text-[var(--color-text-primary)] md:block"
                >
                  Portal Docente
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <IconButton
            icon={X}
            onClick={closeSidebar}
            aria-label="Cerrar menú de navegación"
            variant="text"
            className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          />
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 md:px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to} onMouseEnter={() => setHoveredItem(item.to)} onMouseLeave={() => setHoveredItem(null)}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                  onClick={closeSidebar}
                >
                  <item.icon
                    className={`h-6 w-6 shrink-0 transition-all duration-200 ${
                      isSidebarCollapsed ? 'mx-auto' : 'mr-4'
                    }`}
                  />
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        {item.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {isSidebarCollapsed && hoveredItem === item.to && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white shadow-lg"
                      >
                        {item.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default TeacherSidebar;
