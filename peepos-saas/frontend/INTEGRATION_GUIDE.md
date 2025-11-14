# 📘 Guía de Integración del Frontend - Peepos SaaS

## ✅ Cambios Implementados

Se ha adaptado el frontend React para consumir la API del backend Laravel. Los cambios incluyen:

### 📁 Estructura Creada

```
frontend/
├── src/
│   ├── api/                      # ✅ Cliente API y endpoints
│   │   ├── client.ts             # Cliente Axios configurado
│   │   └── endpoints/            # Endpoints por módulo
│   │       ├── auth.ts
│   │       ├── estudiantes.ts
│   │       ├── evaluaciones.ts
│   │       ├── matriculas.ts
│   │       ├── asistencias.ts
│   │       ├── comunicaciones.ts
│   │       ├── inventario.ts
│   │       ├── finanzas.ts
│   │       ├── reportes.ts
│   │       └── index.ts
│   │
│   ├── contexts/                 # ✅ React Context Providers
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   └── index.ts
│   │
│   ├── routes/                   # ✅ Rutas protegidas
│   │   ├── PrivateRoute.tsx
│   │   ├── RoleBasedRoute.tsx
│   │   └── index.tsx
│   │
│   └── types/                    # ✅ TypeScript Types
│       ├── api.types.ts
│       ├── auth.types.ts
│       └── models.types.ts
│
├── hooks/                        # ✅ React Query Hooks
│   ├── useAuth.ts
│   ├── useEstudiantes.ts
│   ├── useEvaluaciones.ts
│   ├── useMatriculas.ts
│   └── useAsistencias.ts
│
└── utils/                        # ✅ Utilidades
    ├── auth.ts                   # Funciones de autenticación
    ├── storage.ts                # Manejo de localStorage
    ├── formatters.ts             # Formateo de datos
    └── validators.ts             # Validaciones
```

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del frontend:

```bash
cp .env.example .env
```

Editar `.env` con la URL de tu backend:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. Instalar Dependencias

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
cd peepos-saas/frontend
npm install
```

Dependencias agregadas:
- `axios`: Cliente HTTP
- `@tanstack/react-query`: Gestión de estado asíncrono

---

## 📝 Cómo Usar la Integración

### 🔐 Autenticación

#### Usar el Context de Auth

```tsx
import { useAuthContext } from '@/src/contexts';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext();

  const handleLogin = async () => {
    try {
      await login({
        tenant_code: 'COLEGIO01',
        email: 'director@colegio.com',
        password: '12345678',
      });
      // Usuario autenticado, redirige automáticamente
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Hola, {user?.nombre}</p>
          <button onClick={logout}>Cerrar Sesión</button>
        </>
      ) : (
        <button onClick={handleLogin}>Iniciar Sesión</button>
      )}
    </div>
  );
}
```

#### Usar React Query Hooks

```tsx
import { useLogin, useLogout } from '@/hooks/useAuth';

