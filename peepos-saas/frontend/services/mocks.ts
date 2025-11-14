import {
  NavItem,
  Role,
  PermissionModule,
  PermissionModuleKey,
  Permissions,
  AcademicPeriod,
  Competency,
  CalendarEvent,
  ActivityLog,
  Student,
  Staff,
  ParentTutor,
  AutomaticNotification,
} from '@/types';
import {
  Home,
  Users,
  BookOpen,
  FileSpreadsheet,
  MessageSquare,
  Briefcase,
  HelpCircle,
  UsersRound,
  ClipboardCheck,
  Warehouse,
  Settings,
  Edit,
  BookCheck as BookCheckTeacher,
  QrCode,
  Sparkles,
  BookCheck as BookCheckAction,
  FileText,
} from 'lucide-react';

// --- Mock Users for Auth ---
export const mockUsers = {
  director: { name: 'Ángel G. Morales', role: 'director' },
  teacher: { name: 'Docente Genérico', role: 'teacher' },
};

// --- From data/nav.ts ---
export let directorNavItems: NavItem[] = [
  { to: '/', text: 'Inicio', icon: Home },
  { to: '/usuarios', text: 'Usuarios', icon: UsersRound },
  { to: '/matricula', text: 'Matrícula', icon: Users },
  { to: '/academico', text: 'Académico', icon: BookOpen },
  { to: '/asistencia', text: 'Asistencia', icon: ClipboardCheck },
  { to: '/asistencia/scan', text: 'Scanner QR', icon: QrCode },
  { to: '/comunicaciones', text: 'Comunicaciones', icon: MessageSquare },
  { to: '/reportes', text: 'Reportes', icon: FileSpreadsheet },
  { to: '/recursos', text: 'Recursos', icon: Warehouse },
  { to: '/admin', text: 'Administración y Finanzas', icon: Briefcase },
  { to: '/settings', text: 'Configuración', icon: Settings },
  { to: '/ayuda', text: 'Ayuda', icon: HelpCircle },
];

export let teacherNavItems: NavItem[] = [
  { to: '/', text: 'Inicio', icon: Home },
  { to: '/registrar-notas', text: 'Registrar Notas', icon: Edit },
  { to: '/libro-calificaciones', text: 'Libro de Calificaciones', icon: BookCheckTeacher },
  { to: '/comunicaciones', text: 'Comunicaciones', icon: MessageSquare },
  { to: '/ayuda', text: 'Ayuda', icon: HelpCircle },
];

// --- From data/dashboard.ts ---
export let directorQuickActions = [
  { text: 'Tomar Asistencia QR', icon: QrCode, path: '/asistencia/scan' },
  { text: 'Revisar Carga de Notas', icon: BookOpen, path: '/academico/avance-docentes' },
  { text: 'Enviar Comunicado', icon: MessageSquare, path: '/comunicaciones' },
  { text: 'Generar Reporte UGEL', icon: FileSpreadsheet, path: '/reportes' },
];

export let teacherQuickActions = [
  {
    text: 'Tomar Asistencia QR',
    icon: QrCode,
    path: '/asistencia/scan',
    styleClasses: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300',
  },
  {
    text: 'Revisar Notas',
    icon: BookCheckAction,
    path: '/registrar-notas',
    styleClasses: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
  },
  {
    text: 'Nuevo Comunicado',
    icon: MessageSquare,
    path: '/comunicaciones',
    styleClasses: 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300',
  },
  {
    text: 'Generar Reporte UGEL',
    icon: FileText,
    path: '/reportes',
    styleClasses: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300',
  },
  {
    text: 'Ver Prompt del Sistema',
    icon: Sparkles,
    path: '#prompt',
    styleClasses: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300',
  },
];


// --- From data/roles.ts ---
const allPermissionModules: PermissionModule[] = [
    { key: 'estudiantes', label: 'Estudiantes' },
    { key: 'docentes', label: 'Docentes' },
    { key: 'administrativos', label: 'Administrativos' },
    { key: 'padres', label: 'Padres/Tutores' },
    { key: 'academico', label: 'Gestión Académica' },
    { key: 'asistencia', label: 'Asistencia' },
    { key: 'comunicaciones', label: 'Comunicaciones' },
    { key: 'reportes', label: 'Reportes' },
];

