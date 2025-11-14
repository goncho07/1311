# 🚀 Guía de Migración - Integración Frontend con Backend API

## 📋 Resumen de Cambios Implementados

Se ha completado la integración del frontend React con el backend Laravel multi-tenant. Esta guía te ayudará a migrar tus páginas existentes para usar la API real.

---

## ✅ Componentes Creados (FASE 11 y 12)

### 1. **Tipos TypeScript Actualizados**
📁 `src/types/models.types.ts` - Modelos específicos del sistema educativo:
- ✅ Usuario, Estudiante, Docente, Apoderado
- ✅ Matricula, Evaluacion, Asistencia
- ✅ AreaCurricular, CompetenciaMinedu
- ✅ TransaccionFinanciera, CuentaPorCobrar
- ✅ ReunionApoderado, ImportBatch, InventarioItem

### 2. **API Client y Endpoints**
📁 `src/api/client.ts` - Cliente Axios configurado
📁 `src/api/endpoints/` - Endpoints por módulo

### 3. **React Query Hooks**
📁 `hooks/` - Hooks personalizados:
- ✅ useAuth, useEstudiantes, useEvaluaciones
- ✅ useMatriculas, useAsistencias

### 4. **Context Providers**
📁 `src/contexts/` - Providers de React Context:
- ✅ AuthContext, TenantContext

### 5. **Utilidades**
📁 `utils/` - Funciones helper:
- ✅ auth.ts, storage.ts, formatters.ts, validators.ts

---

## 📦 Archivos de Ejemplo Creados

Para ayudarte en la migración, se han creado 4 archivos de ejemplo con código **listo para usar**:

### 1. **LoginPage_API_READY.tsx**
Ejemplo de login con:
- Campo `tenant_code` para multi-tenant
- Hook `useLogin` para consumir API
- Manejo de errores de API
- Redirección basada en roles

### 2. **EstudiantesPage_API_READY.tsx**
Ejemplo de CRUD completo con:
- Listado paginado de estudiantes
- Filtros conectados a API
- Crear/Editar/Eliminar con mutations
- Importar/Exportar Excel
- Estados de loading y error

### 3. **EvaluacionesPage_API_READY.tsx**
Ejemplo de registro de evaluaciones con:
- Registro masivo por aula
- Calificación cualitativa (AD, A, B, C)
- Generación de boletas PDF
- Filtros por área curricular y bimestre

### 4. **main_API_READY.tsx**
Configuración completa con:
- QueryClientProvider
- AuthProvider y TenantProvider
- React Query DevTools
- Configuración de cache

---

## 🔄 Proceso de Migración (Paso a Paso)

### **PASO 1: Configurar `main.tsx`**

Reemplaza el contenido de [src/main.tsx](peepos-saas/frontend/src/main.tsx) con el de [main_API_READY.tsx](peepos-saas/frontend/src/main_API_READY.tsx):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, TenantProvider } from '@/src/contexts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
```

---

### **PASO 2: Migrar LoginPage**

1. **Abrir** [pages/LoginPage.tsx](peepos-saas/frontend/pages/LoginPage.tsx)
2. **Comparar** con [LoginPage_API_READY.tsx](peepos-saas/frontend/pages/LoginPage_API_READY.tsx)
3. **Aplicar cambios**:

```tsx
// ❌ ANTES (mock data)
const login = useAuthStore((state) => state.login);
const handleLogin = async (e) => {
  const success = await login(dni, password);
  if (success) navigate('/');
};

// ✅ DESPUÉS (API real)
import { useLogin } from '@/hooks/useAuth';
import { setTenantCode } from '@/utils/auth';

const loginMutation = useLogin();
const [tenantCode, setTenantCodeState] = useState('');

const handleLogin = async (e) => {
  setTenantCode(tenantCode);
  await loginMutation.mutateAsync({
    tenant_code: tenantCode,
    email,
    password,
  });
  // Redirección automática en el hook
};
```

**Cambios clave**:
- ✅ Agregar campo `tenant_code`
- ✅ Usar hook `useLogin`
- ✅ Manejo de errores de API
- ✅ Cambiar DNI por email

---

### **PASO 3: Migrar Páginas de Estudiantes**

Para cada página relacionada con estudiantes (ejemplo: MonitoreoEstudiantesPage.tsx):

1. **Abrir** la página existente
2. **Comparar** con [EstudiantesPage_API_READY.tsx](peepos-saas/frontend/pages/EstudiantesPage_API_READY.tsx)
3. **Aplicar patrón**:

```tsx
// ❌ ANTES (datos mock o zustand)
const estudiantes = useEstudiantesStore((state) => state.estudiantes);

