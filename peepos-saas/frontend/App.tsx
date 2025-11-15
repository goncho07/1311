import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './src/components/error';
import ToastProvider from './src/components/providers/ToastProvider';
import Layout from './components/layout/Layout';
import TeacherLayout from './components/layout/TeacherLayout';

// Auth
import LoginPage from './pages/LoginPage';

// Dashboards
import Dashboard from './pages/Dashboard';
import ApoderadoDashboard from './pages/ApoderadoDashboard';
import EstudianteDashboard from './src/pages/estudiante/DashboardEstudiantePage';

// Director Pages
import UsersPage from './pages/UsersPage';
import MatriculaPage from './pages/MatriculaPage';
import AcademicoPage from './pages/AcademicoPage';
import ComunicacionesPage from './pages/ComunicacionesPage';
import ReportesPage from './pages/ReportesPage';
import RecursosPage from './pages/RecursosPage';
import AdminFinanzasPage from './pages/AdminFinanzasPage';
import AyudaPage from './pages/AyudaPage';
import QRScannerPage from './pages/QRScannerPage';
import AvanceDocentesPage from './pages/AvanceDocentesPage';
import MonitoreoCursosPage from './pages/MonitoreoCursosPage';
import MonitoreoEstudiantesPage from './pages/MonitoreoEstudiantesPage';
import ActasCertificadosPage from './pages/ActasCertificadosPage';
import ReportesAcademicosPage from './pages/ReportesAcademicosPage';
import ConfiguracionAcademicaPage from './pages/ConfiguracionAcademicaPage';
import ConvivenciaPage from './pages/ConvivenciaPage';
import SettingsPage from './pages/SettingsPage';
import RolesPage from './pages/RolesPage';
import ActivityLogPage from './pages/ActivityLogPage';
import CalendarPage from './pages/CalendarPage';
import AsistenciaPage from './pages/AsistenciaPage';
import CompetenciasPonderacionesPage from './pages/CompetenciasPonderacionesPage';
import PlaceholderPage from './pages/PlaceholderPage';

// Docente Pages
import DashboardDocentePage from './src/pages/docente/DashboardDocentePage';
// PEEPOS ATTEND
import RegistrarAsistenciaPage from './src/pages/docente/asistencia/RegistrarAsistenciaPage';
import ReporteAsistenciaPage from './src/pages/docente/asistencia/ReporteAsistenciaPage';
import JustificacionesPage from './src/pages/docente/asistencia/JustificacionesPage';
// PEEPOS ACADEMIC
import RegistrarNotasDocentePage from './src/pages/docente/evaluaciones/RegistrarNotasPage';
import LibroCalificacionesDocentePage from './src/pages/docente/evaluaciones/LibroCalificacionesPage';
// Tareas
import MisTareasDocentePage from './src/pages/docente/tareas/MisTareasPage';
import CrearTareaPage from './src/pages/docente/tareas/CrearTareaPage';
import RevisarEntregasPage from './src/pages/docente/tareas/RevisarEntregasPage';
// PEEPOS TUTOR
import PlanTutoriaPage from './src/pages/docente/tutoria/PlanTutoriaPage';
import SesionesTutoriaPage from './src/pages/docente/tutoria/SesionesTutoriaPage';
import CasosTutoriaPage from './src/pages/docente/tutoria/CasosTutoriaPage';
// Comunicaciones
import EnviarComunicadoPage from './src/pages/docente/comunicaciones/EnviarComunicadoPage';
// Planificación
import SesionesAprendizajePage from './src/pages/docente/planificacion/SesionesAprendizajePage';
// Horario
import MiHorarioDocentePage from './src/pages/docente/horario/MiHorarioDocentePage';

// Old import for compatibility
import EvaluacionesPage from './pages/EvaluacionesPage_API_READY';

