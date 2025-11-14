import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Activity as ActivityIcon, Save, Send, Pencil, Trash2, KeyRound, X, QrCode } from 'lucide-react';
// FIX: Use subpath imports for date-fns to ensure consistent types.
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import es from 'date-fns/locale/es';

// QR Code generation and Popover UI
import QRCode from 'react-qr-code';
import Popover from '@/ui/Popover';

import { UserStatus, Student, Staff, ParentTutor, GenericUser, UserRole } from '@/types';
import { useDataStore } from '@/store/dataStore';
import { isStudent, getUserType, formatUserName, isStaff } from '@/utils/helpers';
import { statusConfig } from '@/data/constants';
import Button from '@/ui/Button';
import Drawer from '@/ui/Drawer';
import UserProfileSummary from './UserProfileSummary';
import FamilyGroupView from './FamilyGroupView';
import IconButton from '@/ui/IconButton';
import Input from '@/ui/Input';
import Select from '@/ui/Select';

// FIX: Correctly type `level` to prevent indexing with a symbol.
type UserFormData = Partial<Student & Staff & ParentTutor> & { userType: UserRole | 'Personal', level?: 'inicial' | 'primaria' | 'secundaria' };

const BLANK_USER: UserFormData = {
    name: '',
    email: '',
    role: 'Estudiante',
    sede: 'Norte',
    condition: 'Regular',
    status: 'Pendiente',
    tags: [],
    userType: 'Estudiante',
    level: 'primaria',
    grade: '1° Grado',
    section: 'A',
};

interface UserDetailDrawerProps {
    isOpen: boolean;
    user: GenericUser | null;
    onClose: () => void;
    onSave: (user: UserFormData) => void;
    triggerElementRef: React.RefObject<HTMLButtonElement | null>;
    initialTab?: string;
}