function LoginPage() {
  const loginMutation = useLogin();

  const handleSubmit = (data) => {
    loginMutation.mutate({
      tenant_code: data.tenantCode,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {loginMutation.isLoading && <p>Iniciando sesión...</p>}
      {loginMutation.isError && <p>Error: {loginMutation.error.message}</p>}
    </form>
  );
}
```

---

### 👨‍🎓 Gestión de Estudiantes

```tsx
import { useEstudiantes, useCreateEstudiante } from '@/hooks/useEstudiantes';

function EstudiantesPage() {
  // Listar estudiantes con filtros
  const { data, isLoading } = useEstudiantes({
    page: 1,
    per_page: 20,
    estado: 'activo',
  });

  // Crear estudiante
  const createMutation = useCreateEstudiante();

  const handleCreate = () => {
    createMutation.mutate({
      nombre: 'Juan',
      apellido_paterno: 'Pérez',
      apellido_materno: 'García',
      dni: '12345678',
      fecha_nacimiento: '2010-05-15',
      genero: 'M',
    });
  };

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div>
      <button onClick={handleCreate}>Agregar Estudiante</button>
      <ul>
        {data?.data.map((estudiante) => (
          <li key={estudiante.id}>
            {estudiante.nombre} {estudiante.apellido_paterno}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 📊 Evaluaciones

```tsx
import { useEvaluaciones, useCreateBulkEvaluaciones } from '@/hooks/useEvaluaciones';

function EvaluacionesPage() {
  const { data } = useEvaluaciones({
    curso_id: 1,
    periodo_academico_id: 1,
    bimestre: 'I',
  });

  const createBulkMutation = useCreateBulkEvaluaciones();

  const handleRegistroMasivo = (evaluaciones) => {
    createBulkMutation.mutate(evaluaciones);
  };

  return (
    <div>
      {/* Lista de evaluaciones */}
    </div>
  );
}
```

---

### 🛡️ Rutas Protegidas

#### Ruta Privada (Solo Autenticados)

```tsx
import { PrivateRoute } from '@/src/routes';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estudiantes" element={<Estudiantes />} />
      </Route>
    </Routes>
  );
}
```

#### Ruta Basada en Roles

```tsx
import { RoleBasedRoute } from '@/src/routes';
import { UserRole } from '@/src/types/auth.types';

function App() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.DIRECTOR]} />}>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={[UserRole.DOCENTE]} />}>
          <Route path="/asistencias" element={<AsistenciasPage />} />
          <Route path="/evaluaciones" element={<EvaluacionesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

---

## 🔧 Providers Necesarios

### Configurar Providers en `main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, TenantProvider } from '@/src/contexts';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TenantProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 🎯 Funciones de Utilidad

### Formateo de Datos

```tsx
import { formatDate, formatCurrency, formatGrade } from '@/utils/formatters';

const fecha = formatDate('2024-01-15'); // "15/01/2024"
const precio = formatCurrency(150.50); // "S/ 150.50"
const nota = formatGrade(16.75); // "16.75"
```

### Validaciones

```tsx
import { isValidEmail, isValidDNI, isValidPassword } from '@/utils/validators';

const emailValido = isValidEmail('test@example.com'); // true
const dniValido = isValidDNI('12345678'); // true
const passwordValido = isValidPassword('Password123'); // true
```

### Permisos y Roles

```tsx
import { hasRole, hasPermission } from '@/utils/auth';
import { UserRole } from '@/src/types/auth.types';

if (hasRole(UserRole.DIRECTOR)) {
  // Mostrar opciones de director
}

if (hasPermission('estudiantes.create')) {
  // Mostrar botón de crear estudiante
}
```

---

## 📦 Endpoints Disponibles

### Autenticación
- `authApi.login(credentials)`
- `authApi.logout()`
- `authApi.me()`
- `authApi.changePassword(data)`

### Estudiantes
- `estudiantesApi.list(filters)`
- `estudiantesApi.get(id)`
- `estudiantesApi.create(data)`
- `estudiantesApi.update(id, data)`
- `estudiantesApi.delete(id)`
- `estudiantesApi.import(file)`

### Evaluaciones
- `evaluacionesApi.list(filters)`
- `evaluacionesApi.create(data)`
- `evaluacionesApi.createBulk(evaluaciones)`
- `evaluacionesApi.generarBoleta(estudianteId, periodoId, bimestre)`

### Matrículas
- `matriculasApi.list(filters)`
- `matriculasApi.create(data)`
- `matriculasApi.changeStatus(id, estado)`

### Asistencias
- `asistenciasApi.list(filters)`
- `asistenciasApi.createBulk(asistencias)`
- `asistenciasApi.getResumen(estudianteId, fechaInicio, fechaFin)`

---

## 🧪 Testing de la Integración

### 1. Verificar Backend Funcionando

```bash
# En el backend Laravel
php artisan serve
```

### 2. Iniciar Frontend

```bash
# En el frontend
npm run dev
```

### 3. Probar Login

1. Ir a `http://localhost:5173/login`
2. Ingresar credenciales de prueba
3. Verificar en DevTools Network que se envía el header `X-Tenant-Code`
4. Verificar que se guarda el token en localStorage

---

## ⚠️ Notas Importantes

### Headers Multi-Tenant

El `apiClient` automáticamente agrega estos headers en cada request:
- `X-Tenant-Code`: Código de la institución actual
- `Authorization`: Token Bearer del usuario

### Manejo de Errores

El interceptor de Axios maneja automáticamente:
- **401**: Redirige al login
- **403**: Muestra alerta si el tenant está suspendido
- **422**: Muestra errores de validación
- **500**: Log de errores del servidor

### Cache de React Query

Las queries se cachean por 5 minutos por defecto. Para invalidar:

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
```

---

## 🎉 ¡Listo!

Tu frontend ahora está completamente integrado con el backend Laravel multi-tenant. Puedes empezar a consumir los endpoints en tus componentes React.

Para más información, revisa los archivos de código en:
- `src/api/endpoints/` - Endpoints
- `hooks/` - React Query Hooks
- `src/contexts/` - Providers
- `utils/` - Utilidades
