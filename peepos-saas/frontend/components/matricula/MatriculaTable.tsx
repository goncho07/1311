import React from 'react';
import {
  Search,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

import { Student, SortConfig } from '@/types';
import { formatUserName } from '@/utils/helpers';
import Button from '@/ui/Button';
import ActionMenu from '@/ui/ActionMenu';
import Pagination from '@/ui/Pagination';
import Chip from '@/ui/Chip';
import { generateFichaMatricula, generateConstanciaMatricula } from '@/utils/pdfGenerator';
import { FileText, CalendarCheck, ArrowRightLeft, UserX, ShieldCheck, FilePenLine } from 'lucide-react';
import { TableSkeleton } from '@/ui/Skeleton';

const TableHeader: React.FC<{
  columnKey: string;
  label: string;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  className?: string;
}> = ({ columnKey, label, sortConfig, onSort, className = '' }) => (
  <th className={`p-3 text-left font-semibold text-sm text-slate-600 dark:text-slate-300 ${className}`}>
    <button
      onClick={() => onSort(columnKey)}
      className="flex items-center gap-1 group w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
    >
      {label}
      <div className="opacity-30 group-hover:opacity-100 transition-opacity">
        {sortConfig?.key === columnKey ? (
          sortConfig.direction === 'asc' ? (
            <ArrowUp size={14} />
          ) : (
            <ArrowDown size={14} />
          )
        ) : (
          <ChevronsUpDown size={14} />
        )}
      </div>
    </button>
  </th>
);

const MatriculaTable: React.FC<{
    students: Student[];
    isLoading: boolean;
    onOpenDrawer: (student: Student) => void;
    onAction: (action: string, student: Student) => void;
    sortConfig: SortConfig | null;
    onSort: (key: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ students, isLoading, onOpenDrawer, onAction, sortConfig, onSort, currentPage, totalPages, onPageChange }) => {
    
  const actions = (student: Student) => [
    { label: 'Generar FUM', icon: FileText, onClick: () => generateFichaMatricula(student) },
    { label: 'Generar Constancia', icon: CalendarCheck, onClick: () => generateConstanciaMatricula(student) },
    { label: 'Registrar Traslado', icon: ArrowRightLeft, onClick: () => onAction('transfer', student) },
    { label: 'Registrar Retiro', icon: UserX, onClick: () => onAction('withdraw', student) },
    { label: 'Exoneraciones', icon: ShieldCheck, onClick: () => onAction('exoneration', student) },
    { label: 'Rectificar FUM', icon: FilePenLine, onClick: () => onAction('rectification', student) },
  ];

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
      <div className="flex-grow overflow-y-auto">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-base">
            <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <TableHeader columnKey="fullName" label="Estudiante" sortConfig={sortConfig} onSort={onSort} />
                <TableHeader columnKey="grade" label="Grado/Sección" sortConfig={sortConfig} onSort={onSort} />
                <th className="p-3 text-left font-semibold text-sm text-slate-600 dark:text-slate-300">Estado</th>
              <th className="p-3 w-20 text-center font-semibold text-sm text-slate-600 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <TableSkeleton cols={4} rows={5} /> : (
              students.length > 0 ? (
                students.map((s: Student) => (
                  <tr
                    key={s.documentNumber}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 h-18"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={s.avatarUrl} alt={s.fullName} className="w-11 h-11 rounded-full" />
                        <div>
                          <Button
                            variant="text"
                            onClick={() => onOpenDrawer(s)}
                            aria-label={`Ver detalles de ${s.fullName}`}
                            className="!p-0 !h-auto !font-bold !text-base text-slate-800 dark:text-slate-100 hover:underline !justify-start"
                          >
                            {formatUserName(s.fullName)}
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                      {s.grade} "{s.section}"
                    </td>
                    <td className="p-3">
                      <Chip
                        color={
                          s.enrollmentStatus === 'Matriculado'
                            ? 'indigo'
                            : s.enrollmentStatus === 'Trasladado'
                            ? 'amber'
                            : s.enrollmentStatus === 'Retirado'
                            ? 'rose'
                            : 'gray'
                        }
                      >
                        {s.enrollmentStatus}
                      </Chip>
                    </td>
                    <td className="p-3 text-center">
                      <ActionMenu actions={actions(s)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-500">
                    <Search size={40} className="mx-auto mb-2" />
                    <p className="font-semibold">No se encontraron estudiantes</p>
                  </td>
                </tr>
              )
            )}
          </tbody>
          </table>
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default MatriculaTable;