// ✅ DESPUÉS (API real con React Query)
import { useEstudiantes } from '@/hooks/useEstudiantes';

const [filters, setFilters] = useState({
  page: 1,
  per_page: 20,
  search: '',
  grado: undefined,
});

const { data, isLoading, error } = useEstudiantes(filters);
const estudiantes = data?.data || [];
const meta = data?.meta;
```

**Patrón de migración**:
1. Importar hook de React Query
2. Definir estado de filtros
3. Usar hook con filtros
4. Extraer datos de respuesta paginada
5. Manejar estados de loading y error

---

### **PASO 4: Migrar Operaciones CRUD**

Para crear/editar/eliminar:

```tsx
// ✅ Importar mutations
import {
  useCreateEstudiante,
  useUpdateEstudiante,
  useDeleteEstudiante,
} from '@/hooks/useEstudiantes';

// ✅ Usar mutations
const createMutation = useCreateEstudiante();
const updateMutation = useUpdateEstudiante();
const deleteMutation = useDeleteEstudiante();

// ✅ Handlers
const handleCreate = async (data) => {
  await createMutation.mutateAsync(data);
  // Cache se invalida automáticamente
  alert('Estudiante creado');
};

const handleDelete = async (id) => {
  if (confirm('¿Eliminar?')) {
    await deleteMutation.mutateAsync(id);
  }
};
```

---

### **PASO 5: Migrar Evaluaciones**

Para páginas de evaluaciones:

1. **Abrir** LibroCalificacionesPage.tsx o similar
2. **Comparar** con [EvaluacionesPage_API_READY.tsx](peepos-saas/frontend/pages/EvaluacionesPage_API_READY.tsx)
3. **Aplicar patrón**:

```tsx
import {
  useEvaluaciones,
  useCreateBulkEvaluaciones,
} from '@/hooks/useEvaluaciones';

const [filters, setFilters] = useState({
  area_curricular_id: undefined,
  periodo_academico_id: 1,
  bimestre: 'I',
});

const { data } = useEvaluaciones(filters);
const createBulkMutation = useCreateBulkEvaluaciones();

const handleRegistroMasivo = async (evaluaciones) => {
  await createBulkMutation.mutateAsync(evaluaciones);
};
```

---

### **PASO 6: Migrar Asistencia**

Similar a estudiantes, usar hooks:

```tsx
import {
  useAsistencias,
  useCreateBulkAsistencias,
} from '@/hooks/useAsistencias';

const { data } = useAsistencias({
  grado: '1°',
  seccion: 'A',
  fecha: '2024-01-15',
});
```

---

### **PASO 7: Migrar Matrículas**

```tsx
import {
  useMatriculas,
  useCreateMatricula,
} from '@/hooks/useMatriculas';

