import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Check, X } from 'lucide-react';
import { Role, PermissionModule } from '@/types';
import { track } from '@/analytics/track';
import * as api from '@/services/api';

// New Architecture Components
import { ModulePage } from '@/layouts/ModulePage';
import Button from '@/ui/Button';
import Card from '@/ui/Card';
import Skeleton from '@/ui/Skeleton';

const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        setIsLoading(true);
        api.getRoles().then((data: any) => {
            setRoles(data.roles);
            setPermissionModules(data.modules);
            if (data.roles.length > 0) {
                setSelectedRole(data.roles[0]);
            }
            setIsLoading(false);
        })
    }, []);

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        track('role_viewed', { roleId: role.id, roleName: role.name });
    }

    const PermissionIcon: React.FC<{ granted: boolean }> = ({ granted }) => (
        granted ? <Check size={18} className="text-emerald-500" /> : <X size={18} className="text-slate-400" />
    );

    return (
        <ModulePage
            title="Roles y Permisos"
            description="Cree y edite roles para definir el acceso de los usuarios a diferentes partes del sistema."
            icon={Shield}
            actionsRight={<Button variant="filled" aria-label="Crear Nuevo Rol" icon={Plus}>Crear Rol</Button>}
            filters={<></>}
            content={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <aside className="md:col-span-1">
                        <Card className="!p-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 px-2 mb-2">Roles del Sistema</h2>
                            {isLoading ? <div className="space-y-1"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div> : (
                                <div className="space-y-1">
                                    {roles.map(role => (
                                        <Button
                                            key={role.id}
                                            variant={selectedRole?.id === role.id ? 'tonal' : 'text'}
                                            onClick={() => handleSelectRole(role)}
                                            aria-label={`Seleccionar rol ${role.name}`}
                                            className="w-full !h-auto !p-3 !justify-start !text-left"
                                        >
                                            <div>
                                                <p className={`font-bold text-base ${selectedRole?.id === role.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>{role.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">{role.description}</p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </aside>
                    <main className="md:col-span-2">
                         {isLoading || !selectedRole ? <Card><Skeleton className="h-96 w-full"/></Card> : (
                            <motion.div key={selectedRole.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedRole.name}</h2>
                                            <p className="text-slate-500 dark:text-slate-400">{selectedRole.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="tonal" aria-label="Editar Rol" icon={Edit} onClick={() => track('role_updated_start', { roleId: selectedRole.id })}>Editar</Button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b-2 border-slate-100 dark:border-slate-700">
                                                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Módulo</th>
                                                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Ver</th>
                                                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Crear</th>
                                                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Editar</th>
                                                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Eliminar</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {permissionModules.map(mod => (
                                                    <tr key={mod.key}>
                                                        <td className="p-3 font-semibold text-base text-slate-700 dark:text-slate-200">{mod.label}</td>
                                                        <td className="p-3 text-center"><div className="flex justify-center"><PermissionIcon granted={selectedRole.permissions[mod.key]?.view} /></div></td>
                                                        <td className="p-3 text-center"><div className="flex justify-center"><PermissionIcon granted={selectedRole.permissions[mod.key]?.create} /></div></td>
                                                        <td className="p-3 text-center"><div className="flex justify-center"><PermissionIcon granted={selectedRole.permissions[mod.key]?.edit} /></div></td>
                                                        <td className="p-3 text-center"><div className="flex justify-center"><PermissionIcon granted={selectedRole.permissions[mod.key]?.delete} /></div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                         )}
                    </main>
                </div>
            }
        />
    );
};

export default RolesPage;
