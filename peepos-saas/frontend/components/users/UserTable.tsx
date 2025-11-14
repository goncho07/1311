import React from 'react';
import {
  Eye,
  Search,
  RefreshCw,
  Plus,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from 'lucide-react';

import IconButton from '@/ui/IconButton';
import { TableSkeleton } from '@/ui/Skeleton';

// Types and helpers
import { SortConfig } from '@/types';
import { formatUserName } from '@/utils/helpers';
import { roleConfig } from '@/data/constants';
import Button from '@/ui/Button';
import Pagination from '@/ui/Pagination';

const TableHeader: React.FC<{
  columnKey: string;
  label: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  className?: string;
}> = ({ columnKey, label, onSort, sortConfig, className = '' }) => (
  <th className={`px-4 py-3 text-sm font-bold text-left text-[var(--color-text-secondary)] whitespace-nowrap ${className}`}>
    <button
      onClick={() => onSort(columnKey)}
      className="flex items-center gap-1 group w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
    >
      {label}
      <div className="opacity-30 group-hover:opacity-100 transition-opacity">
        {sortConfig?.key === columnKey ? (
          sortConfig.direction === 'asc' ? (
            <ArrowUp size={16} />
          ) : (
            <ArrowDown size={16} />
          )
        ) : (
          <ChevronsUpDown size={16} />
        )}
      </div>
    </button>
  </th>
);

const UserTableRow: React.FC<{
  user: any; // Changed to any to accept normalized user
  isSelected: boolean;
  onSelect: (user: any, event: React.MouseEvent) => void;
  onOpen: (user: any, event: React.SyntheticEvent) => void;
}> = React.memo(({ user, isSelected, onSelect, onOpen }) => {
  const name = user.displayName;
  const roleForIcon = user.role;
  const roleData = roleConfig[roleForIcon as keyof typeof roleConfig] || roleConfig['N/A'];
  const RoleIcon = roleData.icon;
  const level = user.level;
  const gradeSectionDisplay = user.gradeSection;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(user, e);
    }
  };

  return (
    <tr
      role="row"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={(e) => onSelect(user, e)}
      onDoubleClick={(e) => onOpen(user, e)}
      onKeyDown={handleKeyDown}
      title="Doble clic o Enter para abrir"
      className={`h-20 cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] ${
        isSelected ? 'ring-2 ring-inset ring-[var(--color-primary)]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <td className="sticky left-0 bg-inherit px-4 truncate">
        <div className="flex items-center gap-3">
          <img src={user.avatarUrl} alt={name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-left font-bold text-base text-[var(--color-text-primary)]">
                {formatUserName(name)}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 text-[var(--color-text-secondary)] text-base truncate">
        <div className="flex items-center gap-2 font-semibold">
          <RoleIcon size={22} className={`shrink-0 ${roleData.color}`} />
          <span>{roleForIcon}</span>
        </div>
      </td>
      <td className="px-4 text-[var(--color-text-secondary)] font-semibold text-base truncate">{level}</td>
      <td className="px-4 text-[var(--color-text-secondary)] font-semibold text-base truncate">{gradeSectionDisplay}</td>
    </tr>
  );
});

const EmptyState: React.FC<{
  onClearFilters: () => void;
  onCreateUser: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ onClearFilters, onCreateUser }) => (
  <tr>
    <td colSpan={4} className="text-center py-16">
      <div className="max-w-md mx-auto">
        <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">No se encontraron resultados</h3>
        <p className="mt-2 text-base text-[var(--color-text-secondary)]">
          Pruebe ajustar los filtros o el término de búsqueda para encontrar lo que busca.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outlined" onClick={onClearFilters} icon={RefreshCw} aria-label="Limpiar Filtros">
            Limpiar Filtros
          </Button>
          <Button variant="filled" onClick={onCreateUser} icon={Plus} aria-label="Crear Usuario">
            Crear Usuario
          </Button>
        </div>
      </div>
    </td>
  </tr>
);

interface UserTableProps {
  isLoading: boolean;
  users: any[]; // Changed to any[]
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpen: (user: any, event: React.SyntheticEvent) => void;
  onSelect: (user: any, event: React.MouseEvent) => void;
  selectedIds: Set<string>;
  onClearFilters: () => void;
  onCreateUser: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  isLoading,
  users,
  sortConfig,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  onOpen,
  onSelect,
  selectedIds,
  onClearFilters,
  onCreateUser,
}) => {
  const getId = (user: any) => user.dni;

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)] overflow-hidden">
      <div className="flex-grow overflow-y-auto">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
          <thead className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <tr className="border-b-2 border-[var(--color-border)]">
              <TableHeader
                columnKey="displayName"
                label="Nombre"
                sortConfig={sortConfig!}
                onSort={onSort}
                className="sticky left-0 w-2/5"
              />
              <TableHeader columnKey="role" label="Rol" sortConfig={sortConfig!} onSort={onSort} className="w-1/5" />
              <TableHeader columnKey="level" label="Nivel" sortConfig={sortConfig!} onSort={onSort} className="w-1/5" />
              <TableHeader columnKey="gradeSection" label="Grado/Sección" sortConfig={sortConfig!} onSort={onSort} className="w-1/5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-light)]">
            {isLoading ? <TableSkeleton cols={4} rows={10} /> : users.length > 0 ? (
              users.map((user) => (
                <UserTableRow
                  key={getId(user)}
                  user={user}
                  isSelected={selectedIds.has(getId(user))}
                  onSelect={onSelect}
                  onOpen={onOpen}
                />
              ))
            ) : (
              <EmptyState onClearFilters={onClearFilters} onCreateUser={onCreateUser} />
            )}
          </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-[var(--color-border-light)]">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default UserTable;