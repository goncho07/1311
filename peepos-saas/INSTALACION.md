# GUÍA DE INSTALACIÓN - PEEPOS SAAS
## Sistema de Gestión Educativa Multi-Tenant

**Versión:** 1.0.0
**Última actualización:** 13 de Noviembre, 2025

---

## REQUISITOS DEL SISTEMA

### Backend (Laravel 12)
- **PHP:** 8.2 o superior
- **Composer:** 2.x
- **MySQL:** 8.0 o superior
- **Redis:** 6.x o superior (recomendado)
- **Extensiones PHP requeridas:**
  - `php-mysql`
  - `php-redis`
  - `php-gd` (procesamiento de imágenes)
  - `php-zip`
  - `php-xml`
  - `php-mbstring`
  - `php-curl`

### Frontend (React 19 + TypeScript)
- **Node.js:** 18.x o superior
- **npm:** 9.x o superior

---

## INSTALACIÓN DEL BACKEND

### 1. Instalar PHP y Composer

#### Windows:
```bash
# Descargar PHP 8.2+ desde: https://windows.php.net/download/
# Descargar Composer desde: https://getcomposer.org/download/
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-redis

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Configurar MySQL

```bash
# Crear base de datos central
mysql -u root -p

CREATE DATABASE peepos_central CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'peepos_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON peepos_central.* TO 'peepos_user'@'localhost';
GRANT ALL PRIVILEGES ON `peepos_tenant_%`.* TO 'peepos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Instalar Dependencias del Backend

```bash
cd "d:\2010-main (3)\peepos-saas\backend"

# Instalar dependencias de Composer
composer install

# Copiar archivo de configuración
copy .env.example .env

# Generar key de aplicación
php artisan key:generate
```

### 4. Configurar Variables de Entorno del Backend

Editar el archivo `.env`:

```env
APP_NAME="Peepos SaaS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peepos_central
DB_USERNAME=peepos_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# Multi-tenancy
CENTRAL_DOMAIN=localhost
TENANCY_DATABASE_PREFIX=peepos_tenant_
TENANCY_DOMAIN_SUFFIX=.peepos.local

# CORS
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 5. Ejecutar Migraciones

```bash
# Migrar base de datos central
php artisan migrate

# Crear tenant de prueba (opcional)
php artisan tenants:create \
  --codigo=demo \
  --nombre="Institución Demo" \
  --email=admin@demo.com
```

### 6. Iniciar Servidor de Desarrollo

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

El backend estará disponible en: `http://localhost:8000`

---

## INSTALACIÓN DEL FRONTEND

### 1. Instalar Node.js

Descargar e instalar desde: https://nodejs.org/ (versión LTS recomendada)

### 2. Instalar Dependencias del Frontend

```bash
cd "d:\2010-main (3)\peepos-saas\frontend"

# Instalar todas las dependencias
npm install
```

### 3. Configurar Variables de Entorno del Frontend

El archivo `.env` ya está creado. Verificar/editar si es necesario:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# App Configuration
VITE_APP_NAME=Peepos SaaS
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_AI_IMPORT=true
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_QR_ATTENDANCE=true
VITE_ENABLE_ANALYTICS=true
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

---

## VERIFICACIÓN DE LA INSTALACIÓN

### Backend

```bash
# Verificar que el servidor está corriendo
curl http://localhost:8000/api/health

# Esperado: {"status":"ok"}
```

### Frontend

1. Abrir el navegador en `http://localhost:3000`
2. Debería aparecer la página de login
3. Credenciales de prueba (si se usaron seeds):
   - **Usuario:** admin@demo.com
   - **Contraseña:** password
   - **Código Tenant:** demo

---

## SCRIPTS DISPONIBLES

### Frontend

```bash
# Desarrollo
npm run dev                  # Iniciar servidor de desarrollo

# Build
npm run build                # Compilar para producción
npm run preview              # Vista previa del build

# Calidad de código
npm run lint                 # Verificar código con ESLint
npm run lint:fix             # Corregir automáticamente
npm run format               # Formatear código con Prettier
npm run format:check         # Verificar formato
npm run type-check           # Verificar tipos de TypeScript

# Testing
npm run test                 # Ejecutar tests
npm run test:ui              # Tests con interfaz
npm run test:run             # Ejecutar tests una vez
npm run test:coverage        # Generar reporte de cobertura
```

### Backend

