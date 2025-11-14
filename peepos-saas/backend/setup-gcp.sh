#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS Backend - Script de Configuración Inicial de GCP
# ═══════════════════════════════════════════════════════════════
#
# Este script configura todos los recursos necesarios en GCP
# para ejecutar Peepos Backend en Cloud Run
#
# Ejecutar UNA VEZ antes del primer deployment
#
# ═══════════════════════════════════════════════════════════════

set -e

# ────────────────────────────────────────────────────────────────
# Configuración
# ────────────────────────────────────────────────────────────────
PROJECT_ID="peepos-saas"
REGION="us-central1"
ZONE="us-central1-a"

# Cloud SQL
DB_INSTANCE_NAME="peepos-mysql-prod"
DB_VERSION="MYSQL_8_0"
DB_TIER="db-n1-standard-2"
DB_NAME="peepos_central"
DB_USER="peepos_app"

# VPC
VPC_CONNECTOR_NAME="peepos-connector"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ────────────────────────────────────────────────────────────────
# Banner
# ────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🔧  PEEPOS GCP INITIAL SETUP SCRIPT  🔧           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

log_warning "Este script configurará los siguientes recursos en GCP:"
echo "  • Cloud SQL MySQL 8.0 Instance"
echo "  • VPC Connector para acceso privado"
echo "  • Secret Manager secrets"
echo "  • Service Accounts e IAM roles"
echo "  • Cloud Storage bucket"
echo ""
log_warning "Proyecto: $PROJECT_ID"
log_warning "Región: $REGION"
echo ""
read -p "¿Continuar? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# ────────────────────────────────────────────────────────────────
# 1. Configurar proyecto y habilitar APIs
# ────────────────────────────────────────────────────────────────
log_info "Configurando proyecto GCP..."
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

log_info "Habilitando APIs necesarias (esto puede tardar unos minutos)..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  compute.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --quiet

log_success "APIs habilitadas"

# ────────────────────────────────────────────────────────────────
# 2. Crear Cloud SQL Instance
# ────────────────────────────────────────────────────────────────
log_info "Creando Cloud SQL Instance..."

if gcloud sql instances describe $DB_INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
    log_warning "Cloud SQL instance ya existe"
else
    log_info "Creando nueva instancia MySQL... (esto tomará varios minutos)"

    gcloud sql instances create $DB_INSTANCE_NAME \
      --database-version=$DB_VERSION \
      --tier=$DB_TIER \
      --region=$REGION \
      --network=default \
      --no-assign-ip \
      --enable-bin-log \
      --backup-start-time=03:00 \
      --maintenance-window-day=SUN \
      --maintenance-window-hour=04 \
      --project=$PROJECT_ID

    log_success "Cloud SQL instance creada"

    # Generar contraseña aleatoria
    DB_PASSWORD=$(openssl rand -base64 32)

    log_info "Configurando usuario de base de datos..."
    gcloud sql users create $DB_USER \
      --instance=$DB_INSTANCE_NAME \
      --password="$DB_PASSWORD" \
      --project=$PROJECT_ID

    log_info "Creando base de datos..."
    gcloud sql databases create $DB_NAME \
      --instance=$DB_INSTANCE_NAME \
      --charset=utf8mb4 \
      --collation=utf8mb4_unicode_ci \
      --project=$PROJECT_ID

    log_success "Base de datos configurada"

    # Guardar password en Secret Manager
    echo -n "$DB_PASSWORD" | gcloud secrets create mysql-password --data-file=- --project=$PROJECT_ID
    log_success "Password guardada en Secret Manager"

    log_warning "IMPORTANTE: Guarda esta información:"
    echo "  DB Instance: $DB_INSTANCE_NAME"
    echo "  DB Name: $DB_NAME"
    echo "  DB User: $DB_USER"
    echo "  DB Password: (guardada en Secret Manager: mysql-password)"
    echo ""
fi