// Estudiante Pages
import MisNotasPage from './src/pages/estudiante/MisNotasPage';
import MiAsistenciaPage from './src/pages/estudiante/MiAsistenciaPage';
import MiHorarioPage from './src/pages/estudiante/MiHorarioPage';
import MisTareasPage from './src/pages/estudiante/MisTareasPage';
import TareaDetailPage from './src/pages/estudiante/TareaDetailPage';
import ProximasEvaluacionesPage from './src/pages/estudiante/ProximasEvaluacionesPage';
import BoletaPage from './src/pages/estudiante/BoletaPage';
import MiPerfilPage from './src/pages/estudiante/MiPerfilPage';

// Icons
import {
  ClipboardCheck, Users, FileText, Calendar as CalendarIcon,
  DollarSign, MessageSquare, Package, AlertTriangle,
  BookOpen, Video, Bot, Settings as SettingsIcon,
  BarChart, Ticket, Database
} from 'lucide-react';

// Store
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { useSettingsStore } from './store/settingsStore';

// Crear instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// ════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ════════════════════════════════════════════════════════════

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// SUPERADMIN ROUTES
// ════════════════════════════════════════════════════════════

const SuperadminRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {/* Gestión de Tenants */}
      <Route path="/tenants" element={<PlaceholderPage title="Gestión de Tenants (Colegios)" description="Administra todos los colegios registrados en el SaaS" icon={Users} />} />
      <Route path="/tenants/create" element={<PlaceholderPage title="Crear Nuevo Colegio" description="Registrar un nuevo colegio en la plataforma" icon={Users} />} />

      {/* Feature Flags */}
      <Route path="/feature-flags" element={<PlaceholderPage title="Feature Flags (Módulos Habilitables)" description="Habilitar o deshabilitar módulos por tenant" icon={SettingsIcon} />} />

      {/* Suscripciones */}
      <Route path="/subscriptions" element={<PlaceholderPage title="Gestión de Suscripciones" description="Administrar planes y pagos de colegios" icon={DollarSign} />} />

      {/* Analytics */}
      <Route path="/analytics" element={<PlaceholderPage title="Analytics del SaaS" description="Métricas de crecimiento, MRR, churn rate" icon={BarChart} />} />

      {/* Soporte */}
      <Route path="/support" element={<PlaceholderPage title="Sistema de Soporte" description="Tickets y chat con administradores" icon={Ticket} />} />
      <Route path="/logs" element={<PlaceholderPage title="Logs del Sistema" description="Auditoría y monitoreo de errores" icon={Database} />} />

      {/* Configuración Global */}
      <Route path="/config" element={<SettingsPage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Layout>
);

// ════════════════════════════════════════════════════════════
// DIRECTOR ROUTES
// ════════════════════════════════════════════════════════════

const DirectorRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {/* PEEPOS STUDENTS - Gestión de Usuarios */}
      <Route path="/usuarios" element={<UsersPage />} />
      <Route path="/estudiantes" element={<UsersPage />} />
      <Route path="/docentes" element={<PlaceholderPage title="Gestión de Docentes" description="CRUD de docentes, asignar áreas y secciones" icon={Users} />} />
      <Route path="/apoderados" element={<PlaceholderPage title="Gestión de Apoderados" description="Administrar apoderados y vincular estudiantes" icon={Users} />} />

      {/* PEEPOS ENROLL - Matrícula */}
      <Route path="/matricula" element={<MatriculaPage />} />
      <Route path="/matricula/wizard" element={<PlaceholderPage title="Wizard de Matrícula" description="Proceso de matrícula en 3 pasos" icon={ClipboardCheck} />} />
      <Route path="/matricula/cupos" element={<PlaceholderPage title="Gestión de Cupos" description="Configurar vacantes por grado y sección" icon={ClipboardCheck} />} />

      {/* PEEPOS ACADEMIC - Gestión Académica */}
      <Route path="/academico" element={<AcademicoPage />} />
      <Route path="/academico/areas-curriculares" element={<PlaceholderPage title="Áreas Curriculares" description="CRUD de áreas según MINEDU" icon={BookOpen} />} />
      <Route path="/academico/competencias" element={<CompetenciasPonderacionesPage />} />
      <Route path="/academico/periodos" element={<PlaceholderPage title="Periodos Académicos" description="Configurar año escolar, bimestres/trimestres" icon={CalendarIcon} />} />
      <Route path="/academico/calendario-evaluaciones" element={<PlaceholderPage title="Calendario de Evaluaciones" description="Calendario institucional de evaluaciones" icon={CalendarIcon} />} />
      <Route path="/academico/consolidado" element={<PlaceholderPage title="Reporte Consolidado" description="Consolidado de evaluaciones institucionales" icon={FileText} />} />
      <Route path="/academico/avance-docentes" element={<AvanceDocentesPage />} />
      <Route path="/academico/monitoreo-cursos" element={<MonitoreoCursosPage />} />
      <Route path="/academico/monitoreo-estudiantes" element={<MonitoreoEstudiantesPage />} />
      <Route path="/academico/actas-certificados" element={<ActasCertificadosPage />} />
      <Route path="/academico/reportes-descargas" element={<ReportesAcademicosPage />} />
      <Route path="/academico/configuracion" element={<ConfiguracionAcademicaPage />} />

      {/* PEEPOS REPORTS - Reportes Oficiales */}
      <Route path="/reportes" element={<ReportesPage />} />
      <Route path="/reportes/siagie" element={<PlaceholderPage title="Reportes SIAGIE" description="Generación de reportes formato MINEDU" icon={FileText} />} />

      {/* PEEPOS PAY - Gestión Financiera */}
      <Route path="/finanzas" element={<AdminFinanzasPage />} />
      <Route path="/finanzas/transacciones" element={<PlaceholderPage title="Transacciones" description="Registro de ingresos y egresos" icon={DollarSign} />} />
      <Route path="/finanzas/morosidad" element={<PlaceholderPage title="Reporte de Morosidad" description="Estudiantes con deuda y cobranza" icon={DollarSign} />} />
      <Route path="/finanzas/configuracion" element={<PlaceholderPage title="Configuración de Pagos" description="Conceptos y precios por nivel" icon={SettingsIcon} />} />

      {/* PEEPOS CONNECT - Comunicaciones */}
      <Route path="/comunicaciones" element={<ComunicacionesPage />} />
      <Route path="/comunicaciones/envio-masivo" element={<PlaceholderPage title="Envío Masivo de Mensajes" description="WhatsApp/Email a apoderados" icon={MessageSquare} />} />
      <Route path="/comunicaciones/reuniones" element={<PlaceholderPage title="Reuniones con Apoderados" description="Programar y gestionar reuniones" icon={CalendarIcon} />} />
      <Route path="/comunicaciones/eventos" element={<PlaceholderPage title="Eventos Escolares" description="Crear y notificar eventos" icon={CalendarIcon} />} />

      {/* PEEPOS RESOURCES - Recursos Institucionales */}
      <Route path="/recursos" element={<RecursosPage />} />
      <Route path="/recursos/inventario" element={<PlaceholderPage title="Inventario" description="Gestión de bienes patrimoniales" icon={Package} />} />
      <Route path="/recursos/biblioteca" element={<PlaceholderPage title="Biblioteca" description="Catálogo de libros y préstamos" icon={BookOpen} />} />

      {/* PEEPOS SCHEDULE - Horarios con IA */}
      <Route path="/horarios" element={<PlaceholderPage title="Gestión de Horarios" description="Lista de horarios por grado/sección" icon={CalendarIcon} />} />
      <Route path="/horarios/generador" element={<PlaceholderPage title="Generador de Horarios IA" description="Generación automática con inteligencia artificial" icon={CalendarIcon} />} />

      {/* PEEPOS ALERT - Alertas Tempranas */}
      <Route path="/alertas" element={<PlaceholderPage title="Alertas Tempranas" description="Estudiantes en riesgo académico" icon={AlertTriangle} />} />

      {/* PEEPOS LEARN - Google Workspace */}
      <Route path="/google-workspace" element={<PlaceholderPage title="Google Workspace" description="Integración con Classroom, Meet, Drive" icon={Video} />} />

      {/* PEEPOS WHATSAPP - Bots */}
      <Route path="/whatsapp" element={<PlaceholderPage title="Gestión de Bots WhatsApp" description="Configurar bots por nivel educativo" icon={Bot} />} />

      {/* Asistencia */}
      <Route path="/asistencia" element={<AsistenciaPage />} />
      <Route path="/asistencia/scan" element={<QRScannerPage />} />

      {/* Convivencia */}
      <Route path="/convivencia" element={<ConvivenciaPage />} />

      {/* Calendario */}
      <Route path="/calendario" element={<CalendarPage />} />

      {/* Configuración */}
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/roles" element={<RolesPage />} />
      <Route path="/settings/activity-log" element={<ActivityLogPage />} />

      {/* Ayuda */}
      <Route path="/ayuda" element={<AyudaPage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Layout>
);

