import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Download } from 'lucide-react';
// FIX: Use subpath imports for date-fns to ensure consistent types.
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import es from 'date-fns/locale/es';
import { ActivityLog } from '@/types';
import { track } from '@/analytics/track';
import * as api from '@/services/api';
import toast from 'react-hot-toast';

// New Architecture Components
import { ModulePage } from '@/layouts/ModulePage';
import Button from '@/ui/Button';
import Card from '@/ui/Card';
import Select from '@/ui/Select';
import Skeleton from '@/ui/Skeleton';
import { formatUserName } from '@/utils/helpers';

const LogSkeleton = () => (
    <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

const ActivityLogPage: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [actorFilter, setActorFilter] = useState('all');

    useEffect(() => {
        setIsLoading(true);
        api.getActivityLogs().then((logsData: any) => {
            setLogs(logsData);
            setIsLoading(false);
        }).catch(error => {
            console.error("Error fetching activity logs:", error);
            setIsLoading(false);
        });
    }, []);

    const filteredLogs = useMemo(() => {
        track('audit_viewed');
        return logs.filter(log => {
            const actionMatch = actionFilter === 'all' || log.action === actionFilter;
            const actorMatch = actorFilter === 'all' || log.user === actorFilter;
            return actionMatch && actorMatch;
        });
    }, [logs, actionFilter, actorFilter]);

    const uniqueActions = useMemo(() => [...new Set(logs.map(log => log.action))], [logs]);
    const uniqueActors = useMemo(() => [...new Set(logs.map(log => log.user))], [logs]);
    
    const handleExport = () => {
        track('audit_log_exported');
        // CSV export logic here...
        toast.success('Exportando a CSV...');
    };

    return (
        <ModulePage
            title="Registro de Actividad Global"
            description="Audite todas las acciones importantes realizadas por los usuarios en el sistema."
            icon={Activity}
            actionsRight={<Button variant="tonal" aria-label="Exportar a CSV" icon={Download} onClick={handleExport}>Exportar a CSV</Button>}
            filters={
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row gap-4">
                     <div className="flex-1">
                         <Select id="action-filter" aria-label="Filtrar por acción" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                            <option value="all">Todas las Acciones</option>
                            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Select id="actor-filter" aria-label="Filtrar por actor" value={actorFilter} onChange={e => setActorFilter(e.target.value)}>
                            <option value="all">Todos los Actores</option>
                            {uniqueActors.map(a => <option key={a} value={a}>{a}</option>)}
                        </Select>
                    </div>
                </div>
            }
            content={
                <Card className="!p-6 flex-grow flex flex-col min-h-0">
                    <div className="space-y-4 pr-2">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <LogSkeleton key={i} />)
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No se encontraron registros de actividad.</div>
                    ) : (
                        filteredLogs.map(log => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                            >
                                <img src={log.userAvatar} className="w-10 h-10 rounded-full mt-1 shrink-0" alt={log.user}/>
                                <div>
                                    <p className="text-base">
                                        <strong className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{formatUserName(log.user)}</strong> realizó la acción <strong className="font-semibold">{log.action}</strong>
                                        {log.targetUser && log.targetUser !== 'N/A' && <> sobre <strong className="font-semibold capitalize">{formatUserName(log.targetUser)}</strong></>}
                                    </p>
                                    <p className="text-base text-slate-600 dark:text-slate-400 mt-1 italic">"{log.details}"</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: es })} {log.ipAddress && `(IP: ${log.ipAddress})`}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                    </div>
                </Card>
            }
        />
    );
};

export default ActivityLogPage;