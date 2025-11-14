import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStatus } from '../../types';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Input from '../../ui/Input';

const USER_ROLES = ['Todos', 'Director', 'Administrativo', 'Docente', 'Apoyo', 'Estudiante', 'Apoderado'];
const USER_LEVELS = ['Todos', 'Inicial', 'Primaria', 'Secundaria'];
const USER_STATUSES: (UserStatus | 'Todos')[] = ['Todos', 'Activo', 'Inactivo', 'Suspendido', 'Pendiente', 'Egresado'];

interface Filters {
    searchTerm: string;
    tagFilter: string;
    status: UserStatus | 'Todos';
    level: string;
    role: string;
}

interface AdvancedSearchPopoverProps {
    trigger: React.ReactElement;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    activeTab: string;
}

const AdvancedSearchPopover: React.FC<AdvancedSearchPopoverProps> = ({ trigger, filters, setFilters, activeTab }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleApply = () => {
        setFilters(localFilters);
        setIsOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const contextualUserRoles = React.useMemo(() => {
        if (activeTab === 'Administrativos' || activeTab === 'Docentes') {
            return ['Todos', 'Director', 'Administrativo', 'Docente', 'Apoyo'];
        }
        if (activeTab === 'Estudiantes' || activeTab === 'Apoderados') {
            return [];
        }
        return USER_ROLES;
    }, [activeTab]);


    return (
        <div className="relative">
            <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-40"
                    >
                        <div className="p-4 space-y-4">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Filtros Avanzados</h4>
                            {contextualUserRoles.length > 0 && (
                                <Select label="Rol de Usuario" id="role-filter-popover" value={localFilters.role} onChange={e => setLocalFilters(f => ({...f, role: e.target.value}))}>
                                    {contextualUserRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                </Select>
                            )}
                            {activeTab !== 'Apoderados' && (
                                <Select label="Nivel" id="level-filter-popover" value={localFilters.level} onChange={e => setLocalFilters(f => ({...f, level: e.target.value}))}>
                                    {USER_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                                </Select>
                            )}
                             <Select label="Estado" id="status-filter-popover" value={localFilters.status} onChange={e => setLocalFilters(f => ({...f, status: e.target.value as any}))}>
                                {USER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                             </Select>
                             <Input
                                label="Etiquetas"
                                id="tag-filter-popover"
                                type="text"
                                aria-label="Filtrar por etiquetas"
                                value={localFilters.tagFilter}
                                onChange={e => setLocalFilters(f => ({...f, tagFilter: e.target.value}))}
                                placeholder="Ej: beca, refuerzo..."
                            />
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                            <Button variant="filled" onClick={handleApply} aria-label="Aplicar filtros">Aplicar Filtros</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSearchPopover;
