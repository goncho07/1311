import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, EnrollmentStatus, SearchTag } from '@/types';
import { useAdvancedFilter, FilterConfig } from '@/hooks/useAdvancedFilter';
import { gradeMap } from '@/data/constants';
import {
  Users,
  Plus,
  UserCheck,
  UserX,
  UserMinus,
  Building2,
  FileText,
  ArrowRightLeft,
  ShieldCheck,
  FilePenLine,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import * as api from '@/services/api';

import KpiCard from '@/ui/KpiCard';
import Button from '@/ui/Button';
import { generateFichaMatricula, generateConstanciaMatricula } from '@/utils/pdfGenerator';
import Drawer from '@/ui/Drawer';
import { ModulePage } from '@/layouts/ModulePage';
import UserListHeader from '@/components/users/UserListHeader';
import Modal from '@/ui/Modal';
import Input from '@/ui/Input';
import MatriculaTable from '@/components/matricula/MatriculaTable';

// --- MODAL & DRAWER COMPONENTS ---

const VacanciesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('metas');
  const tabs = [
    { id: 'metas', label: 'Metas por sección' },
    { id: 'docentes', label: 'Docentes asignados' },
    { id: 'resumen', label: 'Resumen' },
  ];
  return (
    <Modal isOpen={isOpen} title="Gestión de Vacantes 2025" onClose={onClose} size="xl">
      <div className="flex flex-col h-full min-h-[400px]">
        <nav className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="text"
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Ver ${tab.label}`}
              className={`!rounded-b-none !border-b-2 ${
                activeTab === tab.id
                  ? '!border-indigo-600 !text-indigo-600'
                  : '!border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeTab === 'metas' && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Defina la meta de estudiantes para cada sección. Este número representa la capacidad máxima del aula.
                  </p>
                </div>
              )}
              {activeTab === 'docentes' && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Asigne un docente a cada sección para que la vacante sea considerada válida según la normativa.
                  </p>
                </div>
              )}
              {activeTab === 'resumen' && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Revise el cálculo final de vacantes disponibles (Meta - Matriculados) antes de guardar los cambios.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <footer className="mt-6 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
        <Button variant="tonal" onClick={onClose} aria-label="Cancelar">
          Cancelar
        </Button>
        <Button variant="filled" onClick={onClose} aria-label="Guardar y Publicar">
          Guardar y Publicar
        </Button>
      </footer>
    </Modal>
  );
};

