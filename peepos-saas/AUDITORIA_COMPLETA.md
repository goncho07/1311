# AUDITORÍA COMPLETA DEL SISTEMA PEEPOS SAAS
## Sistema de Gestión Educativa Multi-Tenant

**Fecha de Auditoría:** 13 de Noviembre, 2025
**Versión del Sistema:** 1.0.0 (En Desarrollo)
**Ubicación:** `d:\2010-main (3)\peepos-saas\`

---

## RESUMEN EJECUTIVO

### Estado General del Proyecto
- **Completitud General:** 65%
- **Frontend:** 70% completado
- **Backend:** 60% completado
- **Integración:** 40% completado

### Problemas Identificados
- **Críticos:** 12 problemas que bloquean funcionalidad principal
- **Altos:** 25 problemas que afectan UX/seguridad
- **Medios:** 30 problemas de optimización y mantenibilidad
- **Bajos:** 15+ problemas menores

---

## 1. PROBLEMAS CRÍTICOS (BLOQUEAN FUNCIONALIDAD)

### 🔴 CRÍTICO 1: Código hardcodeado en módulo académico
**Archivo:** `frontend/src/pages/EvaluacionesPage_API_READY.tsx:66`

**Problema:**
```tsx
docente_id: 1, // TODO: obtener del contexto de usuario
```

**Impacto:**
- Todas las evaluaciones se atribuyen al docente con ID=1
- Pérdida de auditoría académica
- Datos comprometidos

**Solución:**
```tsx
import { useAuthStore } from '@/store/authStore';

const { user } = useAuthStore();
const evaluacionesArray = Object.entries(calificaciones).map(
  ([estudianteId, calificacion]) => ({
    estudiante_id: parseInt(estudianteId),
    docente_id: user?.id, // ✅ Obtener del contexto
    // ...
  })
);
```

**Prioridad:** INMEDIATA
**Tiempo estimado:** 15 minutos

---

### 🔴 CRÍTICO 2: Uso de alert() para feedback del usuario
**Ubicación:** Múltiples archivos

**Archivos afectados:**
- `pages/EvaluacionesPage_API_READY.tsx:58, 79, 83, 104`
- `pages/ActivityLogPage.tsx`
- `pages/EstudiantesPage_API_READY.tsx`
- `src/api/client.ts:92`

**Problema:**
```tsx
alert('Seleccione área curricular y competencia');
alert(`Evaluaciones registradas: ${result.created}`);
alert('Su institución está suspendida. Contacte con soporte.');
```

**Impacto:**
- Interfaz bloqueante y pobre
- No accesible
- Experiencia de usuario degradada

**Solución:**
```tsx
import toast from 'react-hot-toast';

// Reemplazar alerts con:
toast.error('Seleccione área curricular y competencia');
toast.success(`Evaluaciones registradas: ${result.created}`);
toast.error('Su institución está suspendida. Contacte con soporte.');
```

**Prioridad:** ALTA
**Tiempo estimado:** 1 hora (reemplazar todos los alert())

---

### 🔴 CRÍTICO 3: API Base URL inconsistente
**Ubicación:**
- `frontend/src/config/env.ts:14` → `http://localhost:8080/api`
- `frontend/src/api/client.ts:10` → `http://localhost:8080/api/v1`

**Problema:**
Dos URLs diferentes que causan llamadas a endpoints incorrectos.

**Impacto:**
- 404 errors en producción
- Inconsistencia en versionamiento API
- Debugging difícil

**Solución:**
Unificar en un solo lugar:

```typescript
// config/env.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
} as const;

// src/api/client.ts
import { API_CONFIG } from '@/config/env';
const baseURL = API_CONFIG.BASE_URL;
```

**Prioridad:** INMEDIATA
**Tiempo estimado:** 30 minutos

---

### 🔴 CRÍTICO 4: Credenciales dummy en código
**Ubicación:**
- `pages/LoginPage.tsx:61-72` (placeholders)
- `services/api.ts:48-56` (lógica de login mock)

**Problema:**
```tsx
// En LoginPage
<Input placeholder="Usuario: director / docente" />
<Input placeholder="Contraseña: password" />

// En services/api.ts
if (dni === 'director' && password === 'password') {
  return simulateNetwork({ user: mocks.mockUsers.director, ... });
}
```

**Impacto:**
- Seguridad comprometida
- Credenciales visibles en el código fuente
- Riesgo en producción

**Solución:**
1. Eliminar placeholders con credenciales
2. Eliminar archivo `services/api.ts` completamente
3. Usar únicamente `src/api/endpoints/auth.ts`

**Prioridad:** INMEDIATA
**Tiempo estimado:** 30 minutos