```bash
# Desarrollo
php artisan serve            # Iniciar servidor

# Base de datos
php artisan migrate          # Ejecutar migraciones
php artisan migrate:fresh    # Limpiar y migrar
php artisan db:seed          # Ejecutar seeders

# Tenancy
php artisan tenants:list     # Listar tenants
php artisan tenants:create   # Crear nuevo tenant
php artisan tenants:migrate  # Migrar todos los tenants

# Caché
php artisan cache:clear      # Limpiar caché
php artisan config:clear     # Limpiar config cache
php artisan route:cache      # Cachear rutas

# Testing
php artisan test             # Ejecutar tests
```

---

## ESTRUCTURA DEL PROYECTO

```
peepos-saas/
├── backend/                           # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/         # Controladores
│   │   ├── Models/                   # Modelos Eloquent
│   │   ├── Services/                 # Lógica de negocio
│   │   └── Middleware/               # Middleware custom
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── central/              # BD Central (tenants)
│   │   │   └── tenant/               # BD por Tenant
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php                   # Rutas API
│   ├── config/
│   │   └── tenancy.php               # Config multi-tenancy
│   └── .env                          # Variables de entorno
│
└── frontend/                          # React 19 + TypeScript
    ├── src/
    │   ├── api/                      # API client y endpoints
    │   ├── components/               # Componentes React
    │   │   ├── error/                # ErrorBoundary, EmptyState, etc.
    │   │   ├── layout/               # Layout components
    │   │   ├── providers/            # Context providers
    │   │   └── ui/                   # UI components
    │   ├── pages/                    # Páginas/Vistas
    │   ├── hooks/                    # Custom hooks
    │   ├── store/                    # Zustand stores
    │   ├── types/                    # TypeScript types
    │   ├── utils/                    # Utilidades
    │   └── config/                   # Configuración
    ├── .env                          # Variables de entorno
    ├── .eslintrc.cjs                 # Config ESLint
    ├── .prettierrc                   # Config Prettier
    ├── vitest.config.ts              # Config tests
    └── package.json                  # Dependencias
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: PHP no encontrado

**Problema:** `php: command not found`

**Solución:**
```bash
# Verificar instalación
php -v

# Agregar PHP al PATH (Windows)
# Panel de Control → Sistema → Variables de entorno
# Agregar: C:\php a la variable PATH
```

### Error: Composer no encontrado

**Problema:** `composer: command not found`

**Solución:**
```bash
# Verificar instalación
composer --version

# Reinstalar Composer si es necesario
```

### Error: Cannot connect to MySQL

**Problema:** `SQLSTATE[HY000] [2002] No connection could be made`

**Solución:**
```bash
# Verificar que MySQL está corriendo
mysql --version
# o
systemctl status mysql  # Linux
# o
services.msc            # Windows → Buscar MySQL

# Verificar credenciales en .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peepos_central
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Error: Port already in use

**Problema:** `Port 8000 is already in use`

**Solución:**
```bash
# Cambiar puerto
php artisan serve --port=8080

# O terminar proceso en el puerto
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux:
lsof -ti:8000 | xargs kill -9
```

### Error: CORS en Frontend

**Problema:** `Access-Control-Allow-Origin header`

**Solución:**
Verificar en backend `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Error: Module not found

**Problema:** `Cannot find module '@/...'`

**Solución:**
```bash
cd frontend
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## PRÓXIMOS PASOS

1. **Configurar Tenant de Producción**
   ```bash
   php artisan tenants:create \
     --codigo=mi_colegio \
     --nombre="Mi Colegio" \
     --email=admin@micolegio.com
   ```

2. **Ejecutar Seeds de Datos Iniciales**
   ```bash
   php artisan db:seed --class=RolesSeeder
   php artisan db:seed --class=PermissionsSeeder
   ```

3. **Configurar Servicios Externos** (Opcional)
   - Google Cloud Storage (almacenamiento de archivos)
   - Google Gemini AI (importación inteligente)
   - WhatsApp Business API (notificaciones)

4. **Configurar SSL** (Producción)
   - Usar Let's Encrypt o certificado SSL
   - Actualizar `APP_URL` a HTTPS

5. **Optimizar para Producción**
   ```bash
   # Backend
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache

   # Frontend
   npm run build
   ```

---

## CONTACTO Y SOPORTE

- **Documentación:** Ver `AUDITORIA_COMPLETA.md` y `CHECKLIST_PROGRESO.md`
- **Issues:** Reportar problemas en el repositorio
- **Email:** soporte@peepos.com (cambiar según corresponda)

---

**Instalación completada:** Ahora puedes comenzar a desarrollar y usar el sistema.
