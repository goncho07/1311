# 🚀 Guía de Deployment - Sistema Peepos

Esta guía detalla el proceso completo de deployment del sistema Peepos en Google Cloud Platform utilizando Cloud SQL MySQL y Cloud Run.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Cloud SQL](#configuración-de-cloud-sql)
3. [Configuración de Secrets](#configuración-de-secrets)
4. [Migraciones y Seeders](#migraciones-y-seeders)
5. [Deployment a Cloud Run](#deployment-a-cloud-run)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### Software Necesario

```bash
# Verificar instalaciones
gcloud --version          # Google Cloud SDK
php --version            # PHP 8.2+
composer --version       # Composer 2.x
cloud_sql_proxy --version # Cloud SQL Proxy
```

### Instalaciones

#### 1. Google Cloud SDK
```bash
# Linux/macOS
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Descargar desde: https://cloud.google.com/sdk/docs/install
```

#### 2. Cloud SQL Proxy
```bash
# Linux
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy
sudo mv cloud_sql_proxy /usr/local/bin/

# macOS
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy
sudo mv cloud_sql_proxy /usr/local/bin/

# Windows
# Descargar desde: https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe
```

### Configuración Inicial de GCP

```bash
# 1. Autenticarse
gcloud auth login

# 2. Configurar proyecto
gcloud config set project TU_PROJECT_ID

# 3. Habilitar APIs necesarias
gcloud services enable \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com
```

---

## 🗄️ Configuración de Cloud SQL

### Opción 1: Script Automatizado (Recomendado)

```bash
cd backend

# Hacer ejecutable el script
chmod +x deploy-cloud-sql.sh

# Editar configuración en deploy-cloud-sql.sh
nano deploy-cloud-sql.sh
# Modificar:
# - PROJECT_ID
# - REGION
# - INSTANCE_NAME

# Ejecutar setup completo
./deploy-cloud-sql.sh setup
```

### Opción 2: Manual

#### Paso 1: Crear Instancia Cloud SQL

```bash
# Variables
PROJECT_ID="tu-proyecto-id"
REGION="us-central1"
INSTANCE_NAME="peepos-mysql-prod"

# Crear instancia
gcloud sql instances create $INSTANCE_NAME \
  --database-version=MYSQL_8_0 \
  --tier=db-n1-standard-2 \
  --region=$REGION \
  --root-password=SECURE_ROOT_PASSWORD \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --enable-bin-log \
  --database-flags=character_set_server=utf8mb4,max_connections=200
```

⏱️ **Nota**: La creación toma 5-10 minutos.

#### Paso 2: Crear Base de Datos

```bash
gcloud sql databases create peepos_central \
  --instance=$INSTANCE_NAME \
  --charset=utf8mb4 \
  --collation=utf8mb4_unicode_ci
```

#### Paso 3: Crear Usuario de Aplicación

```bash
# Generar password seguro
APP_PASSWORD=$(openssl rand -base64 32)
echo $APP_PASSWORD > .app_password_temp

# Crear usuario
gcloud sql users create peepos_app \
  --instance=$INSTANCE_NAME \
  --password=$APP_PASSWORD
```

#### Paso 4: Obtener Connection Name

```bash
gcloud sql instances describe $INSTANCE_NAME \
  --format="value(connectionName)"

# Output: tu-proyecto:us-central1:peepos-mysql-prod
```

---

## 🔐 Configuración de Secrets

### Crear Secrets en Secret Manager

```bash
# 1. Password de base de datos
echo -n "tu_password_seguro" | gcloud secrets create db-password \
  --data-file=- \
  --replication-policy="automatic"

# 2. API Keys
echo -n "tu_gemini_api_key" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

echo -n "tu_whatsapp_api_key" | gcloud secrets create whatsapp-api-key \
  --data-file=- \
  --replication-policy="automatic"

# 3. App Key de Laravel
php artisan key:generate --show | gcloud secrets create app-key \
  --data-file=- \
  --replication-policy="automatic"

# 4. JWT Secret (si se usa)
openssl rand -base64 64 | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy="automatic"
```

### Otorgar Permisos al Service Account

```bash
# Service account de Cloud Run
SERVICE_ACCOUNT="[PROJECT_NUMBER]-compute@developer.gserviceaccount.com"

# Otorgar acceso a secrets
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Repetir para cada secret
```

---

## 🔄 Migraciones y Seeders

### Iniciar Cloud SQL Proxy (Terminal 1)

```bash
# Obtener connection name
CONNECTION_NAME=$(gcloud sql instances describe peepos-mysql-prod \
  --format="value(connectionName)")

# Iniciar proxy
cloud_sql_proxy -instances=$CONNECTION_NAME=tcp:3306
```

### Configurar .env Local (Terminal 2)

```bash
cd backend

# Copiar plantilla
cp .env.cloudrun .env

# Editar configuración
nano .env
```

Configurar:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peepos_central
DB_USERNAME=peepos_app
DB_PASSWORD=tu_password_seguro
```

### Ejecutar Migraciones

```bash
# Migraciones de BD Central
php artisan migrate --path=database/migrations/central --force

# Verificar
php artisan migrate:status --path=database/migrations/central
```

### Ejecutar Seeders

```bash
# Opción 1: Script automatizado
./deploy-cloud-sql.sh seed

# Opción 2: Manual
php artisan db:seed --class=CentralSeeder --force
```

### Verificar Datos

```bash
# Conectar a Cloud SQL
gcloud sql connect peepos-mysql-prod --user=peepos_app

# En MySQL
USE peepos_central;
SHOW TABLES;
SELECT * FROM tenants;
SHOW DATABASES LIKE 'peepos_tenant%';
```

---

## 📦 Deployment a Cloud Run

### 1. Crear Dockerfile

El Dockerfile ya está incluido en `backend/Dockerfile`.

### 2. Build y Push a Container Registry

```bash
cd backend

# Variables
PROJECT_ID="tu-proyecto-id"
IMAGE_NAME="peepos-api"
TAG="latest"

# Build
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG \
  --timeout=20m

# O usando Docker localmente
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG .
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG
```

### 3. Deploy a Cloud Run

```bash
# Variables
REGION="us-central1"
SERVICE_NAME="peepos-api"
CONNECTION_NAME="tu-proyecto:us-central1:peepos-mysql-prod"

# Deploy
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --cpu 2 \
  --memory 2Gi \
  --timeout 300 \
  --concurrency 80 \
  --set-cloudsql-instances $CONNECTION_NAME \
  --set-env-vars "APP_ENV=production,APP_DEBUG=false" \
  --set-secrets "DB_PASSWORD=db-password:latest,GEMINI_API_KEY=gemini-api-key:latest,WHATSAPP_API_KEY=whatsapp-api-key:latest,APP_KEY=app-key:latest" \
  --vpc-connector peepos-vpc-connector
```

### 4. Configurar Custom Domain (Opcional)

```bash
# Mapear dominio
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain api.peepos.app \
  --region $REGION

# Agregar registros DNS según las instrucciones
```

---

## ✅ Post-Deployment

### 1. Verificar Salud del Sistema

```bash
# Health check
curl https://api.peepos.app/api/v1/health

# Expected output:
# {
#   "status": "ok",
#   "timestamp": "2025-01-XX...",
#   "version": "1.0.0"
# }
```

### 2. Probar Autenticación

```bash
# Login con tenant demo
curl -X POST https://api.peepos.app/api/v1/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Code: demo-ricardo-palma" \
  -d '{
    "email": "director@ricardopalma.edu.pe",
    "password": "password"
  }'
```

### 3. Configurar Monitoreo

```bash
# Logs
gcloud run services logs read $SERVICE_NAME \
  --region $REGION \
  --limit 50

# Métricas
# Ver en: https://console.cloud.google.com/run
```

### 4. Configurar Alertas

```yaml
# alerting-policy.yaml
displayName: "API Response Time"
conditions:
  - displayName: "High Response Time"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_latencies"'
      comparison: COMPARISON_GT
      thresholdValue: 2000
      duration: 300s
```

```bash
gcloud alpha monitoring policies create --policy-from-file=alerting-policy.yaml
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to Cloud SQL"

```bash
# Verificar Cloud SQL Proxy
ps aux | grep cloud_sql_proxy

# Verificar connection name
gcloud sql instances describe peepos-mysql-prod \
  --format="value(connectionName)"

# Verificar permisos
gcloud projects get-iam-policy tu-proyecto-id \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:*compute*"
```

### Error: "Migration failed"

```bash
# Verificar conexión
php artisan tinker
>>> DB::connection('central')->getPdo();

# Ver errores detallados
php artisan migrate --path=database/migrations/central --force -vvv
```

### Error: "Tenant database not created"

```bash
# Verificar permisos del usuario
mysql -h 127.0.0.1 -u peepos_app -p

SHOW GRANTS FOR 'peepos_app'@'%';
# Debe tener: CREATE, DROP, ALTER, etc.
```

### Cloud Run: 503 Service Unavailable

```bash
# Verificar logs
gcloud run services logs read peepos-api --region us-central1 --limit 100

# Aumentar timeout y memoria si es necesario
gcloud run services update peepos-api \
  --timeout 300 \
  --memory 2Gi \
  --region us-central1
```

### Error: "Secret not found"

```bash
# Listar secrets
gcloud secrets list

# Verificar versiones
gcloud secrets versions list db-password

# Verificar permisos
gcloud secrets get-iam-policy db-password
```

---

## 📊 Comandos Útiles

### Ver Estado de Servicios

```bash
# Cloud SQL
gcloud sql instances list
gcloud sql operations list --instance=peepos-mysql-prod

# Cloud Run
gcloud run services list
gcloud run services describe peepos-api --region us-central1

# Secrets
gcloud secrets list
```

### Backups

```bash
# Backup manual
gcloud sql backups create \
  --instance=peepos-mysql-prod \
  --description="Backup manual $(date +%Y-%m-%d)"

# Listar backups
gcloud sql backups list --instance=peepos-mysql-prod

# Restaurar
gcloud sql backups restore [BACKUP_ID] \
  --backup-instance=peepos-mysql-prod
```

### Logs y Debugging

```bash
# Logs en tiempo real
gcloud run services logs tail peepos-api --region us-central1

# Logs de Cloud SQL
gcloud sql operations list --instance=peepos-mysql-prod
```

---

## 📝 Checklist de Deployment

- [ ] Instancia Cloud SQL creada y configurada
- [ ] Base de datos central creada
- [ ] Usuario de aplicación creado con permisos
- [ ] Secrets configurados en Secret Manager
- [ ] Migraciones ejecutadas exitosamente
- [ ] Tenant demo creado con seeders
- [ ] Imagen Docker construida y subida
- [ ] Servicio Cloud Run desplegado
- [ ] Variables de entorno configuradas
- [ ] Health check respondiendo correctamente
- [ ] Login funcionando con tenant demo
- [ ] Monitoreo y alertas configurados
- [ ] Backups automáticos habilitados
- [ ] Documentación actualizada

---

## 📚 Referencias

- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Laravel Deployment Guide](https://laravel.com/docs/10.x/deployment)

---

## 🆘 Soporte

Si encuentras problemas durante el deployment:

1. Revisar logs: `gcloud run services logs read peepos-api`
2. Verificar status de Cloud SQL: `./deploy-cloud-sql.sh status`
3. Consultar troubleshooting section arriba
4. Crear issue en el repositorio con logs detallados

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