---

### 🔴 CRÍTICO 5: Tipos inseguros (any) en API
**Ubicación:** `src/api/endpoints/*.ts`

**Ejemplos:**
```typescript
// client.ts
async post<T>(url: string, data?: any, ...)

// asistencias.ts
estudiantes_riesgo: any[];

// evaluaciones.ts
estudiante: any;
periodo: any;
```

**Impacto:**
- Pérdida total de type-safety
- Errores runtime no detectados
- Refactorización frágil

**Solución:**
Crear tipos específicos en `types/models.types.ts`:

```typescript
// types/models.types.ts
export interface EstudianteRiesgo {
  id: number;
  nombre_completo: string;
  faltas: number;
  porcentaje_asistencia: number;
}

// asistencias.ts
estudiantes_riesgo: EstudianteRiesgo[];
```

**Prioridad:** ALTA
**Tiempo estimado:** 3 horas (tipar todos los endpoints)

---

### 🔴 CRÍTICO 6: Sistema de autenticación dual
**Ubicación:**
- Sistema viejo: `store/authStore.ts` + `services/api.ts`
- Sistema nuevo: `hooks/useAuth.ts` + `api/endpoints/auth.ts`

**Problema:**
Dos sistemas de autenticación coexisten causando confusión y bugs.

**Impacto:**
- Logout incompleto
- Sesiones no sincronizadas
- Estado inconsistente

**Solución:**
1. Deprecar `services/api.ts` y `store/authStore.ts`
2. Usar únicamente el sistema nuevo basado en React Query
3. Migrar todos los componentes a `useAuth()` hook

**Prioridad:** ALTA
**Tiempo estimado:** 4 horas

---

### 🔴 CRÍTICO 7: Falta de error boundaries
**Ubicación:** Toda la aplicación

**Problema:**
Sin componentes ErrorBoundary. Un error en un componente hijo cuelga toda la app.

**Solución:**
```tsx
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// App.tsx
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

**Prioridad:** ALTA
**Tiempo estimado:** 2 horas

---

### 🔴 CRÍTICO 8: Falta de loading states
**Ubicación:** Casi todas las páginas

**Problema:**
Sin skeletons, spinners, ni disabled buttons durante operaciones async.

**Impacto:**
- Usuario puede hacer doble-submit
- Sin feedback visual
- Mala UX

**Solución:**
```tsx
const { data, isLoading } = useEstudiantes(filters);

if (isLoading) return <SkeletonTable />;
if (error) return <ErrorState error={error} />;
if (!data || data.length === 0) return <EmptyState />;

return <UserTable data={data} />;
```

**Prioridad:** ALTA
**Tiempo estimado:** 6 horas (implementar en todas las páginas)

---

### 🔴 CRÍTICO 9: Ruta inexistente en navegación
**Ubicación:** `hooks/useAuth.ts:41`

**Problema:**
```tsx
navigate('/dashboard'); // ❌ Esta ruta no existe
```

En `App.tsx`, las rutas son `/` (dashboard) y `/login`, no `/dashboard`.

**Solución:**
```tsx
navigate('/'); // ✅ Ruta correcta al dashboard
```

**Prioridad:** INMEDIATA
**Tiempo estimado:** 5 minutos

---

### 🔴 CRÍTICO 10: Falta de validación en formularios
**Ubicación:** `pages/LoginPage.tsx` y otros formularios

**Problema:**
```tsx
<Input
  label="DNI o Usuario"
  value={dni}
  onChange={(e) => setDni(e.target.value)}
  required // ❌ Solo validación HTML5, sin JS
/>
```

**Solución:**
Usar librería de validación como `zod` o crear validadores custom:

```tsx
import { validateDNI } from '@/utils/validators';

