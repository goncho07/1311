import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  UserCheck,
  BookCheck,
  UserSearch,
  FileText,
  FileDown,
  Settings,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModulePage } from '@/layouts/ModulePage';
import KpiCard from '@/ui/KpiCard';
import Card from '@/ui/Card';

const kpiData = [
  { title: 'Avance Carga de Notas', value: '78%', icon: TrendingUp },
  { title: 'Actas Pendientes', value: '4', icon: FileText },
  { title: 'Alumnos en Riesgo', value: '18', icon: AlertTriangle },
  { title: 'Promedio General', value: '15.8', icon: BookCheck },
];

const actionCards = [
  {
    title: 'Avance por Docente',
    description: 'Monitorear el progreso de cada docente en el registro de calificaciones.',
    icon: UserCheck,
    path: '/academico/avance-docentes',
  },
  {
    title: 'Monitoreo por Cursos',
    description: 'Revisar promedios, estado y distribución de notas por cada materia impartida.',
    icon: BookCheck,
    path: '/academico/monitoreo-cursos',
  },
  {
    title: 'Monitoreo por Estudiantes',
    description: 'Identificar alumnos con bajo rendimiento o ausentismo y ver su ficha académica.',
    icon: UserSearch,
    path: '/academico/monitoreo-estudiantes',
  },
  {
    title: 'Actas y Certificados',
    description: 'Gestionar el flujo de aprobación de actas de notas y generar certificados oficiales.',
    icon: FileText,
    path: '/academico/actas-certificados',
  },
  {
    title: 'Reportes y Descargas',
    description: 'Generar informes consolidados, matrices de calificación y otros documentos.',
    icon: FileDown,
    path: '/academico/reportes-descargas',
  },
  {
    title: 'Configuración Académica',
    description: 'Definir periodos, ponderaciones, competencias y umbrales de alerta.',
    icon: Settings,
    path: '/academico/configuracion',
  },
];

const AcademicoPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ModulePage
      title="Módulo Académico"
      description="Supervise el proceso académico, desde el registro de notas hasta la generación de actas."
      icon={BookOpen}
      kpis={
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {kpiData.map((kpi) => (
            <motion.div key={kpi.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <KpiCard title={kpi.title} value={kpi.value} icon={kpi.icon} />
            </motion.div>
          ))}
        </motion.div>
      }
      filters={<></>}
      content={
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
        >
          {actionCards.map((card) => (
            <motion.div key={card.path} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
               <button
                  onClick={() => navigate(card.path)}
                  className="w-full h-full text-left p-5 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-200 flex flex-col items-start group"
                >
                  <div className="p-3 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-md)] mb-3">
                    <card.icon size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{card.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex-grow">{card.description}</p>
                   <div className="flex items-center justify-end text-[var(--color-primary)] font-bold mt-3 text-sm w-full">
                    <span>Ir al módulo</span>
                    <ArrowRight size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
                </button>
            </motion.div>
          ))}
        </motion.div>
      }
    />
  );
};

export default AcademicoPage;