// ════════════════════════════════════════════════════════════
// DOCENTE ROUTES
// ════════════════════════════════════════════════════════════

const TeacherRoutes = () => (
  <TeacherLayout>
    <Routes>
      <Route path="/" element={<DashboardDocentePage />} />
      <Route path="/dashboard-docente" element={<DashboardDocentePage />} />

      {/* PEEPOS ATTEND - Asistencia */}
      <Route path="/asistencia/registrar" element={<RegistrarAsistenciaPage />} />
      <Route path="/asistencia/reporte" element={<ReporteAsistenciaPage />} />
      <Route path="/asistencia/justificaciones" element={<JustificacionesPage />} />

      {/* PEEPOS ACADEMIC - Evaluaciones */}
      <Route path="/evaluaciones" element={<EvaluacionesPage />} />
      <Route path="/evaluaciones/registrar-notas" element={<RegistrarNotasDocentePage />} />
      <Route path="/evaluaciones/libro-calificaciones" element={<LibroCalificacionesDocentePage />} />
      <Route path="/evaluaciones/boletas" element={<PlaceholderPage title="Boletas Generadas" description="Ver boletas de mis secciones" icon={FileText} />} />

      {/* Tareas Académicas */}
      <Route path="/tareas" element={<MisTareasDocentePage />} />
      <Route path="/tareas/crear" element={<CrearTareaPage />} />
      <Route path="/tareas/:tareaId/editar" element={<CrearTareaPage />} />
      <Route path="/tareas/:tareaId/entregas" element={<RevisarEntregasPage />} />

      {/* PEEPOS TUTOR - Tutorías */}
      <Route path="/tutoria" element={<PlanTutoriaPage />} />
      <Route path="/tutoria/plan" element={<PlanTutoriaPage />} />
      <Route path="/tutoria/sesiones" element={<SesionesTutoriaPage />} />
      <Route path="/tutoria/casos" element={<CasosTutoriaPage />} />

      {/* Comunicaciones */}
      <Route path="/comunicaciones" element={<EnviarComunicadoPage />} />
      <Route path="/comunicaciones/enviar" element={<EnviarComunicadoPage />} />

      {/* Planificación */}
      <Route path="/planificacion" element={<SesionesAprendizajePage />} />
      <Route path="/planificacion/sesiones" element={<SesionesAprendizajePage />} />

      {/* Mi Horario */}
      <Route path="/mi-horario" element={<MiHorarioDocentePage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </TeacherLayout>
);

// ════════════════════════════════════════════════════════════
// ESTUDIANTE ROUTES
// ════════════════════════════════════════════════════════════

const EstudianteRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<EstudianteDashboard />} />

      {/* Mis Notas */}
      <Route path="/mis-notas" element={<MisNotasPage />} />

      {/* Descargar Boleta */}
      <Route path="/boleta" element={<BoletaPage />} />

      {/* Mis Tareas */}
      <Route path="/mis-tareas" element={<MisTareasPage />} />
      <Route path="/mis-tareas/:id" element={<TareaDetailPage />} />

      {/* Mi Horario */}
      <Route path="/mi-horario" element={<MiHorarioPage />} />

      {/* Mi Asistencia */}
      <Route path="/mi-asistencia" element={<MiAsistenciaPage />} />

      {/* Próximas Evaluaciones */}
      <Route path="/evaluaciones" element={<ProximasEvaluacionesPage />} />

      {/* Mi Perfil */}
      <Route path="/mi-perfil" element={<MiPerfilPage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Layout>
);

