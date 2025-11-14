import React, { useEffect, useState } from 'react';
import { Grid, Users, Calendar, MessageSquare } from 'lucide-react';
import KpiCard from '../ui/KpiCard';
import { getApoderadoDashboardData } from '../services/api';

const ApoderadoDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApoderadoDashboardData();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const promedio = data?.kpis?.promedio ?? 0;
  const asistencia = data?.kpis?.asistencia ?? 0;
  const pagos = data?.kpis?.pagos ?? 0;
  const mensajes = data?.kpis?.mensajes ?? 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel del Apoderado</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Promedio" value={promedio} icon={Grid} />
        <KpiCard title="Asistencia" value={asistencia + '%'} icon={Calendar} />
        <KpiCard title="Pagos" value={pagos} icon={Users} />
        <KpiCard title="Mensajes" value={mensajes} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Notas por área</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Alertas recientes</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Calendario de asistencia</h2>
          <div className="text-[var(--color-text-secondary)]">Próximamente</div>
        </div>
        <div className="col-span-2 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h2 className="font-semibold mb-2">Accesos rápidos</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white">Descargar boleta</button>
            <button className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white">Ver horario</button>
            <button className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white">Mensajes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApoderadoDashboard;
