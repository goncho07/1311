# 🚀 PEEPOS - Guía de Deployment a Google Cloud

Esta guía describe el proceso completo de deployment de Peepos a Google Cloud Platform.

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Arquitectura de Deployment](#arquitectura-de-deployment)
- [Configuración Inicial](#configuración-inicial)
- [Backend Deployment (Cloud Run)](#backend-deployment)
- [Frontend Deployment (Firebase Hosting)](#frontend-deployment)
- [Post-Deployment](#post-deployment)
- [CI/CD Automatizado](#cicd-automatizado)
- [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisitos

### Software Requerido

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Instalar desde: https://cloud.google.com/sdk/docs/install

   # Verificar instalación
   gcloud --version
   ```

2. **Docker** (para builds locales)
   ```bash
   docker --version
   ```

3. **Firebase CLI** (para frontend)
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

4. **Node.js & npm** (v18 o superior)
   ```bash
   node --version
   npm --version
   ```

### Cuenta y Proyecto GCP

1. Tener una cuenta de Google Cloud Platform
2. Crear un proyecto: `peepos-saas` (o tu nombre preferido)
3. Habilitar facturación en el proyecto
4. Tener permisos de Owner o Editor

### Autenticación

```bash
# Login en gcloud
gcloud auth login

# Configurar proyecto
gcloud config set project peepos-saas

# Login en Firebase
firebase login
```

---

## 🏗️ Arquitectura de Deployment

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Firebase        │         │   Cloud Run       │        │
│  │  Hosting         │────────▶│   (Backend API)   │        │
│  │  (Frontend SPA)  │   HTTPS │   + Apache/PHP    │        │
│  └──────────────────┘         └─────────┬─────────┘        │
│                                          │                  │
│                                          │ Unix Socket      │
│                                          ▼                  │
│                                 ┌────────────────┐         │
│                                 │  Cloud SQL     │         │
│                                 │  MySQL 8.0     │         │
│                                 └────────────────┘         │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Secret Manager   │         │ Cloud Storage     │        │
│  │ (Credentials)    │         │ (File Uploads)    │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### URLs de Producción

- **Frontend**: `https://peepos-saas.web.app` o dominio custom
- **Backend API**: `https://peepos-api-xxxxxxxxxx-uc.a.run.app`
- **Health Check**: `https://[backend-url]/api/v1/health`

---

## ⚙️ Configuración Inicial

### Paso 1: Configuración Completa de GCP

Ejecutar el script de setup inicial (solo la primera vez):

```bash
cd peepos-saas/backend
chmod +x setup-gcp.sh
./setup-gcp.sh
```

Este script configura:
- ✅ Cloud SQL MySQL instance
- ✅ VPC Connector
- ✅ Service Accounts e IAM roles
- ✅ Secret Manager secrets
- ✅ Cloud Storage bucket

### Paso 2: Configurar Secrets Manualmente

Si necesitas agregar o actualizar secrets:

```bash
# Laravel APP_KEY
php artisan key:generate --show
echo -n "base64:YOUR_KEY_HERE" | gcloud secrets create laravel-app-key --data-file=-

# Database Password
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create mysql-password --data-file=-

# Gemini API Key
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-

# WhatsApp API Key (opcional)
echo -n "YOUR_WHATSAPP_KEY" | gcloud secrets create whatsapp-api-key --data-file=-
```

### Paso 3: Configurar Variables de Entorno

Editar `backend/.env.cloudrun` con tus valores:

```env
PROJECT_ID=peepos-saas
CLOUD_SQL_CONNECTION=peepos-saas:us-central1:peepos-mysql-prod
```

---

## 🔧 Backend Deployment

### Opción A: Deployment Automatizado (Recomendado)

```bash
cd peepos-saas/backend
chmod +x deploy.sh
./deploy.sh production
```

El script ejecuta:
1. ✓ Valida prerequisitos
2. ✓ Habilita APIs necesarias
3. ✓ Verifica secrets
4. ✓ Build de imagen Docker
5. ✓ Ejecuta migraciones
6. ✓ Deploy a Cloud Run
7. ✓ Health check

### Opción B: Deployment Manual

```bash
cd peepos-saas/backend

# Build y push usando Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# O build local
docker build -t gcr.io/peepos-saas/peepos-backend:latest .
docker push gcr.io/peepos-saas/peepos-backend:latest

# Deploy a Cloud Run
gcloud run deploy peepos-api \
  --image=gcr.io/peepos-saas/peepos-backend:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=100 \
  --add-cloudsql-instances=peepos-saas:us-central1:peepos-mysql-prod \
  --set-secrets=APP_KEY=laravel-app-key:latest \
  --set-secrets=DB_PASSWORD=mysql-password:latest \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
  --service-account=peepos-api@peepos-saas.iam.gserviceaccount.com
```

### Verificar Deployment del Backend

```bash
# Obtener URL del servicio
gcloud run services describe peepos-api \
  --region=us-central1 \
  --format='value(status.url)'

# Test health endpoint
curl https://[backend-url]/api/v1/health
```

---

## 🎨 Frontend Deployment

### Opción A: Deployment Automatizado (Recomendado)

```bash
cd peepos-saas/frontend
chmod +x deploy.sh
./deploy.sh production
```

El script ejecuta:
1. ✓ Instala dependencias
2. ✓ Configura variables de entorno
3. ✓ Ejecuta linter
4. ✓ Build optimizado para producción
5. ✓ Deploy a Firebase Hosting

### Opción B: Deployment Manual

```bash
cd peepos-saas/frontend

# Instalar dependencias
npm ci

# Configurar variables de entorno
cat > .env.production << EOF
VITE_API_BASE_URL=https://[backend-url]/api/v1
VITE_APP_NAME=Peepos
VITE_FIREBASE_PROJECT_ID=peepos-saas
EOF

# Build
npm run build

# Deploy
firebase deploy --only hosting --project=peepos-saas
```

### Verificar Deployment del Frontend

```bash
# Abrir en navegador
firebase open hosting:site --project=peepos-saas

# URL: https://peepos-saas.web.app
```

---

## 🔒 Post-Deployment

### 1. Ejecutar Migraciones Iniciales

```bash
# Crear Cloud Run Job para migraciones (primera vez)
gcloud run jobs create peepos-migrations \
  --image=gcr.io/peepos-saas/peepos-backend:latest \
  --region=us-central1 \
  --command=php \
  --args=artisan,migrate,--force \
  --set-cloudsql-instances=peepos-saas:us-central1:peepos-mysql-prod \
  --set-secrets=APP_KEY=laravel-app-key:latest \
  --set-secrets=DB_PASSWORD=mysql-password:latest \
  --service-account=peepos-api@peepos-saas.iam.gserviceaccount.com

# Ejecutar migraciones
gcloud run jobs execute peepos-migrations --region=us-central1 --wait
```

### 2. Seed de Datos Iniciales (Opcional)

```bash
gcloud run jobs create peepos-seed \
  --image=gcr.io/peepos-saas/peepos-backend:latest \
  --region=us-central1 \
  --command=php \
  --args=artisan,db:seed,--force \
  --set-cloudsql-instances=peepos-saas:us-central1:peepos-mysql-prod \
  --set-secrets=APP_KEY=laravel-app-key:latest \
  --set-secrets=DB_PASSWORD=mysql-password:latest \
  --service-account=peepos-api@peepos-saas.iam.gserviceaccount.com

gcloud run jobs execute peepos-seed --region=us-central1 --wait
```

### 3. Configurar Dominio Custom (Opcional)

#### Backend (Cloud Run)

```bash
# Agregar dominio custom
gcloud run domain-mappings create \
  --service=peepos-api \
  --domain=api.peepos.app \
  --region=us-central1

# Configurar DNS (Cloud DNS o tu proveedor)
# Agregar registro CNAME: api.peepos.app → ghs.googlehosted.com
```

#### Frontend (Firebase Hosting)

```bash
# Conectar dominio custom
firebase hosting:channel:deploy production --expires 30d

# En Firebase Console:
# Hosting → Add Custom Domain → peepos.app
```

### 4. Configurar SSL/TLS

Cloud Run y Firebase Hosting proveen SSL automático, pero puedes verificar:

```bash
# Verificar certificado
curl -vI https://api.peepos.app 2>&1 | grep -i ssl
```

### 5. Configurar Monitoring

```bash
# Ver logs del backend
gcloud run services logs read peepos-api --region=us-central1

# Ver métricas
gcloud monitoring dashboards create --config-from-file=monitoring-dashboard.json
```

---

## 🔄 CI/CD Automatizado

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy Backend
        run: |
          cd backend
          gcloud builds submit --config=cloudbuild.yaml

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          npx firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
```

### Cloud Build Triggers

```bash
# Crear trigger para deployments automáticos
gcloud builds triggers create github \
  --repo-name=peepos-saas \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern=^main$ \
  --build-config=backend/cloudbuild.yaml
```

---

## 🐛 Troubleshooting

### Backend Issues

#### 1. Error de conexión a Cloud SQL

```bash
# Verificar instancia Cloud SQL
gcloud sql instances describe peepos-mysql-prod

# Verificar VPC Connector
gcloud compute networks vpc-access connectors describe peepos-connector --region=us-central1

# Ver logs de Cloud Run
gcloud run services logs read peepos-api --region=us-central1 --limit=50
```

#### 2. Errores de permisos

```bash
# Verificar service account
gcloud projects get-iam-policy peepos-saas \
  --flatten="bindings[].members" \
  --filter="bindings.members:peepos-api@peepos-saas.iam.gserviceaccount.com"

# Agregar permisos faltantes
gcloud projects add-iam-policy-binding peepos-saas \
  --member="serviceAccount:peepos-api@peepos-saas.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

#### 3. Secrets no encontrados

```bash
# Listar secrets
gcloud secrets list

# Ver versiones de un secret
gcloud secrets versions list laravel-app-key

# Actualizar secret
echo -n "NEW_VALUE" | gcloud secrets versions add laravel-app-key --data-file=-
```

### Frontend Issues

#### 1. Build falla

```bash
# Limpiar caché
rm -rf node_modules dist
npm ci
npm run build
```

#### 2. CORS errors

Verificar en [backend/config/cors.php](backend/config/cors.php:27):
- Que el origen esté en `allowed_origins`
- Que coincida con `allowed_origins_patterns`

#### 3. API no responde

```bash
# Verificar URL del backend en .env.production
cat frontend/.env.production | grep VITE_API_BASE_URL

# Test directo
curl https://[backend-url]/api/v1/health
```

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Backend logs
gcloud run services logs tail peepos-api --region=us-central1

# Cloud SQL logs
gcloud sql operations list --instance=peepos-mysql-prod

# Firebase Hosting logs
firebase hosting:channel:list
```

### Métricas de Performance

- **Cloud Console**: https://console.cloud.google.com/run
- **Firebase Console**: https://console.firebase.google.com

---

## 💰 Estimación de Costos

### Monthly Estimates (producción baja-media)

- **Cloud Run**: ~$50-100/mes (con min instances = 1)
- **Cloud SQL**: ~$100-200/mes (db-n1-standard-2)
- **Cloud Storage**: ~$5-20/mes
- **Firebase Hosting**: Gratis hasta 10GB/mes
- **Secret Manager**: ~$1/mes

**Total estimado**: $150-350/mes

### Optimizaciones de Costo

```bash
# Reducir min instances en staging
gcloud run services update peepos-api \
  --min-instances=0 \
  --region=us-central1

# Usar instance más pequeña de Cloud SQL para desarrollo
gcloud sql instances patch peepos-mysql-prod \
  --tier=db-f1-micro
```

---

## 📚 Referencias

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for MySQL](https://cloud.google.com/sql/docs/mysql)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

---

## 🎉 ¡Deployment Exitoso!

Tu aplicación Peepos está ahora en producción en Google Cloud.

Para soporte o preguntas, contacta al equipo de desarrollo.
