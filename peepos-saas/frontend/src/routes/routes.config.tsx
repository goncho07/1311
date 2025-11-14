/**
 * ═══════════════════════════════════════════════════════════
 * ROUTES CONFIGURATION - Sistema completo de rutas por rol
 * ═══════════════════════════════════════════════════════════
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// ════════════════════════════════════════════════════════════
// LAZY LOADING DE COMPONENTES
// ════════════════════════════════════════════════════════════

// Layouts
const Layout = lazy(() => import('../../components/layout/Layout'));
const TeacherLayout = lazy(() => import('../../components/layout/TeacherLayout'));

// Auth
const LoginPage = lazy(() => import('../../pages/LoginPage'));

// Shared
const PlaceholderPage = lazy(() => import('../../pages/PlaceholderPage'));

// ════════════════════════════════════════════════════════════
// SUPERADMIN ROUTES
// ════════════════════════════════════════════════════════════

// Superadmin - Dashboard
const SuperadminDashboard = lazy(() => import('../pages/superadmin/Dashboard'));

// Superadmin - Gestión de Tenants
const TenantsListPage = lazy(() => import('../pages/superadmin/tenants/TenantsListPage'));
const TenantCreatePage = lazy(() => import('../pages/superadmin/tenants/TenantCreatePage'));
const TenantDetailPage = lazy(() => import('../pages/superadmin/tenants/TenantDetailPage'));

// Superadmin - Feature Flags
const FeatureFlagsPage = lazy(() => import('../pages/superadmin/FeatureFlagsPage'));

// Superadmin - Suscripciones
const SubscriptionsPage = lazy(() => import('../pages/superadmin/SubscriptionsPage'));

// Superadmin - Analytics
const AnalyticsPage = lazy(() => import('../pages/superadmin/AnalyticsPage'));

// Superadmin - Soporte
const SupportPage = lazy(() => import('../pages/superadmin/SupportPage'));
const TicketsPage = lazy(() => import('../pages/superadmin/TicketsPage'));
const LogsPage = lazy(() => import('../pages/superadmin/LogsPage'));

// Superadmin - Configuración Global
const GlobalConfigPage = lazy(() => import('../pages/superadmin/GlobalConfigPage'));

// ════════════════════════════════════════════════════════════
// DIRECTOR ROUTES
// ════════════════════════════════════════════════════════════

// Director - Dashboard
const DirectorDashboard = lazy(() => import('../../pages/Dashboard'));

// Director - PEEPOS STUDENTS (Gestión de Usuarios)
const UsersPage = lazy(() => import('../../pages/UsersPage'));
const EstudiantesPage = lazy(() => import('../../pages/EstudiantesPage_API_READY'));
const DocentesPage = lazy(() => import('../pages/director/DocentesPage'));
const ApoderadosPage = lazy(() => import('../pages/director/ApoderadosPage'));

// Director - PEEPOS ENROLL (Matrícula)
const MatriculaPage = lazy(() => import('../../pages/MatriculaPage'));
const MatriculaWizardPage = lazy(() => import('../pages/director/MatriculaWizardPage'));
const CuposPage = lazy(() => import('../pages/director/CuposPage'));

// Director - PEEPOS ACADEMIC
const AcademicoPage = lazy(() => import('../../pages/AcademicoPage'));
const AreasCurricularesPage = lazy(() => import('../pages/director/AreasCurricularesPage'));
const CompetenciasPage = lazy(() => import('../../pages/CompetenciasPonderacionesPage'));
const PeriodosAcademicosPage = lazy(() => import('../pages/director/PeriodosAcademicosPage'));
const CalendarioEvaluacionesPage = lazy(() => import('../pages/director/CalendarioEvaluacionesPage'));
const ReporteConsolidadoPage = lazy(() => import('../pages/director/ReporteConsolidadoPage'));

// Director - PEEPOS REPORTS
const ReportesPage = lazy(() => import('../../pages/ReportesPage'));
const ReportesAcademicosPage = lazy(() => import('../../pages/ReportesAcademicosPage'));
const ActasCertificadosPage = lazy(() => import('../../pages/ActasCertificadosPage'));
const SiagieReportsPage = lazy(() => import('../pages/director/SiagieReportsPage'));

// Director - PEEPOS PAY (Finanzas)
const FinanzasPage = lazy(() => import('../../pages/AdminFinanzasPage'));
const TransaccionesPage = lazy(() => import('../pages/director/finanzas/TransaccionesPage'));
const MorosidadPage = lazy(() => import('../pages/director/finanzas/MorosidadPage'));
const ConfigPagosPage = lazy(() => import('../pages/director/finanzas/ConfigPagosPage'));

// Director - PEEPOS CONNECT (Comunicaciones)
const ComunicacionesPage = lazy(() => import('../../pages/ComunicacionesPage'));
const EnvioMasivoPage = lazy(() => import('../pages/director/comunicaciones/EnvioMasivoPage'));
const ReunionesPage = lazy(() => import('../pages/director/comunicaciones/ReunionesPage'));
const EventosPage = lazy(() => import('../pages/director/comunicaciones/EventosPage'));

// Director - PEEPOS RESOURCES
const RecursosPage = lazy(() => import('../../pages/RecursosPage'));
const InventarioPage = lazy(() => import('../pages/director/recursos/InventarioPage'));
const BibliotecaPage = lazy(() => import('../pages/director/recursos/BibliotecaPage'));

// Director - PEEPOS SCHEDULE
const HorariosPage = lazy(() => import('../pages/director/horarios/HorariosPage'));
const GeneradorHorariosPage = lazy(() => import('../pages/director/horarios/GeneradorHorariosPage'));

// Director - PEEPOS ALERT
const AlertasPage = lazy(() => import('../pages/director/AlertasPage'));
const SeguimientoAlertasPage = lazy(() => import('../pages/director/SeguimientoAlertasPage'));

// Director - PEEPOS LEARN (Google Workspace)
const GoogleWorkspacePage = lazy(() => import('../pages/director/GoogleWorkspacePage'));
const ClassroomPage = lazy(() => import('../pages/director/google/ClassroomPage'));
const GoogleMeetPage = lazy(() => import('../pages/director/google/GoogleMeetPage'));
const GoogleDrivePage = lazy(() => import('../pages/director/google/GoogleDrivePage'));

// Director - PEEPOS WHATSAPP
const WhatsAppBotsPage = lazy(() => import('../pages/director/WhatsAppBotsPage'));

// Director - Configuración
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const ConfiguracionInstitucionalPage = lazy(() => import('../pages/director/ConfiguracionInstitucionalPage'));
const RolesPage = lazy(() => import('../../pages/RolesPage'));
const ActivityLogPage = lazy(() => import('../../pages/ActivityLogPage'));

// Director - Otros
const ConvivenciaPage = lazy(() => import('../../pages/ConvivenciaPage'));
const AsistenciaPage = lazy(() => import('../../pages/AsistenciaPage'));
const QRScannerPage = lazy(() => import('../../pages/QRScannerPage'));
const CalendarPage = lazy(() => import('../../pages/CalendarPage'));
const AyudaPage = lazy(() => import('../../pages/AyudaPage'));

// ════════════════════════════════════════════════════════════
// DOCENTE ROUTES
// ════════════════════════════════════════════════════════════

// Docente - Dashboard
const TeacherDashboard = lazy(() => import('../../pages/TeacherDashboard'));

// Docente - PEEPOS ATTEND (Asistencia)
const DocenteAsistenciaPage = lazy(() => import('../pages/docente/AsistenciaPage'));
const RegistrarAsistenciaPage = lazy(() => import('../pages/docente/RegistrarAsistenciaPage'));
const ReporteAsistenciaPage = lazy(() => import('../pages/docente/ReporteAsistenciaPage'));
const JustificacionesPage = lazy(() => import('../pages/docente/JustificacionesPage'));

// Docente - PEEPOS ACADEMIC (Evaluaciones)
const EvaluacionesPage = lazy(() => import('../../pages/EvaluacionesPage_API_READY'));
const RegistrarNotasPage = lazy(() => import('../../pages/RegistrarNotasPage'));
const LibroCalificacionesPage = lazy(() => import('../../pages/LibroCalificacionesPage'));
const MisEvaluacionesPage = lazy(() => import('../pages/docente/MisEvaluacionesPage'));
const BoletasGeneradasPage = lazy(() => import('../pages/docente/BoletasGeneradasPage'));

// Docente - Tareas Académicas
const TareasPage = lazy(() => import('../pages/docente/TareasPage'));
const CrearTareaPage = lazy(() => import('../pages/docente/CrearTareaPage'));
const RevisarEntregasPage = lazy(() => import('../pages/docente/RevisarEntregasPage'));

// Docente - PEEPOS TUTOR (Tutorías)
const TutoriaPage = lazy(() => import('../pages/docente/tutoria/TutoriaPage'));
const PlanTutoriaPage = lazy(() => import('../pages/docente/tutoria/PlanTutoriaPage'));
const SesionesTutoriaPage = lazy(() => import('../pages/docente/tutoria/SesionesTutoriaPage'));
const CasosTutoriaPage = lazy(() => import('../pages/docente/tutoria/CasosTutoriaPage'));

// Docente - Comunicaciones
const DocenteComunicacionesPage = lazy(() => import('../pages/docente/ComunicacionesPage'));
const EnviarComunicadoPage = lazy(() => import('../pages/docente/EnviarComunicadoPage'));
const ReunionesApoderadosPage = lazy(() => import('../pages/docente/ReunionesApoderadosPage'));

// Docente - Planificación Curricular
const PlanificacionPage = lazy(() => import('../pages/docente/PlanificacionPage'));
const SesionesAprendizajePage = lazy(() => import('../pages/docente/SesionesAprendizajePage'));

// Docente - Mi Horario
const MiHorarioDocentePage = lazy(() => import('../pages/docente/MiHorarioPage'));

// ════════════════════════════════════════════════════════════
// ESTUDIANTE ROUTES
// ════════════════════════════════════════════════════════════

// Estudiante - Dashboard
const EstudianteDashboard = lazy(() => import('../pages/estudiante/DashboardEstudiantePage'));

// Estudiante - Mis Notas
const MisNotasPage = lazy(() => import('../pages/estudiante/MisNotasPage'));

// Estudiante - Descargar Boleta
const BoletaPage = lazy(() => import('../pages/estudiante/BoletaPage'));

// Estudiante - Mis Tareas
const MisTareasPage = lazy(() => import('../pages/estudiante/MisTareasPage'));
const TareaDetailPage = lazy(() => import('../pages/estudiante/TareaDetailPage'));
const EntregarTareaPage = lazy(() => import('../pages/estudiante/EntregarTareaPage'));

// Estudiante - Mi Horario
const MiHorarioPage = lazy(() => import('../pages/estudiante/MiHorarioPage'));

// Estudiante - Mi Asistencia
const MiAsistenciaPage = lazy(() => import('../pages/estudiante/MiAsistenciaPage'));

// Estudiante - Próximas Evaluaciones
const ProximasEvaluacionesPage = lazy(() => import('../pages/estudiante/ProximasEvaluacionesPage'));

// Estudiante - Mi Perfil
const MiPerfilPage = lazy(() => import('../pages/estudiante/MiPerfilPage'));

// ════════════════════════════════════════════════════════════
// APODERADO ROUTES
// ════════════════════════════════════════════════════════════

// Apoderado - Dashboard
const ApoderadoDashboard = lazy(() => import('../../pages/ApoderadoDashboard'));

// Apoderado - Información Académica
const ApoderadoNotasPage = lazy(() => import('../pages/apoderado/NotasHijoPage'));
const ApoderadoBoletaPage = lazy(() => import('../pages/apoderado/BoletaHijoPage'));

// Apoderado - Asistencia de Mi Hijo
const ApoderadoAsistenciaPage = lazy(() => import('../pages/apoderado/AsistenciaHijoPage'));
const JustificarInasistenciaPage = lazy(() => import('../pages/apoderado/JustificarInasistenciaPage'));

// Apoderado - Comunicaciones
const ApoderadoComunicacionesPage = lazy(() => import('../pages/apoderado/ComunicacionesPage'));
const MensajesColegioPage = lazy(() => import('../pages/apoderado/MensajesColegioPage'));
const ReunionesApoderadoPage = lazy(() => import('../pages/apoderado/ReunionesPage'));

// Apoderado - Finanzas
const ApoderadoFinanzasPage = lazy(() => import('../pages/apoderado/finanzas/FinanzasPage'));
const EstadoCuentaPage = lazy(() => import('../pages/apoderado/finanzas/EstadoCuentaPage'));
const HistorialPagosPage = lazy(() => import('../pages/apoderado/finanzas/HistorialPagosPage'));
const PagarAhoraPage = lazy(() => import('../pages/apoderado/finanzas/PagarAhoraPage'));

// Apoderado - Horario de Mi Hijo
const HorarioHijoPage = lazy(() => import('../pages/apoderado/HorarioHijoPage'));

// Apoderado - Tareas de Mi Hijo
const TareasHijoPage = lazy(() => import('../pages/apoderado/TareasHijoPage'));

// ════════════════════════════════════════════════════════════
// RUTAS POR ROL
// ════════════════════════════════════════════════════════════

export const superadminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <SuperadminDashboard /> },

      // Gestión de Tenants
      { path: 'tenants', element: <TenantsListPage /> },
      { path: 'tenants/create', element: <TenantCreatePage /> },
      { path: 'tenants/:id', element: <TenantDetailPage /> },

      // Feature Flags
      { path: 'feature-flags', element: <FeatureFlagsPage /> },

      // Suscripciones
      { path: 'subscriptions', element: <SubscriptionsPage /> },

      // Analytics
      { path: 'analytics', element: <AnalyticsPage /> },

      // Soporte
      { path: 'support', element: <SupportPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'logs', element: <LogsPage /> },

      // Configuración Global
      { path: 'config', element: <GlobalConfigPage /> },
    ],
  },
];

export const directorRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DirectorDashboard /> },

      // PEEPOS STUDENTS
      { path: 'usuarios', element: <UsersPage /> },
      { path: 'estudiantes', element: <EstudiantesPage /> },
      { path: 'docentes', element: <DocentesPage /> },
      { path: 'apoderados', element: <ApoderadosPage /> },

      // PEEPOS ENROLL
      { path: 'matricula', element: <MatriculaPage /> },
      { path: 'matricula/wizard', element: <MatriculaWizardPage /> },
      { path: 'matricula/cupos', element: <CuposPage /> },

      // PEEPOS ACADEMIC
      { path: 'academico', element: <AcademicoPage /> },
      { path: 'academico/areas-curriculares', element: <AreasCurricularesPage /> },
      { path: 'academico/competencias', element: <CompetenciasPage /> },
      { path: 'academico/periodos', element: <PeriodosAcademicosPage /> },
      { path: 'academico/calendario-evaluaciones', element: <CalendarioEvaluacionesPage /> },
      { path: 'academico/consolidado', element: <ReporteConsolidadoPage /> },
      { path: 'academico/configuracion', element: <AcademicoPage /> },

      // PEEPOS REPORTS
      { path: 'reportes', element: <ReportesPage /> },
      { path: 'reportes/academicos', element: <ReportesAcademicosPage /> },
      { path: 'reportes/actas-certificados', element: <ActasCertificadosPage /> },
      { path: 'reportes/siagie', element: <SiagieReportsPage /> },

      // PEEPOS PAY
      { path: 'finanzas', element: <FinanzasPage /> },
      { path: 'finanzas/transacciones', element: <TransaccionesPage /> },
      { path: 'finanzas/morosidad', element: <MorosidadPage /> },
      { path: 'finanzas/configuracion', element: <ConfigPagosPage /> },

      // PEEPOS CONNECT
      { path: 'comunicaciones', element: <ComunicacionesPage /> },
      { path: 'comunicaciones/envio-masivo', element: <EnvioMasivoPage /> },
      { path: 'comunicaciones/reuniones', element: <ReunionesPage /> },
      { path: 'comunicaciones/eventos', element: <EventosPage /> },

      // PEEPOS RESOURCES
      { path: 'recursos', element: <RecursosPage /> },
      { path: 'recursos/inventario', element: <InventarioPage /> },
      { path: 'recursos/biblioteca', element: <BibliotecaPage /> },

      // PEEPOS SCHEDULE
      { path: 'horarios', element: <HorariosPage /> },
      { path: 'horarios/generador', element: <GeneradorHorariosPage /> },

      // PEEPOS ALERT
      { path: 'alertas', element: <AlertasPage /> },
      { path: 'alertas/seguimiento', element: <SeguimientoAlertasPage /> },

      // PEEPOS LEARN
      { path: 'google-workspace', element: <GoogleWorkspacePage /> },
      { path: 'google-workspace/classroom', element: <ClassroomPage /> },
      { path: 'google-workspace/meet', element: <GoogleMeetPage /> },
      { path: 'google-workspace/drive', element: <GoogleDrivePage /> },

      // PEEPOS WHATSAPP
      { path: 'whatsapp', element: <WhatsAppBotsPage /> },

      // Asistencia
      { path: 'asistencia', element: <AsistenciaPage /> },
      { path: 'asistencia/scan', element: <QRScannerPage /> },

      // Convivencia
      { path: 'convivencia', element: <ConvivenciaPage /> },

      // Calendario
      { path: 'calendario', element: <CalendarPage /> },

      // Configuración
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/institucion', element: <ConfiguracionInstitucionalPage /> },
      { path: 'settings/roles', element: <RolesPage /> },
      { path: 'settings/activity-log', element: <ActivityLogPage /> },

      // Ayuda
      { path: 'ayuda', element: <AyudaPage /> },
    ],
  },
];

export const docenteRoutes: RouteObject[] = [
  {
    path: '/',
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboard /> },

      // PEEPOS ATTEND
      { path: 'asistencia', element: <DocenteAsistenciaPage /> },
      { path: 'asistencia/registrar', element: <RegistrarAsistenciaPage /> },
      { path: 'asistencia/reporte', element: <ReporteAsistenciaPage /> },
      { path: 'asistencia/justificaciones', element: <JustificacionesPage /> },

      // PEEPOS ACADEMIC
      { path: 'evaluaciones', element: <EvaluacionesPage /> },
      { path: 'evaluaciones/registrar-notas', element: <RegistrarNotasPage /> },
      { path: 'evaluaciones/libro-calificaciones', element: <LibroCalificacionesPage /> },
      { path: 'evaluaciones/mis-evaluaciones', element: <MisEvaluacionesPage /> },
      { path: 'evaluaciones/boletas', element: <BoletasGeneradasPage /> },

      // Tareas
      { path: 'tareas', element: <TareasPage /> },
      { path: 'tareas/crear', element: <CrearTareaPage /> },
      { path: 'tareas/:id/entregas', element: <RevisarEntregasPage /> },

      // PEEPOS TUTOR
      { path: 'tutoria', element: <TutoriaPage /> },
      { path: 'tutoria/plan', element: <PlanTutoriaPage /> },
      { path: 'tutoria/sesiones', element: <SesionesTutoriaPage /> },
      { path: 'tutoria/casos', element: <CasosTutoriaPage /> },

      // Comunicaciones
      { path: 'comunicaciones', element: <DocenteComunicacionesPage /> },
      { path: 'comunicaciones/enviar', element: <EnviarComunicadoPage /> },
      { path: 'comunicaciones/reuniones', element: <ReunionesApoderadosPage /> },

      // Planificación
      { path: 'planificacion', element: <PlanificacionPage /> },
      { path: 'planificacion/sesiones', element: <SesionesAprendizajePage /> },

      // Mi Horario
      { path: 'mi-horario', element: <MiHorarioDocentePage /> },
    ],
  },
];

export const estudianteRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <EstudianteDashboard /> },

      // Mis Notas
      { path: 'mis-notas', element: <MisNotasPage /> },

      // Descargar Boleta
      { path: 'boleta', element: <BoletaPage /> },

      // Mis Tareas
      { path: 'mis-tareas', element: <MisTareasPage /> },
      { path: 'mis-tareas/:id', element: <TareaDetailPage /> },
      { path: 'mis-tareas/:id/entregar', element: <EntregarTareaPage /> },

      // Mi Horario
      { path: 'mi-horario', element: <MiHorarioPage /> },

      // Mi Asistencia
      { path: 'mi-asistencia', element: <MiAsistenciaPage /> },

      // Próximas Evaluaciones
      { path: 'evaluaciones', element: <ProximasEvaluacionesPage /> },

      // Mi Perfil
      { path: 'mi-perfil', element: <MiPerfilPage /> },
    ],
  },
];

export const apoderadoRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ApoderadoDashboard /> },

      // Información Académica
      { path: 'notas', element: <ApoderadoNotasPage /> },
      { path: 'boleta', element: <ApoderadoBoletaPage /> },

      // Asistencia
      { path: 'asistencia', element: <ApoderadoAsistenciaPage /> },
      { path: 'asistencia/justificar', element: <JustificarInasistenciaPage /> },

      // Comunicaciones
      { path: 'comunicaciones', element: <ApoderadoComunicacionesPage /> },
      { path: 'mensajes', element: <MensajesColegioPage /> },
      { path: 'reuniones', element: <ReunionesApoderadoPage /> },

      // Finanzas
      { path: 'finanzas', element: <ApoderadoFinanzasPage /> },
      { path: 'finanzas/estado-cuenta', element: <EstadoCuentaPage /> },
      { path: 'finanzas/historial', element: <HistorialPagosPage /> },
      { path: 'finanzas/pagar', element: <PagarAhoraPage /> },

      // Horario
      { path: 'horario', element: <HorarioHijoPage /> },

      // Tareas
      { path: 'tareas', element: <TareasHijoPage /> },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════

export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
];
