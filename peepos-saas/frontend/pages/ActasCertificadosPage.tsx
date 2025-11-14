import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Check, AlertTriangle, Download } from 'lucide-react';
import { track } from '@/analytics/track';

import { ModulePage } from '@/layouts/ModulePage';
import Card from '@/ui/Card';
import Button from '@/ui/Button';
import IconButton from '@/ui/IconButton';
import Skeleton from '@/ui/Skeleton';
import * as api from '@/services/api';

const ActasCertificadosPage: React.FC = () => {
  const [actas, setActas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getMockActas().then((data: any) => {
        setActas(data);
        setIsLoading(false);
    });
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Aprobado':
        return { icon: Check, color: 'text-emerald-600 bg-emerald-100' };
      case 'Pendiente de Aprobación':
        return { icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' };
      case 'Requiere Corrección':
        return { icon: AlertTriangle, color: 'text-rose-600 bg-rose-100' };
      default:
        return { icon: FileText, color: 'text-slate-600 bg-slate-100' };
    }
  };

  return (
    <ModulePage
      title="Actas y Certificados"
      description="Gestione las actas de notas, apruebe documentos y genere certificados de estudios."
      icon={FileText}
      filters={<></>}
      content={
        <Card>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Actas de Notas Pendientes</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full my-2"/>)
            ) : actas.map((acta) => {
              const status = getStatusInfo(acta.status);
              const Icon = status.icon;
              return (
                <div
                  key={acta.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${status.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{acta.grade}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Solicitado por: {acta.requestedBy} - {acta.date}
                      </p>
                      <p className={`text-sm font-semibold ${status.color.split(' ')[0]}`}>{acta.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button
                      variant="text"
                      onClick={() => track('acta_opened', { actaId: acta.id })}
                      aria-label={`Ver acta ${acta.id}`}
                      className="!text-sm !h-auto !py-1.5"
                    >
                      Ver
                    </Button>
                    {acta.status === 'Pendiente de Aprobación' && (
                      <Button
                        variant="tonal"
                        onClick={() => track('acta_approved', { actaId: acta.id })}
                        aria-label={`Aprobar acta ${acta.id}`}
                        className="!text-sm !h-auto !py-1.5 !bg-emerald-100 !text-emerald-700 hover:!bg-emerald-200"
                      >
                        Aprobar
                      </Button>
                    )}
                    <IconButton
                      icon={Download}
                      variant="text"
                      aria-label={`Descargar acta ${acta.id}`}
                      className="!w-8 !h-8"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      }
    />
  );
};

export default ActasCertificadosPage;
