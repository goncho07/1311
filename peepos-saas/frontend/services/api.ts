/**
 * @fileoverview Capa de Servicio API (Simulada).
 * 
 * Este archivo centraliza toda la comunicación de datos del frontend.
 * Actualmente, simula una API RESTful retornando datos de prueba (mocks)
 * con una latencia artificial para emular una llamada de red.
 *
 * --- GUÍA DE MIGRACIÓN A BACKEND REAL ---
 * 1.  Construya los endpoints en su backend (ej. Cloud Run) que correspondan a cada función en este archivo.
 * 2.  Reemplace el cuerpo de cada función por una llamada `fetch` a su API real, usando la constante `API_BASE_URL`.
 * 3.  Asegúrese de manejar la autenticación (enviando el JWT) y la gestión de errores (try/catch).
 * 
 * Ejemplo de reemplazo:
 * 
 * ANTES (Simulado):
 * export const getUsers = async (): Promise<GenericUser[]> => {
 *   return simulateNetwork([...mocks.students, ...mocks.staff, ...mocks.parents]);
 * };
 * 
 * DESPUÉS (Real):
 * export const getUsers = async (): Promise<GenericUser[]> => {
 *   const token = localStorage.getItem('jwt'); // o donde guarde el token
 *   const response = await fetch(`${API_BASE_URL}/users`, {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch users');
 *   }
 *   return response.json();
 * };
 * -----------------------------------------
 */
import * as mocks from './mocks';
import { NavItem, GenericUser, Task } from '@/types';
import { resolveEnv } from '@/config/env';

const { API_BASE_URL } = resolveEnv();

const simulateNetwork = <T,>(data: T, delay = 300): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// --- Auth ---
export const login = async (dni: string, password: string): Promise<{ user: any, token: string } | null> => {
  console.log(`Using API_BASE_URL: ${API_BASE_URL}`); // For debugging
  if (dni === 'director' && password === 'password') {
    return simulateNetwork({ user: mocks.mockUsers.director, token: 'jwt-token-simulado-director' });
  }
  if (dni === 'docente' && password === 'password') {
    return simulateNetwork({ user: mocks.mockUsers.teacher, token: 'jwt-token-simulado-docente' });
  }
  return simulateNetwork(null);
};

export const logout = () => {
  // In a real app, this would invalidate the token on the server
  return Promise.resolve();
};

// --- Nav & UI Config ---
export const getDirectorNavItems = async (): Promise<NavItem[]> => {
  return simulateNetwork(mocks.directorNavItems);
};
export const getTeacherNavItems = async (): Promise<NavItem[]> => {
  return simulateNetwork(mocks.teacherNavItems);
};

// --- Dashboard ---
export const getDashboardData = async () => {
  // In a real API, this would fetch KPIs, tasks, and events in one call
  const kpis = { activeStudents: 0, attendanceToday: 0, dailyIncidents: 0, pendingActs: 0 }; // Calculated server-side
  const tasks = mocks.tasks;
  const events = mocks.events;
  const quickActions = mocks.directorQuickActions;
  return simulateNetwork({ kpis, tasks, events, quickActions });
};

export const getTeacherDashboardData = async () => {
  const quickActions = mocks.teacherQuickActions;
  const kpis = { sections: 0, students: 0, pending_grades: 0 };
  const today_schedule = [] as any[];
  const students_with_alerts = [] as any[];
  const upcoming_evaluations = [] as any[];
  return simulateNetwork({ quickActions, kpis, today_schedule, students_with_alerts, upcoming_evaluations });
}

export const getApoderadoDashboardData = async () => {
  const kpis = { promedio: 0, asistencia: 0, pagos: 0, mensajes: 0 };
  return simulateNetwork({ kpis, children: [], selected_child: null, grades_progress: [], attendance_calendar: [], quick_actions: [] });
};

export const getEstudianteDashboardData = async () => {
  const kpis = { promedio: 0, asistencia: 0, tareas: 0, competencias: 0 };
  return simulateNetwork({ kpis, grades_by_area: [], today_schedule: [], upcoming_tasks: [], upcoming_evaluations: [], achievements: [], quick_actions: [] });
};

// --- Users ---
export const getUsers = async (): Promise<GenericUser[]> => {
    // This would fetch all users. For now, returning empty as it was based on Firestore.
    // In a real implementation, you would populate mocks.students, mocks.staff, etc.
    return simulateNetwork([...mocks.students, ...mocks.staff, ...mocks.parents]);
};

export const getStudents = async (): Promise<any[]> => {
    return simulateNetwork(mocks.students);
};

// --- QR Scanner / Attendance ---
export const getAttendanceForToday = async () => {
    return simulateNetwork([]); // Return empty for now
}

export const recordAttendance = async (record: any) => {
    console.log("Simulating recording attendance:", record);
    // Here we would push the record to a mock array to simulate DB write
    return simulateNetwork(record);
}

// --- Tasks ---
export const getTasks = async (): Promise<Task[]> => {
    return simulateNetwork(mocks.tasks);
}

export const createTask = async (text: string, priority: Task['priority']): Promise<Task> => {
    const newTask: Task = { id: Date.now().toString(), text, priority, status: 'Pendiente', createdAt: new Date().toISOString() };
    mocks.tasks.unshift(newTask);
    return simulateNetwork(newTask);
};

export const toggleTaskStatus = async (taskId: string, currentStatus: Task['status']): Promise<Task | undefined> => {
    const newStatus = currentStatus === 'Completo' ? 'Pendiente' : 'Completo';
    const task = mocks.tasks.find(t => t.id === taskId) as Task | undefined;
    if(task) {
        task.status = newStatus;
    }
    return simulateNetwork(task);
};


// --- Other Modules ---
export const getCommunications = async () => simulateNetwork(mocks.communications);
export const getAutomaticNotifications = async () => simulateNetwork(mocks.automaticNotifications);
export const getFinancials = async () => simulateNetwork({ transactions: mocks.transactions, studentPayments: mocks.studentPayments });
export const getResources = async () => simulateNetwork(mocks.resources);
export const getLoans = async () => simulateNetwork(mocks.loans);
export const getActivityLogs = async () => simulateNetwork(mocks.activityLogs);
export const getRoles = async () => simulateNetwork({ roles: mocks.initialRoles, modules: mocks.permissionModules });
export const getMockActas = async () => simulateNetwork([
  {
    id: 'ACT-001',
    grade: 'Quinto Grado "A"',
    status: 'Pendiente de Aprobación',
    requestedBy: 'A. Barreto',
    date: '2025-07-28',
  },
  { id: 'ACT-002', grade: 'Sexto Grado "B"', status: 'Aprobado', requestedBy: 'F. Sotelo', date: '2025-07-25' },
  { id: 'ACT-003', grade: 'Quinto Grado "B"', status: 'Requiere Corrección', requestedBy: 'M. Gomez', date: '2025-07-22' },
]);