# ────────────────────────────────────────────────────────────────
# 3. Crear VPC Connector
# ────────────────────────────────────────────────────────────────
log_info "Creando VPC Connector..."

if gcloud compute networks vpc-access connectors describe $VPC_CONNECTOR_NAME \
  --region=$REGION --project=$PROJECT_ID &> /dev/null; then
    log_warning "VPC Connector ya existe"
else
    gcloud compute networks vpc-access connectors create $VPC_CONNECTOR_NAME \
      --region=$REGION \
      --network=default \
      --range=10.8.0.0/28 \
      --project=$PROJECT_ID

    log_success "VPC Connector creado"
fi

# ────────────────────────────────────────────────────────────────
# 4. Crear Cloud Storage Bucket
# ────────────────────────────────────────────────────────────────
BUCKET_NAME="${PROJECT_ID}-storage"

log_info "Creando Cloud Storage bucket..."

if gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
    log_warning "Bucket ya existe"
else
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/
    log_success "Bucket creado: gs://$BUCKET_NAME"
fi

# ────────────────────────────────────────────────────────────────
# 5. Configurar Secrets (interactivo)
# ────────────────────────────────────────────────────────────────
log_info "Configurando secrets en Secret Manager..."

create_secret_interactive() {
    local SECRET_NAME=$1
    local SECRET_DESC=$2

    if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &> /dev/null; then
        log_warning "Secret '$SECRET_NAME' ya existe"
    else
        echo ""
        log_info "Creando secret: $SECRET_DESC"
        read -sp "Ingresa el valor para $SECRET_NAME: " SECRET_VALUE
        echo ""
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME \
          --data-file=- \
          --replication-policy="automatic" \
          --project=$PROJECT_ID
        log_success "Secret '$SECRET_NAME' creado"
    fi
}

# Laravel APP_KEY
if gcloud secrets describe laravel-app-key --project=$PROJECT_ID &> /dev/null; then
    log_warning "Secret 'laravel-app-key' ya existe"
else
    log_info "Generando Laravel APP_KEY..."
    APP_KEY="base64:$(openssl rand -base64 32)"
    echo -n "$APP_KEY" | gcloud secrets create laravel-app-key \
      --data-file=- \
      --replication-policy="automatic" \
      --project=$PROJECT_ID
    log_success "Laravel APP_KEY generado y guardado"
fi

# Otros secrets
create_secret_interactive "gemini-api-key" "Google Gemini API Key"

# ────────────────────────────────────────────────────────────────
# 6. Crear y configurar Service Account
# ────────────────────────────────────────────────────────────────
log_info "Configurando service account..."

SERVICE_ACCOUNT="peepos-api@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID &> /dev/null; then
    log_warning "Service account ya existe"
else
    gcloud iam service-accounts create peepos-api \
      --display-name="Peepos API Service Account" \
      --project=$PROJECT_ID
    log_success "Service account creado"
fi

log_info "Otorgando permisos..."

# Permisos para Cloud SQL
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudsql.client" \
  --quiet

# Permisos para Secret Manager
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

# Permisos para Cloud Storage
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT:objectAdmin gs://$BUCKET_NAME

log_success "Permisos configurados"

# ────────────────────────────────────────────────────────────────
# 7. Resumen
# ────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   SETUP COMPLETADO                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
log_success "Todos los recursos fueron creados exitosamente"
echo ""
log_info "Recursos creados:"
echo "  ✓ Cloud SQL: $DB_INSTANCE_NAME"
echo "  ✓ Database: $DB_NAME"
echo "  ✓ VPC Connector: $VPC_CONNECTOR_NAME"
echo "  ✓ Storage Bucket: gs://$BUCKET_NAME"
echo "  ✓ Service Account: $SERVICE_ACCOUNT"
echo ""
log_info "Próximos pasos:"
echo "  1. Actualiza backend/.env.cloudrun con la configuración correcta"
echo "  2. Ejecuta ./deploy.sh para hacer el primer deployment"
echo ""
log_success "¡Configuración inicial completada! 🎉"
echo ""