// FIX: Added a return statement to the component, which was causing it to implicitly return `void`.
const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ isOpen, user, onClose, onSave, initialTab }) => {
    const { activityLogs: allLogs, gradesAndSections } = useDataStore();
    const isNewUser = !user;
    const [activeTab, setActiveTab] = useState(initialTab || 'resumen');
    const [formData, setFormData] = useState<UserFormData>(BLANK_USER);
    const [isEditing, setIsEditing] = useState(isNewUser);
    
    useEffect(() => {
        if (isOpen) {
            const newUserState: UserFormData = user ? { ...user, userType: getUserType(user) as any, level: 'primaria' } : { ...BLANK_USER };
            setFormData(newUserState);
            setIsEditing(isNewUser);
            setActiveTab(isNewUser ? 'resumen' : (initialTab || 'resumen'));
        }
    }, [isOpen, user, isNewUser, initialTab]);
    
    const dni = user ? (isStudent(user) ? user.documentNumber : isStaff(user) ? user.dni : null) : null;


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, userType: value as UserRole | 'Personal', role: value }));
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value as 'inicial' | 'primaria' | 'secundaria';
        const newGrades = Object.keys(gradesAndSections[newLevel]);
        const newGrade = newGrades[0];
        const newSections = (gradesAndSections[newLevel] as any)[newGrade] || [];
        const newSection = newSections[0] || '';
        setFormData((prev) => ({
            ...prev,
            level: newLevel,
            grade: newGrade,
            section: newSection
        }));
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newGrade = e.target.value;
        const level = formData.level as keyof typeof gradesAndSections;
        if (!level) return;
        const newSections = (gradesAndSections[level] as any)[newGrade] || [];
        const newSection = newSections[0] || '';
        setFormData((prev) => ({
            ...prev,
            grade: newGrade,
            section: newSection
        }));
    };
    
    const handleSaveClick = () => {
        onSave(formData);
        if (!isNewUser) {
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        if (isNewUser) {
            onClose();
        } else {
            setFormData(user ? { ...user, userType: getUserType(user) as any, level: 'primaria' } : { ...BLANK_USER });
            setIsEditing(false);
        }
    };

    const drawerTabs = [
        { id: 'resumen', label: 'Resumen', icon: Info },
        { id: 'actividad', label: 'Actividad', icon: ActivityIcon },
    ];

    const userLogs = useMemo(() => {
        if (!user) return [];
        const name = isStudent(user) ? user.fullName : user.name;
        return allLogs.filter(log => log.targetUser === name || log.user === name);
    }, [user, allLogs]);
    
    const name = user ? (isStudent(user) ? user.fullName : user.name) : 'Nuevo Usuario';
    const status = user ? user.status : 'Pendiente';

    const renderFormFields = () => {
        const userType = formData.userType;
        const currentLevel = formData.level;
        const gradesForLevel: string[] = (currentLevel && gradesAndSections[currentLevel]) ? Object.keys(gradesAndSections[currentLevel]) : [];
        const sectionsForGrade = (currentLevel && formData.grade && gradesAndSections[currentLevel]) ? (gradesAndSections[currentLevel] as any)[formData.grade] || [] : [];
        
        return (
            <div className="space-y-6 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <section>
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">Datos del Usuario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isNewUser && (
                             <div className="md:col-span-2">
                                <Select label="Tipo de Usuario" name="userType" value={formData.userType} onChange={handleUserTypeChange} aria-label="Tipo de Usuario">
                                    <option value="Estudiante">Estudiante</option>
                                    <option value="Docente">Docente</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Apoyo">Personal de Apoyo</option>
                                    <option value="Apoderado">Apoderado</option>
                                </Select>
                            </div>
                        )}
                        <div className="md:col-span-2"><Input label="Nombre Completo" name="name" type="text" value={formData.name || ''} onChange={handleInputChange} aria-label="Nombre Completo"/></div>
                        <div className="md:col-span-2"><Input label="Email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} aria-label="Email"/></div>
                        {userType === 'Estudiante' && (
                            <>
                                <div className="md:col-span-2">
                                    <Select label="Nivel" name="level" value={currentLevel} onChange={handleLevelChange} className="capitalize" aria-label="Nivel educativo">
                                        {Object.keys(gradesAndSections).map(level => <option key={level} value={level}>{level}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <Select label="Grado" name="grade" value={formData.grade || ''} onChange={handleGradeChange} aria-label="Grado">
                                        {gradesForLevel.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <Select label="Sección" name="section" value={String(formData.section ?? '')} onChange={handleInputChange} aria-label="Sección">
                                        {sectionsForGrade.map((section: string) => <option key={section} value={section}>{section}</option>)}
                                    </Select>
                                </div>
                            </>
                        )}
                        {(userType === 'Docente' || userType === 'Administrativo' || userType === 'Apoyo' || userType === 'Personal') && (
                             <div><Select label="Área" name="area" value={formData.area || 'Inicial'} onChange={handleInputChange} aria-label="Área"><option>Inicial</option><option>Primaria</option><option>Secundaria</option><option>Secretaría Académica</option><option>Administración</option></Select></div>
                        )}
                    </div>
                </section>
            </div>
        );
    }

    const renderContent = () => {
        if (isEditing) {
            return renderFormFields();
        }

        switch(activeTab) {
            case 'resumen':
                return (
                    <div className="space-y-5">
                        <UserProfileSummary user={user as GenericUser} />
                        {isStudent(user) && <FamilyGroupView student={user} />}
                    </div>
                );
            case 'actividad':
                 return (
                    <div className="space-y-3">
                    {userLogs.length > 0 ? userLogs.map(log => (
                        <div key={log.id} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <img src={log.userAvatar} className="w-9 h-9 rounded-full mt-1 shrink-0" alt={log.user}/>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <strong className="font-semibold text-slate-800 dark:text-slate-100">{formatUserName(log.user)}</strong> realizó la acción <strong className="font-semibold">{log.action}</strong>
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 italic">"{log.details}"</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: es })}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <p>No hay actividad reciente para este usuario.</p>
                        </div>
                    )}
                    </div>
                 );
            default:
                return null;
        }
    };

    const drawerTitle = (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} alt={name} className="w-16 h-16 rounded-full" />
                    <span className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full ${statusConfig[status as UserStatus]?.colorClasses} ring-2 ring-slate-50 dark:ring-slate-900`} />
                </div>
                <div>
                    <h2 id="drawer-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatUserName(name)}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">{getUserType(user)}</p>
                </div>
            </div>
             <IconButton icon={X} onClick={onClose} aria-label="Cerrar panel" variant="text" />
        </div>
    );
    
    const drawerFooter = (
        <div className="flex justify-between items-center">
             {!isEditing && (
                 <div className="flex items-center gap-1">
                    {/* FIX: Added missing aria-label props */}
                    <Button variant="tonal" icon={Send} aria-label="Enviar invitación">Invitar</Button>
                    <Button variant="tonal" icon={KeyRound} aria-label="Restablecer contraseña">Resetear Pass</Button>
                    <IconButton variant="text" icon={Trash2} aria-label="Eliminar usuario" className="text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10"/>
                </div>
             )}
             {isEditing && (
                 <Button variant="tonal" onClick={handleCancelEdit} aria-label="Cancelar edición">Cancelar</Button>
             )}
            <div className="flex items-center gap-2">
                {!isEditing && dni && (
                  <Popover trigger={<IconButton icon={QrCode} aria-label="Mostrar código QR" />}>
                     <div className="bg-white p-3 rounded-lg shadow-lg">
                        <QRCode value={dni} size={128} />
                     </div>
                  </Popover>
                )}
                <Button 
                    variant="filled" 
                    icon={isEditing ? Save : Pencil} 
                    onClick={isEditing ? handleSaveClick : () => setIsEditing(true)}
                    aria-label={isEditing ? "Guardar cambios" : "Editar usuario"}
                >
                    {isEditing ? 'Guardar Cambios' : 'Editar'}
                </Button>
            </div>
        </div>
    );

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title={drawerTitle} footer={drawerFooter}>
            {!isNewUser && (
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                {drawerTabs.map(tab => (
                    <Button
                        key={tab.id}
                        variant="text"
                        onClick={() => setActiveTab(tab.id)}
                        icon={tab.icon}
                        aria-label={`Ver pestaña ${tab.label}`}
                        className={`!rounded-b-none !border-b-2 ${activeTab === tab.id ? '!border-indigo-600 !text-indigo-600 dark:!text-indigo-400' : 'border-transparent text-slate-500 hover:!text-slate-800 dark:hover:!text-slate-200'}`}
                    >
                        {tab.label}
                    </Button>
                ))}
                </div>
            )}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </Drawer>
    );
};

export default UserDetailDrawer;