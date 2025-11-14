import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Scale,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { track } from '@/analytics/track';

import { ModulePage } from '@/layouts/ModulePage';
import Button from '@/ui/Button';
import KpiCard from '@/ui/KpiCard';
import Drawer from '@/ui/Drawer';
import Card from '@/ui/Card';
import Skeleton from '@/ui/Skeleton';
import * as api from '@/services/api';

const FinanceBarChart: React.FC<{ income: number; expense: number }> = ({ income, expense }) => {
  const maxValue = Math.max(income, expense, 1);
  const incomeHeight = (income / maxValue) * 100;
  const expenseHeight = (expense / maxValue) * 100;

  const barContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    paddingBottom: '1px',
  };

  return (
    <div className="w-full h-full flex justify-around items-end gap-6 px-4 pb-2 border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center flex-1 h-full">
        <div style={barContainerStyle}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${incomeHeight}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full bg-emerald-500 rounded-t-md"
            title={`Ingresos: S/ ${income.toFixed(2)}`}
          />
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">Ingresos</span>
      </div>
      <div className="flex flex-col items-center flex-1 h-full">
        <div style={barContainerStyle}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${expenseHeight}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full bg-rose-500 rounded-t-md"
            title={`Gastos: S/ ${expense.toFixed(2)}`}
          />
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">Gastos</span>
      </div>
    </div>
  );
};

const AdminFinanzasPage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [studentPayments, setStudentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getFinancials().then((data: any) => {
        setTransactions(data.transactions);
        setStudentPayments(data.studentPayments);
        setIsLoading(false);
    }).catch(error => {
        console.error("Failed to load financial data:", error);
        setIsLoading(false);
    });
  }, []);

  const kpiData = useMemo(() => {
    if (isLoading) return Array(4).fill({ title: '', value: '...', icon: Banknote });
    const ingresos = transactions.filter((t) => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
    const gastos = transactions.filter((t) => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0);
    const pagosPendientes = studentPayments.filter((p) => p.status === 'Pendiente').length;
    return [
      { title: 'Ingresos del Mes', value: `S/ ${ingresos.toFixed(2)}`, icon: ArrowUpRight },
      { title: 'Gastos del Mes', value: `S/ ${Math.abs(gastos).toFixed(2)}`, icon: ArrowDownLeft },
      { title: 'Balance del Mes', value: `S/ ${(ingresos + gastos).toFixed(2)}`, icon: Scale },
      { title: 'Pagos Pendientes', value: pagosPendientes, icon: Clock },
    ];
  }, [isLoading, transactions, studentPayments]);

  const incomeValue = useMemo(() => parseFloat(kpiData[0].value.replace('S/ ', '') || '0'), [kpiData]);
  const expenseValue = useMemo(() => parseFloat(kpiData[1].value.replace('S/ ', '') || '0'), [kpiData]);

  return (
    <>
      <ModulePage
        title="Administración y Finanzas"
        description="Gestión de ingresos, gastos, pagos y configuración de parámetros institucionales."
        icon={Briefcase}
        kpis={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiData.map((kpi, index) => (
              <KpiCard key={kpi.title || index} title={kpi.title} value={kpi.value} icon={kpi.icon} />
            ))}
          </div>
        }
        actionsRight={
          <>
            <Button
              variant="tonal"
              aria-label="Exportar Reporte"
              icon={Download}
              onClick={() => track('report_exported', { type: 'finance' })}
            >
              Exportar Reporte
            </Button>
            <Button
              variant="filled"
              aria-label="Nuevo Registro"
              icon={Plus}
              onClick={() => {
                track('finance_entry_created_start');
                setIsDrawerOpen(true);
              }}
            >
              Nuevo Registro
            </Button>
          </>
        }
        filters={
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-slate-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Mostrando: Mes Actual</span>
            </div>
            <Button variant="tonal" aria-label="Cambiar rango de fechas">
              Cambiar Rango
            </Button>
          </div>
        }
        content={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="flex-grow !p-0 overflow-hidden flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Transacciones Recientes</h2>
                </header>
                <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                  {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) :
                   transactions.length === 0 ? <p className="text-center text-slate-500 py-8">No hay transacciones registradas.</p> :
                   transactions.map((t) => {
                    const isIncome = t.type === 'Ingreso';
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${ isIncome ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20' }`}>
                            {isIncome ? ( <ArrowUpRight className="text-emerald-600" size={20} /> ) : ( <ArrowDownLeft className="text-rose-600" size={20} /> )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{t.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {t.category} - {new Date(t.date).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold text-lg ${ isIncome ? 'text-emerald-600' : 'text-rose-600' }`}>
                          {isIncome ? '+' : ''}S/ {Math.abs(t.amount).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <footer className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <Button variant="text" className="w-full !justify-center" aria-label="Ver todas las transacciones">
                    Ver todas las transacciones <ChevronRight size={16} />
                  </Button>
                </footer>
              </Card>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <Card className="!p-0 overflow-hidden">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Estado de Pagos (APAFA)</h2>
                </header>
                <div className="p-4 space-y-3">
                  {isLoading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) :
                   studentPayments.length === 0 ? <p className="text-center text-slate-500 py-4 text-sm">No hay pagos registrados.</p> :
                   studentPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{p.student}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.concept}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {p.status === 'Pagado' ? ( <CheckCircle size={16} className="text-emerald-500" /> ) : ( <Clock size={16} className="text-amber-500" /> )}
                        <span className={p.status === 'Pagado' ? 'text-emerald-600' : 'text-amber-600'}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-4">Ingresos vs. Gastos</h2>
                <div className="h-48">
                  {isLoading ? <Skeleton className="w-full h-full"/> : <FinanceBarChart income={incomeValue} expense={expenseValue} />}
                </div>
              </Card>
            </div>
          </div>
        }
      />
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Nuevo Registro Financiero">
        <p>Formulario para nuevo registro de ingreso/gasto...</p>
      </Drawer>
    </>
  );
};

export default AdminFinanzasPage;