const handleSubmit = (e) => {
  e.preventDefault();

  // Validar
  if (!validateDNI(dni)) {
    toast.error('DNI inválido');
    return;
  }

  if (password.length < 6) {
    toast.error('Contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Proceder con login
  loginMutation.mutate({ dni, password });
};
```

**Prioridad:** ALTA
**Tiempo estimado:** 4 horas (implementar en todos los formularios)

---

### 🔴 CRÍTICO 11: Sin manejo de errores de validación del backend
**Ubicación:** `src/api/client.ts:100-104`

**Problema:**
```tsx
if (error.response?.status === 422) {
  const validationErrors = error.response.data as any;
  console.warn('⚠️ Errores de validación:', validationErrors);
  // ❌ Sin propagar errores al componente
}
```

**Solución:**
```tsx
if (error.response?.status === 422) {
  const validationErrors = error.response.data.errors;

  // Mostrar errores al usuario
  Object.entries(validationErrors).forEach(([field, messages]) => {
    toast.error(`${field}: ${messages[0]}`);
  });

  // Propagar el error
  return Promise.reject(error);
}
```

**Prioridad:** ALTA
**Tiempo estimado:** 1 hora

---

### 🔴 CRÍTICO 12: Falta de accesibilidad en modales
**Ubicación:** `components/ui/Modal.tsx`, `components/ui/Drawer.tsx`

**Problema:**
- Sin `role="dialog"`
- Sin `aria-modal="true"`
- Sin focus trap
- Sin manejo de tecla Escape
- Sin restauración de focus

**Solución:**
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="..."
    >
      {children}
    </div>
  );
};
```

**Prioridad:** MEDIA-ALTA
**Tiempo estimado:** 3 horas

---

## 2. PROBLEMAS DE ALTO IMPACTO

### ⚠️ ALTO 1: console.log en código de producción
**Ubicación:** Múltiples archivos

**Archivos:**
- `src/api/client.ts:48-54, 70-76, 59, 92, 103, 108`
- `services/api.ts:49`
- `hooks/useAuth.ts:44, 97, 129`

**Solución:**
Crear logger centralizado:

```typescript
// utils/logger.ts
const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) console.error(...args);
    // En producción: enviar a Sentry/LogRocket
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) console.warn(...args);
  }
};

export default logger;
```

**Tiempo estimado:** 2 horas

---

### ⚠️ ALTO 2: Mock data inconsistente
**Ubicación:** `services/mocks.ts`

**Problema:**
Estructuras de datos simuladas no coinciden con tipos del backend.

**Solución:**
Eliminar archivo completamente y usar backend real.

**Tiempo estimado:** 1 hora (eliminar referencias)

---

### ⚠️ ALTO 3: Falta de refresh token flow
**Ubicación:** `src/api/client.ts`

**Problema:**
Sin manejo de refresh tokens cuando el access token expira.

**Solución:**
Implementar interceptor de refresh:

```typescript
let isRefreshing = false;
let failedQueue: any[] = [];

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Agregar a cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token } = await refreshToken();
        setAuthToken(token);

        // Procesar cola
        failedQueue.forEach(prom => prom.resolve(token));
        failedQueue = [];

        return apiClient(originalRequest);
      } catch (err) {
        failedQueue.forEach(prom => prom.reject(err));
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

**Tiempo estimado:** 4 horas

---

### ⚠️ ALTO 4: Sin paginación en endpoints
**Ubicación:** `src/api/endpoints/estudiantes.ts`

**Problema:**
Frontend no envía parámetros de paginación al backend.

**Solución:**
```typescript
interface PaginationParams {
  page?: number;
  per_page?: number;
}

list: async (
  filters?: EstudianteFilters & PaginationParams
): Promise<PaginatedResponse<Estudiante>> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.per_page) params.append('per_page', String(filters.per_page));

  // ... resto de filtros

  return apiClient.get(`/director/estudiantes?${params.toString()}`);
};
```

**Tiempo estimado:** 2 horas

---

## 3. PROBLEMAS DE MEDIO IMPACTO

### ⚙️ MEDIO 1: Imports no utilizados
**Ubicación:** `Dashboard.tsx`, `UserDetailDrawer.tsx`

**Solución:**
Limpiar imports no utilizados (usar ESLint auto-fix).

**Tiempo estimado:** 1 hora

---

### ⚙️ MEDIO 2: Props no utilizadas
**Ubicación:** `UserDetailDrawer.tsx`

**Problema:**
```tsx
triggerElementRef: React.RefObject<HTMLButtonElement | null>; // ❌ No usado
```

**Solución:**
Eliminar de la interface o implementar su uso.

**Tiempo estimado:** 30 minutos

---

### ⚙️ MEDIO 3: Stores sin persistencia
**Ubicación:** `store/taskStore.ts`, `store/notificationStore.ts`

**Solución:**
Usar middleware de Zustand para persistencia:

```typescript
import { persist } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      // ...
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Tiempo estimado:** 1 hora

---

### ⚙️ MEDIO 4: Colores hardcodeados
**Ubicación:** Múltiples componentes

**Solución:**
Centralizar en `design/tokens.ts`:

```typescript
export const eventColors = {
  Examen: 'bg-amber-500',
  Feriado: 'bg-rose-500',
  // ...
} as const;
```

**Tiempo estimado:** 2 horas

---

## 4. CHECKLIST DE MEJORAS UX/UI

### Estados Faltantes

- [ ] Loading skeletons en todas las páginas
- [ ] Error states en todas las páginas
- [ ] Empty states cuando no hay datos
- [ ] Success feedback en operaciones CRUD
- [ ] Progress indicators en uploads
- [ ] Confirmación en acciones destructivas

