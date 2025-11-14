import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Warehouse, Plus, Library, ArrowRight, Calendar, Search, Edit, History, Bell, AlertTriangle, CheckSquare, LucideProps
} from 'lucide-react';
import { track } from '@/analytics/track';

import { ModulePage } from '@/layouts/ModulePage';
import Table from '@/ui/Table';
import Button from '@/ui/Button';
import KpiCard from '@/ui/KpiCard';
import Input from '@/ui/Input';
import Select from '@/ui/Select';
import Chip from '@/ui/Chip';
import ActionMenu from '@/ui/ActionMenu';
import * as api from '@/services/api';
import { TableSkeleton } from '@/ui/Skeleton';

type ResourceTab = 'inventario' | 'prestamos' | 'reservas';

const RecursosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResourceTab>('inventario');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
        api.getResources(),
        api.getLoans()
    ]).then(([items, loansData]: [any, any]) => {
        setInventoryItems(items);
        setLoans(loansData);
        setIsLoading(false);
    }).catch(error => {
        console.error("Error fetching resources data:", error);
        setIsLoading(false);
    });
  }, []);

  const tabs: { id: ResourceTab; label: string; icon: React.ElementType }[] = [
    { id: 'inventario', label: 'Inventario', icon: Library },
    { id: 'prestamos', label: 'Préstamos', icon: ArrowRight },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
  ];
  
  const kpiData = useMemo(() => ([
    { title: 'Total de Activos', value: isLoading ? '...' : inventoryItems.reduce((sum, item) => sum + item.stock, 0), icon: Library },
    { title: 'Préstamos Activos', value: isLoading ? '...' : loans.filter(l => l.status === 'Activo').length, icon: ArrowRight },
    { title: 'Préstamos Vencidos', value: isLoading ? '...' : loans.filter(l => l.status === 'Vencido').length, icon: AlertTriangle },
    { title: 'Reservas Próximas', value: 0, icon: Calendar },
  ]), [inventoryItems, loans, isLoading]);

  const filteredInventory = useMemo(() => inventoryItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, inventoryItems]);
  const filteredLoans = useMemo(() => loans.filter(loan => loan.item.toLowerCase().includes(searchQuery.toLowerCase()) || loan.borrower.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, loans]);


  const handleSelect = (id: string) => {
    setSelectedRowIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentData = activeTab === 'inventario' ? filteredInventory : filteredLoans;
    setSelectedRowIds(isSelected ? new Set(currentData.map((item) => item.id)) : new Set());
  };
  
  const inventoryActions = (item: any) => [
    { label: 'Prestar', icon: ArrowRight, onClick: () => track('resource_loan_started', { resourceId: item.id }) },
    { label: 'Reservar', icon: Calendar, onClick: () => track('resource_reservation_started', { resourceId: item.id }) },
    { label: 'Editar', icon: Edit, onClick: () => {} },
    { label: 'Ver Historial', icon: History, onClick: () => {} },
  ];

  const loanActions = (loan: any) => [
    { label: 'Registrar Devolución', icon: CheckSquare, onClick: () => track('resource_return_registered', { loanId: loan.id }) },
    ...(loan.status === 'Vencido' ? [{ label: 'Notificar Atraso', icon: Bell, className: 'text-amber-600 dark:text-amber-400', onClick: () => track('overdue_notification_sent', { loanId: loan.id }) }] : []),
    { label: 'Ver Detalles', icon: Edit, onClick: () => {} },
  ];

  const inventoryColumns = [
    { key: 'name', header: 'Item', sortable: true, render: (i: any) => i.name },
    { key: 'category', header: 'Categoría', sortable: true, render: (i: any) => i.category },
    { key: 'stock', header: 'Stock', sortable: true, render: (i: any) => i.stock },
    { key: 'available', header: 'Disponibles', sortable: true, render: (i: any) => i.available },
    { key: 'status', header: 'Estado', sortable: true, render: (i: any) => <Chip color={i.status === 'Disponible' ? 'indigo' : 'amber'}>{i.status}</Chip> },
    { key: 'actions', header: 'Acciones', render: (i: any) => <ActionMenu actions={inventoryActions(i)} /> },
  ];

  const loansColumns = [
    { key: 'item', header: 'Item', sortable: true, render: (l: any) => l.item },
    { key: 'borrower', header: 'Prestatario', sortable: true, render: (l: any) => l.borrower },
    { key: 'dueDate', header: 'Fecha Devolución', sortable: true, render: (l: any) => l.dueDate },
    { key: 'status', header: 'Estado', sortable: true, render: (l: any) => <Chip color={l.status === 'Activo' ? 'indigo' : 'rose'}>{l.status}</Chip> },
    { key: 'actions', header: 'Acciones', render: (l: any) => <ActionMenu actions={loanActions(l)} /> },
  ];

  const renderContent = () => {
    if(isLoading) return <TableSkeleton cols={5} rows={5}/>
    
    switch (activeTab) {
      case 'inventario':
        if (filteredInventory.length === 0) return <div className="p-8 text-center text-slate-500">No hay recursos en el inventario.</div>;
        return <Table columns={inventoryColumns as any} rows={filteredInventory} getRowId={(i: any) => i.id} onSort={() => {}} sortConfig={null} selectable onSelect={handleSelect} onSelectAll={handleSelectAll} selectedRowIds={selectedRowIds} />;
      case 'prestamos':
        if (filteredLoans.length === 0) return <div className="p-8 text-center text-slate-500">No hay préstamos registrados.</div>;
        return <Table columns={loansColumns as any} rows={filteredLoans} getRowId={(l: any) => l.id} onSort={() => {}} sortConfig={null} selectable onSelect={handleSelect} onSelectAll={handleSelectAll} selectedRowIds={selectedRowIds} />;
      case 'reservas':
        return <div className="p-8 text-center text-slate-500">La gestión de reservas estará disponible próximamente.</div>;
      default: return null;
    }
  };

  return (
    <ModulePage
      title="Módulo de Recursos"
      description="Gestión de inventarios, préstamos, devoluciones y reservas de infraestructura."
      icon={Warehouse}
       kpis={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* FIX: Cast icon prop to satisfy KpiCard's expected prop type due to type inference issue. */}
            {kpiData.map(kpi => <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon as React.ComponentType<LucideProps>} />)}
        </div>
      }
      actionsRight={
        <Button variant="filled" aria-label="Nuevo Recurso" icon={Plus}>
          Nuevo Recurso
        </Button>
      }
      filters={
         <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-lg relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input type="text" aria-label="Buscar recurso" placeholder="Buscar por nombre, categoría o prestatario..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="!pl-10 !h-11" />
            </div>
            <div className="flex items-center gap-2">
                <Select aria-label="Filtrar por categoría">
                    <option>Todas las categorías</option>
                    <option>Biblioteca</option>
                    <option>Laboratorio</option>
                    <option>Tecnología</option>
                </Select>
                 <Select aria-label="Filtrar por estado">
                    <option>Todos los estados</option>
                    <option>Disponible</option>
                    <option>En Préstamo</option>
                    <option>Vencido</option>
                 </Select>
            </div>
        </div>
      }
      content={
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col flex-grow min-h-0">
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 p-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'filled' : 'tonal'}
                icon={tab.icon}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedRowIds(new Set());
                }}
                aria-label={`Ver ${tab.label}`}
                className="!rounded-lg !text-sm !h-10 !px-4"
              >
                {tab.label}
              </Button>
            ))}
          </nav>
          <div className="flex-grow overflow-y-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                {renderContent()}
            </motion.div>
          </div>
        </div>
      }
    />
  );
};

export default RecursosPage;