const NewEnrollmentWizard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <Modal isOpen={isOpen} title="Nueva Matrícula" onClose={onClose} size="lg">
      <div className="flex flex-col">
        <div className="flex items-center justify-center mb-6">
          {['Identificación', 'Ubicación', 'Confirmación'].map((label, index) => (
            <React.Fragment key={label}>
              <div className="flex items-center">
                <motion.div
                  animate={{ scale: step === index + 1 ? 1.1 : 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step > index ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > index ? <CheckCircle size={20} /> : index + 1}
                </motion.div>
                <span
                  className={`ml-2 text-base font-semibold transition-colors ${
                    step >= index + 1 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`flex-auto border-t-2 mx-4 transition-colors ${
                    step > index + 1 ? 'border-indigo-600' : 'border-slate-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {step === 1 && (
                <div>
                  <h3 className="font-semibold mb-2">Paso 1: Identificación del Estudiante</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Busque por DNI o Código de Estudiante para verificar si ya existe en el sistema o validar con RENIEC.
                  </p>
                  <Input
                    type="text"
                    aria-label="Buscar por DNI o Código de Estudiante"
                    placeholder="Ingrese DNI o Código"
                  />
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="font-semibold mb-2">Paso 2: Ubicación y Condición Académica</h3>
                  <p className="text-sm text-slate-500 mb-4">Seleccione los detalles académicos para la matrícula.</p>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3 className="font-semibold mb-2">Paso 3: Confirmación y Registro</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Revise los datos y confirme la matrícula. Se asignará una vacante si hay disponibilidad.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <Button
            variant="tonal"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            icon={ArrowLeft}
            aria-label="Paso anterior"
          >
            Anterior
          </Button>
          <div>
            {step < 3 ? (
              <Button variant="filled" onClick={() => setStep((s) => Math.min(3, s + 1))} aria-label="Siguiente paso">
                Siguiente <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="filled" onClick={onClose} icon={CheckCircle} aria-label="Finalizar Matrícula">
                Finalizar Matrícula
              </Button>
            )}
          </div>
        </footer>
      </div>
    </Modal>
  );
};

const StudentDetailDrawer: React.FC<{ student: Student | null; isOpen: boolean; onClose: () => void }> = ({
  student,
  isOpen,
  onClose,
}) => {
  if (!student) return null;
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Resumen FUM">
      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
          <h4 className="font-semibold mb-2">Accesos Rápidos</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="tonal"
              icon={FileText}
              onClick={() => generateFichaMatricula(student)}
              aria-label="Generar FUM PDF"
            >
              FUM PDF
            </Button>
            <Button
              variant="tonal"
              icon={CalendarCheck}
              onClick={() => generateConstanciaMatricula(student)}
              aria-label="Generar Constancia PDF"
            >
              Constancia
            </Button>
            <Button variant="tonal" icon={ArrowRightLeft} aria-label="Registrar Traslado">
              Traslado
            </Button>
            <Button variant="tonal" icon={UserX} aria-label="Registrar Retiro">
              Retiro
            </Button>
            <Button variant="tonal" icon={ShieldCheck} aria-label="Gestionar Exoneraciones">
              Exoneración
            </Button>
            <Button variant="tonal" icon={FilePenLine} aria-label="Rectificar FUM">
              Rectificar FUM
            </Button>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
          <p className="font-bold text-lg">{student.fullName}</p>
          <p className="text-sm text-slate-500">DNI: {student.documentNumber}</p>
        </div>
      </div>
    </Drawer>
  );
};


const studentFilterConfig: FilterConfig<Student> = {
    getId: (student) => student.documentNumber,
    getFullName: (student) => student.fullName,
    createSpecializedTag: (value: string, items: Student[]): SearchTag | null => {
        const gradeRegex = /(?:(\d{1,2})|(primero|segundo|tercero|cuarto|quinto|sexto))\s?([A-F])/i;
        const match = value.match(gradeRegex);
        if (match) {
            const gradeNum = match[1];
            const gradeName = match[2];
            const section = match[3].toUpperCase();
            const gradeWord = gradeMap[gradeNum as keyof typeof gradeMap] || gradeMap[gradeName as keyof typeof gradeMap];
            if (gradeWord) {
                const isValid = items.some((u) => u.grade.toLowerCase() === gradeWord.toLowerCase() && u.section === section);
                return { value: `${gradeWord} ${section}`, displayValue: `Grado: ${gradeWord} "${section}"`, type: 'grade', isValid };
            }
        }
        const statusValues = ['pre-matriculado', 'matriculado', 'trasladado', 'retirado', 'pendiente'];
        const lowerValue = value.toLowerCase();
        if (statusValues.includes(lowerValue)) {
          const display = value.charAt(0).toUpperCase() + value.slice(1);
          const isValid = items.some(s => s.enrollmentStatus.toLowerCase() === lowerValue);
          return { value: display as EnrollmentStatus, displayValue: `Estado: ${display}`, type: 'status', isValid };
        }
        return null;
    },
    applyTagFilters: (items: Student[], tags: SearchTag[]): Student[] => {
        const validTags = tags.filter((t) => t.isValid);
        if (validTags.length === 0) return items;
        return items.filter((student) => {
            return validTags.every((tag) => {
                if (tag.type === 'grade') {
                    const [grade, section] = tag.value.split(' ');
                    return student.grade === grade && student.section === section;
                }
                if (tag.type === 'status') {
                    return student.enrollmentStatus === tag.value;
                }
                const lowerValue = tag.value.toLowerCase();
                return student.fullName.toLowerCase().includes(lowerValue) || student.documentNumber.includes(lowerValue);
            });
        });
    },
};

const MatriculaPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [vacanciesModalOpen, setVacanciesModalOpen] = useState(false);
  const [newEnrollmentModalOpen, setNewEnrollmentModalOpen] = useState(false);
  const [detailDrawerState, setDetailDrawerState] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null,
  });
  
  useEffect(() => {
    setIsLoading(true);
    api.getStudents().then((studentsData: any) => {
        setStudents(studentsData);
        setIsLoading(false);
    }).catch(error => {
        console.error("Error fetching students: ", error);
        setIsLoading(false);
    });
  }, []);

  const {
    paginatedItems: paginatedStudents,
    totalPages,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    searchTags,
    handleAddTag,
    handleRemoveTag,
  } = useAdvancedFilter(students, studentFilterConfig, 10);

  const kpiData = useMemo(() => {
    if (isLoading) return Array(4).fill({ title: '', value: '...' });
    const enrolled = students.filter((s) => s.enrollmentStatus === 'Matriculado').length;
    const transferred = students.filter((s) => s.enrollmentStatus === 'Trasladado').length;
    const withdrawn = students.filter((s) => s.enrollmentStatus === 'Retirado').length;
    const availableVacancies = 50; // Placeholder
    return [
      { title: 'Matriculados', value: enrolled, icon: UserCheck },
      { title: 'Trasladados', value: transferred, icon: UserX },
      { title: 'Retirados', value: withdrawn, icon: UserMinus },
      { title: 'Vacantes Disp.', value: availableVacancies, icon: Building2 },
    ];
  }, [students, isLoading]);

  const handleOpenDrawer = (student: Student) => setDetailDrawerState({ isOpen: true, student });
  const handleCloseDrawer = () => setDetailDrawerState({ isOpen: false, student: null });

  return (
    <>
      <ModulePage
        title="Módulo de Matrícula"
        description="Gestione el proceso de matrícula, traslados, retiros y vacantes para el año lectivo."
        icon={Users}
        kpis={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <KpiCard key={kpi.title || index} title={kpi.title} value={kpi.value} icon={kpi.icon || UserCheck} />
            ))}
          </div>
        }
        actionsRight={
          <>
            <Button variant="tonal" icon={Building2} onClick={() => setVacanciesModalOpen(true)} aria-label="Gestionar Vacantes">
              Gestionar Vacantes
            </Button>
            <Button variant="filled" icon={Plus} onClick={() => setNewEnrollmentModalOpen(true)} aria-label="Nueva Matrícula">
              Nueva Matrícula
            </Button>
          </>
        }
        filters={<UserListHeader tags={searchTags} allUsers={students} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />}
        content={
          <MatriculaTable
            isLoading={isLoading}
            students={paginatedStudents}
            onOpenDrawer={handleOpenDrawer}
            onAction={(action, student) => console.log(action, student)}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        }
      />
      <VacanciesModal isOpen={vacanciesModalOpen} onClose={() => setVacanciesModalOpen(false)} />
      <NewEnrollmentWizard isOpen={newEnrollmentModalOpen} onClose={() => setNewEnrollmentModalOpen(false)} />
      <StudentDetailDrawer student={detailDrawerState.student} isOpen={detailDrawerState.isOpen} onClose={handleCloseDrawer} />
    </>
  );
};

export default MatriculaPage;
