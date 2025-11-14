import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { UsersRound, Plus, UploadCloud, Download, Trash2, Eye, Edit } from 'lucide-react';

import * as api from '@/services/api';

// Types and Hooks
import {
  GenericUser,
  Student,
  ConfirmationModalState,
  ScheduleModalState,
  SearchTag,
  UserStatus,
  Staff,
  ParentTutor,
} from '@/types';
import { track } from '@/analytics/track';
import { useAdvancedFilter, FilterConfig } from '@/hooks/useAdvancedFilter';
import { isStudent, getLevel } from '@/utils/helpers';
import { gradeMap } from '@/data/constants';

// PDF Utils
import { generateStudentCarnetsPDF } from '@/utils/pdfGenerator';
import { useSettingsStore } from '@/store/settingsStore';

// New Architecture Components
import { ModulePage } from '@/layouts/ModulePage';
import Button from '@/ui/Button';
import UserKpiCards from '@/components/users/UserKpiCards';
import UserListHeader from '@/components/users/UserListHeader';
import UserTable from '@/components/users/UserTable';
// FIX: Changed to default import for UserDetailDrawer.
import UserDetailDrawer from '@/components/users/UserDetailDrawer';
import UserImportModal from '@/components/users/UserImportModal';
import ConfirmationModal from '@/components/users/ConfirmationModal';
import ScheduleDeactivationModal from '@/components/users/ScheduleDeactivationModal';
import GenerateCarnetsModal from '@/components/users/GenerateCarnetsModal';
import BulkActionBar from '@/components/users/BulkActionBar';
import IconButton from '@/ui/IconButton';

// Local type for normalized user data, used for display purposes
interface NormalizedUser {
  id: string;
  displayName: string;
  role: string;
  level: string;
  gradeSection: string;
  dni: string;
  avatarUrl: string;
}

const userFilterConfig: FilterConfig<NormalizedUser> = {
  getId: (user: NormalizedUser): string => user.dni,
  getFullName: (user: NormalizedUser): string => user.displayName,

  createSpecializedTag: (value: string, users: NormalizedUser[]): SearchTag | null => {
    const gradeRegex = /(?:(\d{1,2})|(primero|segundo|tercero|cuarto|quinto|sexto))\s?([A-F])/i;
    const match = value.match(gradeRegex);
    if (match) {
      const gradeNum = match[1];
      const gradeName = match[2];
      const section = match[3].toUpperCase();
      const gradeWord = gradeMap[gradeNum as keyof typeof gradeMap] || gradeMap[gradeName as keyof typeof gradeMap];
      if (gradeWord) {
        const gradeSectionString = `${gradeWord} ${section}`;
        const isValid = users.some(u => u.gradeSection.startsWith(gradeSectionString));
        return { value: gradeSectionString, displayValue: `Grado: ${gradeWord} "${section}"`, type: 'grade', isValid };
      }
    }
    const statusValues: UserStatus[] = ['Activo', 'Inactivo', 'Suspendido', 'Egresado', 'Pendiente'];
    const foundStatus = statusValues.find(s => s.toLowerCase() === value.toLowerCase());
    if (foundStatus) {
      // Note: Status is not part of NormalizedUser, so we can't validate it here. Assume valid.
      return { value: foundStatus, displayValue: `Estado: ${foundStatus}`, type: 'status', isValid: true };
    }
    return null;
  },

  applyTagFilters: (users: NormalizedUser[], tags: SearchTag[]): NormalizedUser[] => {
    const validTags = tags.filter((t) => t.isValid);
    if (validTags.length === 0) return users;

    return users.filter((user) => {
      return validTags.every((tag) => {
        if (tag.type === 'grade') {
          return user.gradeSection.startsWith(tag.value);
        }
        if (tag.type === 'status') {
          // Status filtering is not supported directly on normalized users, would require adding status field.
          // For now, we allow other filters to proceed.
          return true; 
        }
        const lowerValue = tag.value.toLowerCase();
        return (
          user.displayName.toLowerCase().includes(lowerValue) ||
          user.dni.toLowerCase().includes(lowerValue)
        );
      });
    });
  },
};