// ════════════════════════════════════════════════════════════
// APODERADO ROUTES
// ════════════════════════════════════════════════════════════

const ApoderadoRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<ApoderadoDashboard />} />

      {/* Información Académica */}
      <Route path="/notas" element={<PlaceholderPage title="Notas de Mi Hijo" description="Ver calificaciones por área" icon={FileText} />} />
      <Route path="/boleta" element={<PlaceholderPage title="Descargar Boleta" description="Boleta oficial en PDF" icon={FileText} />} />

      {/* Asistencia */}
      <Route path="/asistencia" element={<PlaceholderPage title="Asistencia de Mi Hijo" description="Calendario mensual de asistencia" icon={ClipboardCheck} />} />
      <Route path="/asistencia/justificar" element={<PlaceholderPage title="Justificar Inasistencia" description="Enviar justificación con documento" icon={ClipboardCheck} />} />

      {/* Comunicaciones */}
      <Route path="/comunicaciones" element={<PlaceholderPage title="Comunicaciones" description="Mensajes y reuniones" icon={MessageSquare} />} />
      <Route path="/mensajes" element={<PlaceholderPage title="Mensajes del Colegio" description="Inbox de comunicaciones" icon={MessageSquare} />} />
      <Route path="/reuniones" element={<PlaceholderPage title="Reuniones Programadas" description="Confirmar asistencia" icon={CalendarIcon} />} />

      {/* Finanzas (solo colegios privados) */}
      <Route path="/finanzas" element={<PlaceholderPage title="Finanzas" description="Estado de cuenta y pagos" icon={DollarSign} />} />
      <Route path="/finanzas/historial" element={<PlaceholderPage title="Historial de Pagos" description="Recibos y comprobantes" icon={DollarSign} />} />

      {/* Horario */}
      <Route path="/horario" element={<PlaceholderPage title="Horario de Mi Hijo" description="Horario semanal completo" icon={CalendarIcon} />} />

      {/* Tareas */}
      <Route path="/tareas" element={<PlaceholderPage title="Tareas de Mi Hijo" description="Ver tareas asignadas" icon={ClipboardCheck} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Layout>
);

// ════════════════════════════════════════════════════════════
// APP COMPONENT
// ════════════════════════════════════════════════════════════

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { setTheme } = useUIStore();
  const { uiFontFamily } = useSettingsStore();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [setTheme]);

  useEffect(() => {
    const fontMap: { [key: string]: string } = {
        'System Default': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        'Poppins': "'Poppins', sans-serif",
        'Inter': "'Inter', sans-serif",
        'Roboto': "'Roboto', sans-serif",
        'Nunito Sans': "'Nunito Sans', sans-serif",
    };
    const fontFamily = fontMap[uiFontFamily] || fontMap['Poppins'];
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.body.dataset.font = uiFontFamily;
  }, [uiFontFamily]);

  let appContent;
  if (!isAuthenticated) {
    appContent = (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  } else {
    // Enrutamiento basado en rol
    switch (user?.role) {
      case 'superadmin':
        appContent = <SuperadminRoutes />;
        break;
      case 'director':
        appContent = <DirectorRoutes />;
        break;
      case 'docente':
        appContent = <TeacherRoutes />;
        break;
      case 'apoderado':
        appContent = <ApoderadoRoutes />;
        break;
      case 'estudiante':
        appContent = <EstudianteRoutes />;
        break;
      default:
        appContent = <DirectorRoutes />; // Fallback
    }
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingFallback />}>
          {appContent}
        </Suspense>
        <ToastProvider />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
