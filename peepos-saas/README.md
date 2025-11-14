# 🎓 PEEPOS - Sistema de Gestión Educativa Multi-Tenant SaaS

> **Plataforma integral de gestión escolar para Perú, potenciada por IA**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Backend](https://img.shields.io/badge/backend-Laravel%2011-red.svg)](https://laravel.com)
[![Frontend](https://img.shields.io/badge/frontend-React%2018-blue.svg)](https://reactjs.org)
[![Database](https://img.shields.io/badge/database-MySQL%208.0-orange.svg)](https://www.mysql.com)
[![Cloud](https://img.shields.io/badge/cloud-Google%20Cloud-blue.svg)](https://cloud.google.com)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Base de Datos](#-base-de-datos)
- [Módulos](#-módulos)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentación](#-documentación)
- [Licencia](#-licencia)

---

## ✨ Características

### 🏫 Gestión Institucional Completa

- ✅ **Multi-tenancy**: Múltiples instituciones en una sola plataforma
- ✅ **Gestión de Estudiantes**: CRUD, historial académico, documentación
- ✅ **Sistema de Matrícula**: Control de cupos, proceso de admisión
- ✅ **Evaluaciones y Notas**: Competencias, capacidades, desempeños (MINEDU)
- ✅ **Control de Asistencia**: Presencial, tardanzas, justificaciones
- ✅ **Comunicaciones**: Mensajes, reuniones, incidencias
- ✅ **Gestión de Docentes**: Horarios, cursos, evaluaciones
- ✅ **Finanzas**: Cuentas por cobrar, pagos, comprobantes

### 🤖 Importación Inteligente con IA

- 📄 **Google Drive Integration**: Importa desde carpetas compartidas
- 🧠 **Clasificación Automática**: IA identifica tipo de documento
- 📊 **Extracción de Datos**:
  - Excel desalineados o mal formateados
  - PDFs escaneados (OCR)
  - Imágenes de documentos
- 🔄 **Mapeo Automático**: IA mapea campos a esquema de BD
- ✅ **Validación MINEDU**: Verifica datos según normativas
- 👁️ **Revisión Asistida**: Humano revisa con sugerencias de IA

### 🤖 Asistente Virtual (Coming Soon)

- 💬 **ChatBot Educativo**: Responde consultas de directores y docentes
- 📊 **Análisis de Datos**: Insights automáticos sobre rendimiento
- 📈 **Predicciones**: Identifica estudiantes en riesgo
- 📝 **Generación de Reportes**: Automática con lenguaje natural

### 📱 Multi-Plataforma

- 🌐 **Web Application**: React SPA responsive
- 📱 **Progressive Web App (PWA)**: Funciona offline
- 🔔 **Notificaciones Push**: Alertas en tiempo real
- 📧 **Email & WhatsApp**: Integración para comunicaciones

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCCIÓN CLOUD                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Firebase        │         │   Cloud Run       │        │
│  │  Hosting         │────────▶│   Backend API     │        │
│  │  (React SPA)     │  HTTPS  │   Laravel 11      │        │
│  └──────────────────┘         └─────────┬─────────┘        │
│                                          │                  │
│                                          │ MySQL            │
│                                          ▼                  │
│                                 ┌────────────────┐         │
│                                 │  Cloud SQL     │         │
│                                 │  MySQL 8.0     │         │
│                                 │  Multi-Tenant  │         │
│                                 └────────────────┘         │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Secret Manager   │         │ Cloud Storage     │        │
│  │ (Credentials)    │         │ (File Uploads)    │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Google Gemini    │         │ Google Drive API  │        │
│  │ (IA Assistant)   │         │ (Import System)   │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Architecture

**Database-per-Tenant** (Base de datos separada por institución):

```
Cloud SQL MySQL 8.0
├── peepos_central (BD Control SaaS)
│   ├── tenants (3 tablas)
│   ├── subscriptions
│   └── tenant_users
│
├── peepos_tenant_1_ricardo_palma (49 tablas)
├── peepos_tenant_2_santa_rosa (49 tablas)
└── peepos_tenant_N_... (49 tablas)
```

**Ventajas:**
- ✅ Aislamiento total de datos
- ✅ Cumplimiento GDPR/Ley de Protección de Datos
- ✅ Performance optimizado por tenant
- ✅ Backups independientes
- ✅ Migración/export de datos simplificado

---

## 🛠️ Tecnologías

### Backend

- **Framework**: Laravel 11 (PHP 8.2)
- **Base de Datos**: MySQL 8.0
- **Cache**: Redis (Cloud Memorystore)
- **Authentication**: Laravel Sanctum (JWT)
- **File Storage**: Google Cloud Storage
- **Queue**: Laravel Queue + Redis
- **API Documentation**: OpenAPI (Swagger)
- **Testing**: PHPUnit + PHPStan

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Library**: Tailwind CSS + HeadlessUI
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library + Playwright

### DevOps & Cloud

- **Cloud Provider**: Google Cloud Platform
- **Container**: Docker + Cloud Run
- **CI/CD**: Cloud Build + GitHub Actions
- **Monitoring**: Cloud Monitoring + Cloud Logging
- **CDN**: Firebase Hosting
- **Database**: Cloud SQL for MySQL
- **Secrets**: Secret Manager
- **VPC**: VPC Connector

### IA & Machine Learning

- **IA Platform**: Google Gemini 2.0 Flash
- **OCR**: Google Cloud Vision API
- **Document AI**: Google Document AI
- **Natural Language**: Gemini NLP

---

## 📦 Requisitos

### Desarrollo Local

- **PHP**: >= 8.2
- **Composer**: >= 2.7
- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **MySQL**: >= 8.0
- **Redis**: >= 7.0 (opcional)
- **Git**: >= 2.30

### Para Deployment

- **Google Cloud SDK** (gcloud CLI)
- **Docker** (opcional, para builds locales)
- **Firebase CLI** (para frontend)

---

## 🚀 Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/peepos-saas.git
cd peepos-saas
```

### 2. Backend Setup

```bash
cd backend

# Instalar dependencias
composer install

# Configurar .env
cp .env.example .env
php artisan key:generate

# Configurar base de datos en .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=peepos_central
# DB_USERNAME=root
# DB_PASSWORD=

# Ejecutar migraciones de la BD central
php artisan migrate --path=database/migrations/central

# Seed de datos iniciales
php artisan db:seed --class=CentralSeeder

# Iniciar servidor de desarrollo
php artisan serve --port=8080
```

El backend estará disponible en: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Configurar URL del backend en .env
# VITE_API_BASE_URL=http://localhost:8080/api/v1

# Iniciar dev server
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 4. Crear Tenant de Prueba

```bash
cd backend

# Via Artisan command
php artisan tenant:create \
  --code=test-colegio \
  --nombre="Colegio de Prueba" \
  --email=admin@test.com

# O via API
curl -X POST http://localhost:8080/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_code": "test-colegio",
    "nombre": "Colegio de Prueba",
    "email": "admin@test.com",
    "plan": "BASICO"
  }'
```

### 5. Login Inicial

**Credenciales de prueba:**
- **Tenant Code**: `test-colegio`
- **Email**: `director@test.com`
- **Password**: `password123`

---

## 📊 Base de Datos

### Estructura Multi-Tenant

**Total: 52 tablas**
- **3 tablas** en BD Central (`peepos_central`)
- **49 tablas** en cada BD Tenant

### BD Central (peepos_central)

| Tabla | Descripción |
|-------|-------------|
| `tenants` | Instituciones educativas (clientes SaaS) |
| `subscriptions` | Planes y suscripciones |
| `tenant_users` | Usuarios que pueden acceder a múltiples tenants |

### BD Tenant (peepos_tenant_X)

Cada institución tiene su propia base de datos con 49 tablas organizadas en módulos.

---

## 🧩 Módulos

| **MÓDULO** | **TABLAS** | **DESCRIPCIÓN** |
|------------|------------|-----------------|
| **Core** | 7 | Usuarios, roles, permisos, sesiones, audit |
| **Estudiantes** | 3 | Estudiantes, apoderados, relaciones |
| **Docentes** | 2 | Docentes, personal administrativo |
| **Matrícula** | 4 | Matrículas, documentos, cupos, períodos |
| **Académico** | 8 | Evaluaciones, competencias, tareas, CyE |
| **Asistencia** | 3 | Asistencias, horarios, códigos QR |
| **Comunicaciones** | 4 | Mensajes, reuniones, plantillas, incidencias |
| **Recursos** | 6 | Inventario, movimientos, biblioteca, préstamos |
| **Actividades** | 2 | Actividades extracurriculares, inscripciones |
| **Finanzas** | 3 | Transacciones, conceptos, cuentas por cobrar |
| **Reportes** | 3 | Reportes generados, estadísticas, docs oficiales |
| **Importación** | 3 | Batches, archivos, registros |
| **Configuración** | 1 | Configuración institucional |

---

## 🤖 Sistema de Importación IA

### Flujo de Importación

```
1. Director comparte carpeta de Google Drive
        ↓
2. IA escanea y clasifica documentos
   (Nóminas, listas, boletas, etc.)
        ↓
3. IA extrae datos (Excel, PDF, imágenes)
        ↓
4. IA mapea datos a esquema de BD
        ↓
5. IA valida según normativas MINEDU
        ↓
6. Humano revisa con sugerencias de IA
        ↓
7. Importación a base de datos
```

### Capacidades

- ✅ **Excel desalineados**: Detecta headers y mapea columnas automáticamente
- ✅ **PDFs escaneados**: OCR para extraer texto de documentos
- ✅ **Imágenes de documentos**: Procesa fotos de nóminas, listas
- ✅ **Validación inteligente**:
  - DNI válidos (8 dígitos)
  - Fechas coherentes
  - Grados y secciones válidos
  - Nombres propios
- ✅ **Deduplicación**: Detecta estudiantes duplicados
- ✅ **Actualización masiva**: Actualiza datos existentes

---

## 🔐 Seguridad

### Multi-Tenancy Isolation

- ✅ **Bases de datos separadas** por tenant
- ✅ **Identificación vía header** `X-Tenant-Code`
- ✅ **Middleware de validación** en cada request
- ✅ **Conexión dinámica** a BD del tenant
- ✅ **No hay cross-tenant queries** posibles

### Autenticación y Autorización

- ✅ **JWT Tokens** via Laravel Sanctum
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Permissions granulares** por módulo
- ✅ **Ownership validation** en cada operación
- ✅ **Session management** con Redis

### Seguridad de Datos

- ✅ **Encriptación en tránsito**: HTTPS/TLS
- ✅ **Encriptación en reposo**: Cloud SQL encryption
- ✅ **Secrets en Secret Manager**: No credentials en código
- ✅ **SQL Injection protection**: Eloquent ORM
- ✅ **XSS protection**: React escaping + CSP headers
- ✅ **CSRF protection**: Laravel CSRF tokens

---

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar todos los tests
./test-suite.sh

# Solo unit tests
php artisan test --testsuite=Unit

# Solo feature tests
php artisan test --testsuite=Feature

# Con coverage
./test-suite.sh --coverage
```

**Tests implementados: 49+**
- Multi-tenancy (10 tests)
- Matrícula (9 tests)
- Evaluación (10 tests)
- Asistencia (10 tests)
- Importación (10 tests)

### Frontend

```bash
cd frontend

# Ejecutar todos los tests
./test-suite.sh

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Con coverage
npm run test -- --coverage
```

**Tests implementados: 38+**
- Component tests (7)
- Hook tests (8)
- E2E tests (23)

### Master Test Suite

```bash
# Ejecutar TODOS los tests
./test-all.sh

# Con coverage
./test-all.sh --coverage

# Modo rápido
./test-all.sh --quick
```

**Coverage objetivo:**
- Backend: ≥ 80%
- Frontend: ≥ 70%
- E2E: 100% de flujos críticos

Ver guía completa: **[TESTING.md](TESTING.md)**

---

## 🚀 Deployment

### Backend a Cloud Run

```bash
cd backend
chmod +x deploy.sh
./deploy.sh production
```

### Frontend a Firebase Hosting

```bash
cd frontend
chmod +x deploy.sh
./deploy.sh production
```

### Setup Inicial GCP

```bash
cd backend
chmod +x setup-gcp.sh
./setup-gcp.sh
```

Ver guía completa: **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 📚 Documentación

### Guías Disponibles

- **[TESTING.md](TESTING.md)** - Guía completa de testing
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de deployment a GCP
- **[PRE-DEPLOYMENT-CHECKLIST.md](PRE-DEPLOYMENT-CHECKLIST.md)** - Checklist pre-deployment

### Scripts Útiles

```bash
# Ver estado de servicios
./scripts/gcp-helper.sh status

# Ver logs en tiempo real
./scripts/gcp-helper.sh logs

# Health check completo
./scripts/gcp-helper.sh health-check

# Ejecutar migraciones
./scripts/gcp-helper.sh run-migrations
```

---

## 💰 Estimación de Costos (GCP)

### Producción (100 tenants, carga media)

| Servicio | Costo Mensual |
|----------|---------------|
| Cloud Run (Backend) | $50-100 |
| Cloud SQL MySQL | $100-200 |
| Cloud Storage | $5-20 |
| Firebase Hosting | Gratis |
| Secret Manager | ~$1 |
| **Total Estimado** | **$156-321/mes** |

**Costo por tenant**: ~$1.56-3.21/mes

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ en Perú para Instituciones Educativas**

[Website](https://peepos.app) • [Documentación](https://docs.peepos.app) • [Demo](https://demo.peepos.app)

</div>