const { data } = useMatriculas({
  periodo_academico_id: 1,
  estado: 'CONFIRMADA',
});
```

---

## 📝 Checklist de Migración por Página

Para cada página existente, seguir este checklist:

### ✅ 1. Importaciones
- [ ] Importar hooks de React Query correspondientes
- [ ] Importar tipos TypeScript si es necesario

### ✅ 2. Estado
- [ ] Definir estado de filtros
- [ ] Eliminar estados locales de datos (ya están en React Query cache)

### ✅ 3. Data Fetching
- [ ] Reemplazar fetch/axios directo con hooks
- [ ] Usar `useQuery` para GET
- [ ] Usar `useMutation` para POST/PUT/DELETE

### ✅ 4. Loading y Error States
- [ ] Agregar manejo de `isLoading`
- [ ] Agregar manejo de `error`
- [ ] Mostrar spinners/mensajes apropiados

### ✅ 5. Paginación
- [ ] Extraer `meta` de respuesta paginada
- [ ] Implementar botones prev/next
- [ ] Actualizar filtros con nueva página

### ✅ 6. Filtros
- [ ] Conectar filtros al estado
- [ ] Pasar filtros al hook
- [ ] Reset page a 1 cuando cambian filtros

### ✅ 7. CRUD Operations
- [ ] Usar mutations para crear/editar/eliminar
- [ ] Esperar `mutateAsync()` con await
- [ ] Mostrar mensajes de éxito/error

### ✅ 8. Testing
- [ ] Probar con backend corriendo
- [ ] Verificar headers `X-Tenant-Code` en DevTools
- [ ] Verificar cache en React Query DevTools

---

## 🎯 Páginas Prioritarias para Migrar

Migrar en este orden:

1. **✅ LoginPage.tsx** (CRÍTICO)
   - Sin esto, no hay autenticación

2. **🔴 Dashboard.tsx** (ALTA)
   - Primera página después del login

3. **🔴 Páginas de Estudiantes**
   - MonitoreoEstudiantesPage.tsx
   - Cualquier CRUD de estudiantes

4. **🟡 Páginas de Evaluaciones**
   - LibroCalificacionesPage.tsx
   - CompetenciasPonderacionesPage.tsx

5. **🟡 Páginas de Asistencia**
   - AsistenciaPage.tsx

6. **🟡 Páginas de Matrícula**
   - MatriculaPage.tsx

7. **🟢 Páginas Secundarias**
   - ConfiguracionAcademicaPage.tsx
   - AdminFinanzasPage.tsx
   - ComunicacionesPage.tsx

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "X-Tenant-Code header no se envía"
**Solución**: Asegúrate de llamar `setTenantCode()` en el login

```tsx
setTenantCode(data.tenant_code);
```

### Problema 2: "Token expirado, redirige a login"
**Solución**: El interceptor maneja esto automáticamente. Solo asegúrate de que el token esté en localStorage.

### Problema 3: "Cache no se invalida después de mutation"
**Solución**: Los hooks ya invalidan automáticamente. Si no funciona, verifica que uses `mutateAsync()` en lugar de `mutate()`.

### Problema 4: "Datos no se recargan al cambiar filtros"
**Solución**: Asegúrate de incluir `filters` en el array de dependencias del hook:

```tsx
const { data } = useEstudiantes(filters); // ✅ Correcto
```

### Problema 5: "Error 422 al crear/editar"
**Solución**: Verifica que los datos enviados coincidan con la validación del backend. Revisa la respuesta de error en DevTools Network.

---

## 🧪 Testing de la Integración

### 1. Verificar Backend
```bash
cd peepos-saas/backend
php artisan serve
```

### 2. Verificar Frontend
```bash
cd peepos-saas/frontend
npm run dev
```

### 3. Probar Login
1. Ir a `http://localhost:5173/login`
2. Ingresar:
   - Tenant Code: `COLEGIO01`
   - Email: `director@colegio.com`
   - Password: `12345678`
3. Verificar en DevTools Network:
   - Request a `/api/v1/login`
   - Header `X-Tenant-Code: COLEGIO01`
   - Response con token

### 4. Probar React Query DevTools
1. Abrir DevTools (F12)
2. Click en icono React Query (esquina inferior derecha)
3. Ver queries activas
4. Ver cache

---

## 📚 Recursos Adicionales

### Documentación
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Guía general de integración
- [EXAMPLE_APP_SETUP.tsx](EXAMPLE_APP_SETUP.tsx) - Ejemplos de uso

### Archivos de Referencia
- [src/types/models.types.ts](src/types/models.types.ts) - Todos los tipos
- [src/api/endpoints/](src/api/endpoints/) - Todos los endpoints
- [hooks/](hooks/) - Todos los hooks

---

## 🎉 Conclusión

Después de seguir esta guía, tu frontend estará completamente integrado con el backend Laravel multi-tenant.

**Próximos pasos**:
1. Migrar LoginPage (CRÍTICO)
2. Migrar Dashboard
3. Migrar las demás páginas una por una
4. Probar todo el flujo end-to-end

**Recuerda**:
- Usa los archivos `_API_READY.tsx` como referencia
- Sigue el patrón React Query (useQuery + useMutation)
- No olvides agregar tenant_code en el login
- Prueba con backend corriendo

---

¿Dudas? Revisa los ejemplos en:
- [LoginPage_API_READY.tsx](pages/LoginPage_API_READY.tsx)
- [EstudiantesPage_API_READY.tsx](pages/EstudiantesPage_API_READY.tsx)
- [EvaluacionesPage_API_READY.tsx](pages/EvaluacionesPage_API_READY.tsx)