const UsersPage: React.FC = () => {
  const settings = useSettingsStore();
  const [allUsers, setAllUsers] = useState<NormalizedUser[]>([]);
  const [originalUsersMap, setOriginalUsersMap] = useState<Map<string, GenericUser>>(new Map());
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todos');
  const [detailDrawerState, setDetailDrawerState] = useState<{ isOpen: boolean; user: GenericUser | null; initialTab?: string }>({ isOpen: false, user: null });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [scheduleModal, setScheduleModal] = useState<ScheduleModalState>({ isOpen: false, onConfirm: () => {}, users: [] });
  const [carnetsModalOpen, setCarnetsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  const actionTriggerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    api.getUsers().then(usersData => {
        const normalizedRows: NormalizedUser[] = [];
        const originalMap = new Map<string, GenericUser>();

        usersData.forEach((d: any) => {
            const docId = d.dni || d.documentNumber || Date.now().toString();
            const displayName = d.displayName || d.name || d.fullName || [d.names, d.paternalLastName, d.maternalLastName].filter(Boolean).join(' ');
            
            // 1. Create NORMALIZED user for Table/KPIs/Filtering
            const normalizedUser: NormalizedUser = {
              id: docId,
              displayName: displayName || '—',
              role: d.role || d.category || 'N/A',
              level: getLevel(d) || 'N/A',
              gradeSection: d.grade ? `${d.grade} "${d.section}"` : 'N/A',
              dni: d.dni || d.documentNumber,
              avatarUrl: d.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || docId)}&background=random`,
            };
            normalizedRows.push(normalizedUser);

            // 2. Create ORIGINAL GenericUser for Detail Drawer
            originalMap.set(docId, d);
        });

        setAllUsers(normalizedRows);
        setOriginalUsersMap(originalMap);
        setIsLoading(false);
    }).catch(error => {
        console.error("Error fetching users: ", error);
        setIsLoading(false);
    });
  }, []);

  const usersForTab = useMemo(() => {
    if (activeTab === 'Todos') return allUsers;
    const lowerCaseTab = activeTab.slice(0, -1).toLowerCase(); // Estudiantes -> Estudiante
    return allUsers.filter(user => user.role.toLowerCase() === lowerCaseTab);
  }, [activeTab, allUsers]);

  const { paginatedItems, totalPages, currentPage, setCurrentPage, sortConfig, handleSort, searchTags, handleAddTag, handleRemoveTag, clearFilters } = useAdvancedFilter(
    usersForTab,
    userFilterConfig as any, // Cast because we are using NormalizedUser
    10
  );

  useEffect(() => setSelectedUserIds(new Set()), [searchTags, activeTab, currentPage]);

  const handleOpenDrawer = (user: NormalizedUser | null, initialTab: string = 'resumen', event?: React.SyntheticEvent) => {
    actionTriggerRef.current = (event?.currentTarget as HTMLElement) || null;
    const originalUser = user ? originalUsersMap.get(user.id) : null;
    setDetailDrawerState({ isOpen: true, user: originalUser || null, initialTab });
  };
  const handleCloseDrawer = () => {
    setDetailDrawerState({ isOpen: false, user: null });
    actionTriggerRef.current?.focus();
  };
  
  const handleSelect = (user: NormalizedUser, event: React.MouseEvent) => {
      const id = user.dni;
      setSelectedUserIds(prev => {
          if (event.ctrlKey || event.metaKey) {
              const newSet = new Set(prev);
              if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
              return newSet;
          }
          if (prev.has(id) && prev.size === 1) return new Set<string>();
          return new Set([id]);
      });
  };

  const selectedUser = useMemo(() => {
    if (selectedUserIds.size !== 1) return null;
    const selectedId = selectedUserIds.values().next().value;
    return allUsers.find(u => u.dni === selectedId) || null;
  }, [selectedUserIds, allUsers]);

  const handleSaveUser = (formData: any) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 500)), {
        loading: 'Guardando usuario...', success: 'Usuario guardado con éxito.', error: 'Error al guardar el usuario.',
    });
    handleCloseDrawer();
  };

  const handleImportUsers = (newUsers: GenericUser[]) => toast.success(`${newUsers.length} usuarios importados.`);
  
  const handleGenerateCarnets = async (usersToPrint: Student[]) => {
    if (usersToPrint.length === 0) return toast.error('No se encontraron estudiantes para generar carnets.');
    toast.loading('Generando carnets...', { duration: Infinity });
    try {
        await generateStudentCarnetsPDF(usersToPrint, settings);
        toast.dismiss();
        toast.success(`${usersToPrint.length} carnet(s) generado(s).`);
    } catch (error) {
        toast.dismiss();
        toast.error('Ocurrió un error al generar los carnets.');
    }
    setCarnetsModalOpen(false);
  };

  const handleBulkGenerate = (filters: { rol: string; level: string; grade: string; section: string }) => {
    const studentsToPrint: Student[] = [];
    allUsers.forEach(u => {
        const original = originalUsersMap.get(u.id);
        if (original && isStudent(original)) {
             if (filters.level !== 'Todos' && getLevel(original).toLowerCase() !== filters.level.toLowerCase()) return;
             if (filters.grade !== 'Todos los Grados' && original.grade !== filters.grade) return;
             if (filters.section !== 'Todas las Secciones' && original.section !== filters.section) return;
             studentsToPrint.push(original);
        }
    });
    handleGenerateCarnets(studentsToPrint);
  };
  
  const bulkBarContent = useMemo(() => {
    if (selectedUserIds.size === 1 && selectedUser) {
        const originalForCarnet = originalUsersMap.get(selectedUser.id);
        return (
            <>
                <Button variant="tonal" icon={Eye} onClick={(e) => handleOpenDrawer(selectedUser, 'resumen', e)} aria-label="Ver Ficha 360">Ver Ficha</Button>
                <Button variant="tonal" icon={Edit} onClick={(e) => handleOpenDrawer(selectedUser, 'resumen', e)} aria-label="Editar Usuario">Editar</Button>
                {originalForCarnet && isStudent(originalForCarnet) && <Button variant="tonal" icon={Download} onClick={() => handleGenerateCarnets([originalForCarnet])} aria-label="Generar Carnet">Generar Carnet</Button>}
            </>
        );
    }
    if (selectedUserIds.size > 1) {
        return (
             <>
                <IconButton variant="text" icon={Trash2} aria-label={`Eliminar ${selectedUserIds.size} usuarios`} onClick={() => {}} className="text-slate-300 hover:text-rose-400" />
                <IconButton variant="text" icon={Download} aria-label={`Generar carnets para ${selectedUserIds.size} usuarios`} onClick={() => {}} className="text-slate-300 hover:text-indigo-400" />
            </>
        );
    }
    return null;
  }, [selectedUserIds, selectedUser, originalUsersMap]);
  
  // FIX: Use the original full user data for the header/autocomplete, not the normalized data.
  const originalUsersArray = useMemo(() => Array.from(originalUsersMap.values()), [originalUsersMap]);

  return (
    <>
      <ModulePage
        title="Gestión de Usuarios"
        description="Administre la información de estudiantes, docentes y personal."
        icon={UsersRound}
        kpis={<UserKpiCards users={allUsers} activeTab={activeTab} onTabChange={setActiveTab} />}
        actionsRight={
          <>
            <Button variant="tonal" icon={Download} onClick={() => setCarnetsModalOpen(true)} aria-label="Generar Carnets en Lote">Generar Carnets</Button>
            <Button variant="tonal" icon={UploadCloud} onClick={() => setImportModalOpen(true)} aria-label="Importar Usuarios">Importar</Button>
            <Button variant="filled" icon={Plus} onClick={(e) => handleOpenDrawer(null, 'resumen', e)} aria-label="Crear Usuario">Crear Usuario</Button>
          </>
        }
        filters={
// FIX: Pass the original user data array to satisfy the component's prop type.
            <UserListHeader tags={searchTags} allUsers={originalUsersArray} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
        }
        content={
          <UserTable
            isLoading={isLoading}
            users={paginatedItems}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onOpen={(user, event) => handleOpenDrawer(user, 'resumen', event)}
            onSelect={handleSelect}
            selectedIds={selectedUserIds}
            onClearFilters={clearFilters}
            onCreateUser={(e) => handleOpenDrawer(null, 'resumen', e)}
          />
        }
        bulkBar={<BulkActionBar count={selectedUserIds.size} onClear={() => setSelectedUserIds(new Set())}>{bulkBarContent}</BulkActionBar>}
      />
      
      <UserDetailDrawer
          isOpen={detailDrawerState.isOpen}
          user={detailDrawerState.user}
          onClose={handleCloseDrawer}
          onSave={handleSaveUser}
          triggerElementRef={actionTriggerRef as React.RefObject<HTMLButtonElement>}
          initialTab={detailDrawerState.initialTab}
      />
      <UserImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImportUsers} />
      <ConfirmationModal {...confirmationModal} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} />
      <ScheduleDeactivationModal {...scheduleModal} onClose={() => setScheduleModal(prev => ({...prev, isOpen: false }))} />
      <GenerateCarnetsModal isOpen={carnetsModalOpen} onClose={() => setCarnetsModalOpen(false)} onGenerate={handleBulkGenerate} />
    </>
  );
};

export default UsersPage;