const generatePermissions = (rules: Partial<Record<PermissionModuleKey, { v?: boolean; c?: boolean; e?: boolean; d?: boolean }>>): Record<PermissionModuleKey, Permissions> => {
    const permissions: any = {};
    allPermissionModules.forEach(module => {
        permissions[module.key] = {
            view: rules[module.key]?.v ?? false,
            create: rules[module.key]?.c ?? false,
            edit: rules[module.key]?.e ?? false,
            delete: rules[module.key]?.d ?? false,
        };
    });
    return permissions;
};

export let initialRoles: Role[] = [
  {
    id: 'director',
    name: 'Director',
    description: 'Acceso total a todos los módulos y configuraciones del sistema.',
    permissions: generatePermissions({
      estudiantes: { v: true, c: true, e: true, d: true },
      docentes: { v: true, c: true, e: true, d: true },
      administrativos: { v: true, c: true, e: true, d: true },
      padres: { v: true, c: true, e: true, d: true },
      academico: { v: true, c: true, e: true, d: true },
      asistencia: { v: true, c: true, e: true, d: true },
      comunicaciones: { v: true, c: true, e: true, d: true },
      reportes: { v: true, c: true, e: true, d: true },
    }),
  },
  {
    id: 'docente',
    name: 'Docente',
    description: 'Acceso para gestionar sus cursos, registrar notas y asistencia de sus alumnos asignados.',
    permissions: generatePermissions({
      estudiantes: { v: true },
      academico: { v: true, e: true },
      asistencia: { v: true, e: true },
      comunicaciones: { v: true, c: true },
    }),
  },
  {
    id: 'secretaria',
    name: 'Secretaría Académica',
    description: 'Gestiona matrículas, datos de estudiantes y emite certificados.',
    permissions: generatePermissions({
      estudiantes: { v: true, c: true, e: true },
      padres: { v: true, c: true, e: true },
      academico: { v: true },
      reportes: { v: true, c: true },
    }),
  },
];

export let permissionModules: PermissionModule[] = allPermissionModules;

// --- Other data files ---
export let initialPeriods: AcademicPeriod[] = [
  {
    id: 'period-2025',
    year: 2025,
    levels: ['Primaria', 'Secundaria'],
    vacancies: [
      { grade: 'Primer Grado', total: 60, enrolled: 58 },
      { grade: 'Segundo Grado', total: 60, enrolled: 60 },
      { grade: 'Tercer Grado', total: 90, enrolled: 85 },
      { grade: 'Cuarto Grado', total: 90, enrolled: 90 },
      { grade: 'Quinto Grado', total: 90, enrolled: 78 },
      { grade: 'Sexto Grado', total: 90, enrolled: 88 },
    ],
    status: 'Publicado',
  },
];

export let competencies: Competency[] = [
    {
        id: 'C1',
        name: 'Se comunica oralmente en su lengua materna',
        description: 'Recupera información explícita de textos orales que escucha seleccionando datos específicos. Infiere información deduciendo relaciones de causa-efecto.',
    },
];

export let gradesAndSections = {
  inicial: {
    '3 AÑOS': ['Margaritas', 'Crisantemos'],
    '4 AÑOS': ['Jasminez', 'Rosas', 'Lirios', 'Geranios'],
    '5 AÑOS': ['Orquideas', 'Tulipanes', 'Girasoles', 'Claveles'],
  },
  primaria: {
    '1° Grado': ['A', 'B', 'C'],
    '2° Grado': ['A', 'B', 'C'],
    '3° Grado': ['A', 'B', 'C'],
    '4° Grado': ['A', 'B', 'C', 'D'],
    '5° Grado': ['A', 'B', 'C'],
    '6° Grado': ['A', 'B', 'C'],
  },
  secundaria: {
    '1° Año': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    '2° Año': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '3° Año': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '4° Año': ['A', 'B', 'C', 'D', 'E', 'F'],
    '5° Año': ['A', 'B', 'C', 'D', 'E', 'F'],
  },
};

export let activityLogs: ActivityLog[] = [];
export let events: CalendarEvent[] = [];
export let students: Student[] = [];
export let staff: Staff[] = [];
export let parents: ParentTutor[] = [];
export let automaticNotifications: AutomaticNotification[] = [];
export let transactions: any[] = [];
export let studentPayments: any[] = [];
export let resources: any[] = [];
export let loans: any[] = [];
export let tasks: any[] = [];
export let communications: any[] = [];

// Function to initialize mock data for demonstration
export const initializeMockData = () => {
    // This could be expanded to create a more dynamic set of initial mock data
    // For now, it just ensures the arrays are there.
    if (activityLogs.length === 0) {
        // You can add default logs here if needed
    }
}
