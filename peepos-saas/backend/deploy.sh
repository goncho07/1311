#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS Backend - Script de Deployment a Google Cloud Run
# ═══════════════════════════════════════════════════════════════
#
# Uso:
#   ./deploy.sh [environment]
#
# Environments:
#   production (default)
#   staging
#
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# ────────────────────────────────────────────────────────────────
# Configuración
# ────────────────────────────────────────────────────────────────
ENVIRONMENT="${1:-production}"
PROJECT_ID="peepos-saas"
REGION="us-central1"
SERVICE_NAME="peepos-api"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ────────────────────────────────────────────────────────────────
# Funciones auxiliares
# ────────────────────────────────────────────────────────────────
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ────────────────────────────────────────────────────────────────
# Banner
# ────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀  PEEPOS BACKEND DEPLOYMENT TO GOOGLE CLOUD RUN  🚀   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
log_info "Environment: $ENVIRONMENT"
log_info "Project: $PROJECT_ID"
log_info "Region: $REGION"
echo ""

# ────────────────────────────────────────────────────────────────
# Validaciones previas
# ────────────────────────────────────────────────────────────────
log_info "Verificando prerequisitos..."

# Verificar que gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI no está instalado"
    log_info "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticación
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    log_error "No estás autenticado en gcloud"
    log_info "Ejecuta: gcloud auth login"
    exit 1
fi

log_success "Prerequisitos verificados"

# ────────────────────────────────────────────────────────────────
# Configurar proyecto
# ────────────────────────────────────────────────────────────────
log_info "Configurando proyecto GCP..."
gcloud config set project $PROJECT_ID

# ────────────────────────────────────────────────────────────────
# Habilitar APIs necesarias
# ────────────────────────────────────────────────────────────────
log_info "Habilitando APIs de Google Cloud..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  --quiet

log_success "APIs habilitadas"

# ────────────────────────────────────────────────────────────────
# Configurar secrets (solo si no existen)
# ────────────────────────────────────────────────────────────────
log_info "Verificando secrets en Secret Manager..."

check_and_create_secret() {
    local SECRET_NAME=$1
    local SECRET_DESCRIPTION=$2

    if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &> /dev/null; then
        log_warning "Secret '$SECRET_NAME' ya existe, saltando..."
    else
        log_warning "Secret '$SECRET_NAME' no existe"
        log_info "Por favor, crea el secret manualmente con:"
        echo "  echo -n 'YOUR_VALUE' | gcloud secrets create $SECRET_NAME --data-file=-"
        echo ""
    fi
}

check_and_create_secret "laravel-app-key" "Laravel APP_KEY"
check_and_create_secret "mysql-password" "MySQL Database Password"
check_and_create_secret "gemini-api-key" "Google Gemini API Key"

# ────────────────────────────────────────────────────────────────
# Configurar service account (si no existe)
# ────────────────────────────────────────────────────────────────
log_info "Configurando service account..."

SERVICE_ACCOUNT="peepos-api@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID &> /dev/null; then
    log_warning "Service account ya existe"
else
    log_info "Creando service account..."
    gcloud iam service-accounts create peepos-api \
      --display-name="Peepos API Service Account" \
      --project=$PROJECT_ID

    log_success "Service account creado"
fi

# Otorgar permisos necesarios
log_info "Otorgando permisos al service account..."

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudsql.client" \
  --quiet || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet || true

log_success "Permisos otorgados"

# ────────────────────────────────────────────────────────────────
# Confirmar deployment
# ────────────────────────────────────────────────────────────────
echo ""
log_warning "¿Deseas continuar con el deployment a $ENVIRONMENT?"
read -p "Presiona Enter para continuar o Ctrl+C para cancelar..."
echo ""

# ────────────────────────────────────────────────────────────────
# Build y Deploy usando Cloud Build
# ────────────────────────────────────────────────────────────────
log_info "Iniciando build y deployment..."

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_APP_ENV=$ENVIRONMENT \
  --project=$PROJECT_ID

log_success "Build y deployment completado"

# ────────────────────────────────────────────────────────────────
# Verificar deployment
# ────────────────────────────────────────────────────────────────
log_info "Verificando deployment..."

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format='value(status.url)')

echo ""
log_success "Deployment exitoso!"
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT INFO                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Service URL: $SERVICE_URL"
echo "📊 Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo ""
log_info "Testing health endpoint..."
curl -s "$SERVICE_URL/api/v1/health" || log_warning "Health check falló"
echo ""
echo ""
log_success "¡Deployment completado exitosamente! 🎉"
echo ""