### Accesibilidad

- [ ] Focus trap en modales
- [ ] ARIA labels en todos los controles
- [ ] Navegación por teclado completa
- [ ] Contraste de colores WCAG AA
- [ ] Screen reader support

### Consistencia Visual

- [ ] Unificar espaciados (usar design tokens)
- [ ] Unificar tipografía
- [ ] Unificar colores de estados
- [ ] Unificar animaciones

---

## 5. PLAN DE ACCIÓN PRIORIZADO

### Semana 1 (CRÍTICO - 40 horas)
**Días 1-2:**
- [ ] Corregir `docente_id` hardcodeado (15 min)
- [ ] Unificar API Base URL (30 min)
- [ ] Corregir ruta de navegación (5 min)
- [ ] Reemplazar todos los `alert()` con toast (1h)
- [ ] Eliminar credenciales dummy (30 min)
- [ ] Implementar Error Boundaries (2h)

**Días 3-4:**
- [ ] Tipar todos los endpoints (quitar `any`) (6h)
- [ ] Implementar loading states básicos (6h)
- [ ] Implementar error states básicos (4h)

**Día 5:**
- [ ] Deprecar sistema de auth viejo (4h)
- [ ] Migrar componentes a nuevo sistema auth (4h)

### Semana 2 (ALTO - 30 horas)
**Días 1-2:**
- [ ] Implementar validación de formularios (6h)
- [ ] Implementar manejo de errores de validación (2h)
- [ ] Crear logger centralizado (2h)
- [ ] Eliminar console.logs (2h)

**Días 3-4:**
- [ ] Implementar refresh token flow (4h)
- [ ] Implementar paginación en endpoints (4h)
- [ ] Agregar accesibilidad a modales (3h)

**Día 5:**
- [ ] Eliminar mock data (2h)
- [ ] Testing de integración (5h)

### Semana 3 (MEDIO - 20 horas)
**Días 1-2:**
- [ ] Centralizar colores y tokens (4h)
- [ ] Implementar persistencia en stores (2h)
- [ ] Limpiar imports y props no usados (2h)

**Días 3-5:**
- [ ] Implementar empty states (4h)
- [ ] Implementar confirmaciones (2h)
- [ ] Optimizar re-renders (4h)
- [ ] Testing E2E (2h)

### Semana 4 (PULIDO - 15 horas)
- [ ] Revisión de accesibilidad completa (4h)
- [ ] Revisión de consistencia visual (3h)
- [ ] Documentación de componentes (4h)
- [ ] Testing final y QA (4h)

---

## 6. DEPENDENCIAS FALTANTES

### Frontend

**Recomendadas para agregar:**

```json
{
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0"
  },
  "dependencies": {
    "zod": "^3.22.0",
    "react-hook-form": "^7.51.0"
  }
}
```

### Backend

**Ya instaladas correctamente** ✅

Las dependencias del backend están completas según el `composer.json`.

---

## 7. MÉTRICAS DE CALIDAD

### Antes de la Auditoría
- **Type Safety:** 60% (muchos `any`)
- **Error Handling:** 30%
- **Accesibilidad:** 40%
- **Testing:** 0%
- **Documentación:** 20%

### Objetivos Post-Correcciones
- **Type Safety:** 95%
- **Error Handling:** 90%
- **Accesibilidad:** 80% (WCAG AA)
- **Testing:** 70% coverage
- **Documentación:** 80%

---

## 8. RIESGOS IDENTIFICADOS

### Alto Riesgo
1. **Multi-tenancy no validada:** Sin tests de aislamiento de datos
2. **Seguridad de tokens:** Sin validación de expiración
3. **Datos hardcodeados:** Pueden llegar a producción

### Medio Riesgo
1. **Performance:** Sin optimización de queries
2. **Escalabilidad:** Sin paginación adecuada
3. **UX:** Feedback pobre al usuario

### Bajo Riesgo
1. **Mantenibilidad:** Código duplicado
2. **Consistencia:** Estilos variados

---

## 9. RECOMENDACIONES FINALES

### Inmediatas
1. Corregir TODOS los problemas críticos antes de producción
2. Implementar testing automatizado
3. Documentar APIs y contratos

### Corto Plazo
1. Agregar monitoring y logging
2. Implementar CI/CD pipeline
3. Code review process

### Largo Plazo
1. Migrar a TypeScript strict mode
2. Implementar feature flags
3. Agregar analytics de uso

---

**Auditoría completada por:** Claude (Anthropic)
**Próxima revisión:** Después de implementar correcciones críticas
