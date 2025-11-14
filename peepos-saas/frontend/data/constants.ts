// FIX: Import React to resolve namespace error for React.ElementType
import React from 'react';
import { UserStatus } from '@/types';
import { CheckCircle, PowerOff, AlertTriangle, UserMinus, Clock, Shield, GraduationCap, User, Users2 } from 'lucide-react';

export const eventCategoryColors: Record<string, string> = {
  Examen: 'border-amber-500',
  Feriado: 'border-rose-500',
  Reunión: 'border-indigo-500',
  Actividad: 'border-emerald-500',
  UGEL: 'border-violet-500',
  Cívico: 'border-sky-500',
  Gestión: 'border-slate-500',
};

export const gradeMap: { [key: string]: string } = {
  '1': 'Primer',
  primero: 'Primer',
  '2': 'Segundo',
  segundo: 'Segundo',
  '3': 'Tercero',
  tercero: 'Tercero',
  '4': 'Cuarto',
  cuarto: 'Cuarto',
  '5': 'Quinto',
  quinto: 'Quinto',
  '6': 'Sexto',
  sexto: 'Sexto',
};

export const statusConfig: Record<UserStatus, { label: string; icon: React.ElementType; colorClasses: string }> = {
  Activo: { label: 'Activo', icon: CheckCircle, colorClasses: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/30' },
  Inactivo: { label: 'Inactivo', icon: PowerOff, colorClasses: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-600' },
  Suspendido: { label: 'Suspendido', icon: AlertTriangle, colorClasses: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-500/30' },
  Egresado: { label: 'Egresado', icon: UserMinus, colorClasses: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 ring-1 ring-inset ring-sky-200 dark:ring-sky-500/30' },
  Pendiente: { label: 'Pendiente', icon: Clock, colorClasses: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 ring-1 ring-inset ring-sky-200 dark:ring-sky-500/30' },
};

export const roleConfig = {
    'Director': { icon: Shield, color: 'text-blue-500' },
    'Administrativo': { icon: Shield, color: 'text-blue-500' },
    'Docente': { icon: GraduationCap, color: 'text-emerald-500' },
    'Apoyo': { icon: GraduationCap, color: 'text-emerald-500' },
    'Estudiante': { icon: User, color: 'text-indigo-500' },
    'Apoderado': { icon: Users2, color: 'text-purple-500' },
    'N/A': { icon: User, color: 'text-slate-500' },
};