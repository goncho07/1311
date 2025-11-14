import React, { useEffect, useState } from 'react';
import { GraduationCap, Calendar, CheckSquare, Target } from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import { getEstudianteDashboardData } from '../services/api';

const EstudianteDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEstudianteDashboardData();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const promedio = data?.kpis?.promedio ?? 0;
  const asistencia = data?.kpis?.asistencia ?? 0;
  const tareas = data?.kpis?.tareas ?? 0;
  const competencias = data?.kpis?.competencias ?? 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel del Estudiante</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Promedio" value={promedio} icon={GraduationCap} />
        <KpiCard title="Asistencia" value={asistencia + '%'} icon={Calendar} />
        <KpiCard title="Tareas" value={tareas} icon={CheckSquare} />
        <KpiCard title="Competencias" value={competencias} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Notas por área</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Horario del día</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Tareas próximas</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Próximas evaluaciones</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Logros</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
      </div>
    </div>
  );
};

export default EstudianteDashboard;
