import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  ClipboardCheck,
  Users,
  BookOpen,
  Warehouse,
  Briefcase,
  FileText,
  FileBarChart2,
  FileBox,
  FilePieChart,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  FileCog,
  History,
  Clock,
} from 'lucide-react';

import Button from '@/ui/Button';
import Card from '@/ui/Card';
import Modal from '@/ui/Modal';
import Select from '@/ui/Select';
import Input from '@/ui/Input';
import { ModulePage } from '@/layouts/ModulePage';
import KpiCard from '@/ui/KpiCard';
import IconButton from '@/ui/IconButton';

type ReportCategory = 'Asistencia' | 'Matrícula' | 'Académico' | 'Recursos' | 'Finanzas';
type GenerationStatus = 'En proceso' | 'Listo' | 'Fallido';

interface Report {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface GenerationQueueItem {
  id: number;
  reportTitle: string;
  status: GenerationStatus;
}

interface DownloadHistoryItem {
  id: number;
  reportTitle: string;
  user: string;
  timestamp: Date;
}

const allReports: Report[] = [
  { id: 'asis-1', category: 'Asistencia', title: 'UGEL Asistencia Mensual', description: 'Consolidado oficial de asistencia mensual para la UGEL.', icon: FileBarChart2 },
  { id: 'asis-2', category: 'Asistencia', title: 'Tardanzas por Sección', description: 'Detalle de tardanzas acumuladas por estudiante y sección.', icon: ClipboardCheck },
  { id: 'mat-1', category: 'Matrícula', title: 'Nómina de Matrícula', description: 'Listado oficial de estudiantes matriculados por sección.', icon: Users },
  { id: 'acad-1', category: 'Académico', title: 'Consolidado de Notas', description: 'Acta consolidada de calificaciones finales por sección.', icon: BookOpen },
  { id: 'rec-1', category: 'Recursos', title: 'Inventario por Categoría', description: 'Reporte de stock y estado de los recursos del inventario.', icon: FileBox },
  { id: 'fin-1', category: 'Finanzas', title: 'Ejecución Presupuestal', description: 'Balance de ingresos y gastos del periodo seleccionado.', icon: FilePieChart },
];

const GenerateReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onGenerate: (reportTitle: string) => void;
}> = ({ isOpen, onClose, report, onGenerate }) => {
  if (!report) return null;

  const handleGenerate = () => {
    onGenerate(report.title);
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="tonal" onClick={onClose} aria-label="Cancelar">Cancelar</Button>
      <Button variant="filled" onClick={handleGenerate} aria-label="Generar Reporte">Generar Reporte</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generar: ${report.title}`} footer={footer} size="lg">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Filtros</h3>
            <Select label="Nivel" id="nivel-filter" aria-label="Filtrar por Nivel"><option>Todos</option><option>Primaria</option><option>Secundaria</option></Select>
            <Select label="Grado" id="grado-filter" aria-label="Filtrar por Grado"><option>Todos</option><option>1° Grado</option><option>2° Grado</option></Select>
            <Input label="Rango de Fechas" id="date-range" type="date" aria-label="Filtrar por Rango de Fechas" />
        </div>
        <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Previsualización</h3>
            <div className="h-48 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-500">
                <FileCog size={32} />
                <span className="ml-2">Vista previa no disponible</span>
            </div>
            <div className="mt-4">
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Exportar</h3>
                 <div className="flex gap-2">
                    <Button variant="tonal" className="flex-1 !justify-center" aria-label="Exportar a PDF">PDF</Button>
                    <Button variant="tonal" className="flex-1 !justify-center" aria-label="Exportar a Excel">Excel</Button>
                 </div>
            </div>
        </div>
      </div>
    </Modal>
  );
};

const ReportCard: React.FC<{ report: Report; onGenerate: () => void; onDownload: () => void; }> = ({ report, onGenerate, onDownload }) => (
    <motion.button
        onClick={onGenerate}
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        whileHover={{ y: -5 }}
        className="w-full h-full text-left p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all flex flex-col group"
    >
        <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl">
                <report.icon size={28} />
            </div>
            <IconButton icon={Download} variant="text" aria-label="Descargar última versión" onClick={(e) => { e.stopPropagation(); onDownload(); }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-grow mt-3">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{report.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{report.description}</p>
        </div>
        <div className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            Generar Reporte
        </div>
    </motion.button>
);

const ActivityPanel: React.FC<{ queue: GenerationQueueItem[], history: DownloadHistoryItem[] }> = ({ queue, history }) => {
    const [activeTab, setActiveTab] = useState('queue');
    const tabs = [
        { id: 'queue', label: 'Cola de Generación', icon: Clock },
        { id: 'history', label: 'Historial', icon: History }
    ];
    
    const statusIcons: Record<GenerationStatus, React.ReactElement> = {
        'En proceso': <Loader2 size={16} className="text-sky-500 animate-spin" />,
        'Listo': <CheckCircle size={16} className="text-emerald-500" />,
        'Fallido': <XCircle size={16} className="text-rose-500" />,
    };

    return (
        <Card className="flex flex-col h-full !p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Actividad de Reportes</h2>
            </div>
            <nav className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-800/50">
                {tabs.map(tab => (
                    <Button 
                        key={tab.id} 
                        variant={activeTab === tab.id ? 'filled' : 'tonal'} 
                        onClick={() => setActiveTab(tab.id)}
                        icon={tab.icon}
                        className="!flex-1 !text-sm !h-9"
                        aria-label={`Ver ${tab.label}`}
                    >
                        {tab.label}
                    </Button>
                ))}
            </nav>
            <div className="flex-grow p-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {activeTab === 'queue' && (
                            <div className="space-y-3">
                                {queue.map(item => (
                                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{item.reportTitle}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                {statusIcons[item.status]} {item.status}
                                            </span>
                                            {item.status === 'Fallido' && <Button variant="text" icon={RefreshCw} className="!text-xs !h-auto !px-1.5 !py-0.5" aria-label="Reintentar">Reintentar</Button>}
                                            {item.status === 'Listo' && <Button variant="text" icon={Download} className="!text-xs !h-auto !px-1.5 !py-0.5" aria-label="Descargar">Descargar</Button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {activeTab === 'history' && (
                            <div className="space-y-3">
                                {history.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{item.reportTitle}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.user} - {item.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                        <IconButton variant="text" icon={Eye} aria-label="Ver detalles" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Card>
    );
};


const ReportesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('Asistencia');
  const [modalState, setModalState] = useState<{ isOpen: boolean; report: Report | null }>({ isOpen: false, report: null });
  const [generationQueue, setGenerationQueue] = useState<GenerationQueueItem[]>([
     { id: 1, reportTitle: 'Nómina de Matrícula - 4° Grado', status: 'En proceso' },
  ]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([
      { id: 1, reportTitle: 'Tardanzas por Sección - Septiembre', user: 'Ángel G. Morales', timestamp: new Date(Date.now() - 3600000) },
  ]);

  const filteredReports = useMemo(() => allReports.filter(r => r.category === activeCategory), [activeCategory]);
  
  const handleOpenModal = (report: Report) => setModalState({ isOpen: true, report });
  
  const handleGenerateReport = (reportTitle: string) => {
    const newItem: GenerationQueueItem = {
        id: Date.now(),
        reportTitle,
        status: 'En proceso',
    };
    setGenerationQueue(prev => [newItem, ...prev]);

    setTimeout(() => {
        setGenerationQueue(prev => prev.map(item => item.id === newItem.id ? { ...item, status: Math.random() > 0.1 ? 'Listo' : 'Fallido' } : item));
    }, 3000 + Math.random() * 2000);
  };
  
  const categories: ReportCategory[] = ['Asistencia', 'Matrícula', 'Académico', 'Recursos', 'Finanzas'];
  
  const kpiData = useMemo(() => ([
    { title: 'Generados Hoy', value: 1, icon: FileCog },
    { title: 'En Cola', value: generationQueue.filter(i => i.status === 'En proceso').length, icon: Loader2 },
    { title: 'Errores Recientes', value: generationQueue.filter(i => i.status === 'Fallido').length, icon: XCircle },
  ]), [generationQueue]);

  return (
    <>
      <ModulePage
        title="Centro de Reportes"
        description="Genere, descargue y monitoree todos los informes institucionales desde un solo lugar."
        icon={FileSpreadsheet}
        kpis={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {kpiData.map(kpi => (
                    <KpiCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.value}
                        icon={kpi.icon}
                    />
                ))}
            </div>
        }
        filters={
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'filled' : 'tonal'}
                  onClick={() => setActiveCategory(cat)}
                  className="!h-10 !px-4 !text-sm !font-semibold !rounded-lg"
                  aria-pressed={activeCategory === cat}
                  aria-label={`Filtrar por categoría ${cat}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        }
        content={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Galería de Reportes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map(report => (
                    <ReportCard 
                        key={report.id} 
                        report={report} 
                        onGenerate={() => handleOpenModal(report)} 
                        onDownload={() => { /* Placeholder */ }}
                    />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 min-h-[400px]">
              <ActivityPanel queue={generationQueue} history={downloadHistory} />
            </div>
          </div>
        }
      />
      <GenerateReportModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, report: null })} report={modalState.report} onGenerate={handleGenerateReport} />
    </>
  );
};

export default ReportesPage;