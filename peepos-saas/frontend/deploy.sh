#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS Frontend - Script de Deployment a Firebase Hosting
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
echo "║   🚀  PEEPOS FRONTEND DEPLOYMENT TO FIREBASE HOSTING  🚀  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
log_info "Environment: $ENVIRONMENT"
log_info "Project: $PROJECT_ID"
echo ""

# ────────────────────────────────────────────────────────────────
# Validaciones previas
# ────────────────────────────────────────────────────────────────
log_info "Verificando prerequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado"
    exit 1
fi

# Verificar Firebase CLI
if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI no está instalado"
    log_info "Instala con: npm install -g firebase-tools"
    exit 1
fi

log_success "Prerequisitos verificados"

# ────────────────────────────────────────────────────────────────
# Instalar dependencias
# ────────────────────────────────────────────────────────────────
log_info "Instalando dependencias..."
npm ci --prefer-offline --no-audit

log_success "Dependencias instaladas"

# ────────────────────────────────────────────────────────────────
# Obtener URL del backend desde Cloud Run
# ────────────────────────────────────────────────────────────────
log_info "Obteniendo URL del backend..."

if command -v gcloud &> /dev/null; then
    BACKEND_URL=$(gcloud run services describe peepos-api \
      --region=us-central1 \
      --project=$PROJECT_ID \
      --format='value(status.url)' 2>/dev/null || echo "")

    if [ -z "$BACKEND_URL" ]; then
        log_warning "No se pudo obtener la URL del backend automáticamente"
        read -p "Ingresa la URL del backend: " BACKEND_URL
    else
        log_success "Backend URL: $BACKEND_URL"
    fi
else
    log_warning "gcloud CLI no está instalado"
    read -p "Ingresa la URL del backend: " BACKEND_URL
fi

# ────────────────────────────────────────────────────────────────
# Configurar variables de entorno para producción
# ────────────────────────────────────────────────────────────────
log_info "Configurando variables de entorno para $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    cat > .env.production << EOF
# ═══════════════════════════════════════════════════════════════
# PEEPOS Frontend - Production Environment
# Generado automáticamente por deploy.sh
# ═══════════════════════════════════════════════════════════════

# API Configuration
VITE_API_BASE_URL=$BACKEND_URL/api/v1
VITE_APP_NAME=Peepos

# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_AUTH_DOMAIN=$PROJECT_ID.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=$PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Application Settings
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_IMPORT_EXPORT=true
EOF
    log_success "Variables de entorno configuradas para producción"
else
    log_warning "Usando configuración de staging"
fi

# ────────────────────────────────────────────────────────────────
# Ejecutar linter (opcional)
# ────────────────────────────────────────────────────────────────
log_info "Ejecutando linter..."
npm run lint --silent || log_warning "Lint encontró algunos warnings"

# ────────────────────────────────────────────────────────────────
# Build para producción
# ────────────────────────────────────────────────────────────────
log_info "Building aplicación para producción..."
npm run build

# Verificar que el build se generó correctamente
if [ ! -d "dist" ]; then
    log_error "Error: No se generó la carpeta dist"
    exit 1
fi

log_success "Build completado exitosamente"

# ────────────────────────────────────────────────────────────────
# Estadísticas del build
# ────────────────────────────────────────────────────────────────
echo ""
log_info "📊 Estadísticas del build:"
echo ""
DIST_SIZE=$(du -sh dist | cut -f1)
echo "  📦 Tamaño total: $DIST_SIZE"

if [ -f "dist/index.html" ]; then
    NUM_FILES=$(find dist -type f | wc -l)
    echo "  📄 Archivos generados: $NUM_FILES"
fi

# Mostrar archivos JS principales
if [ -d "dist/assets" ]; then
    echo ""
    echo "  📜 Archivos JavaScript principales:"
    find dist/assets -name "*.js" -type f -exec du -h {} \; | sort -rh | head -5 | sed 's/^/     /'
fi
echo ""

# ────────────────────────────────────────────────────────────────
# Confirmar deployment
# ────────────────────────────────────────────────────────────────
log_warning "¿Deseas continuar con el deployment a Firebase Hosting ($ENVIRONMENT)?"
read -p "Presiona Enter para continuar o Ctrl+C para cancelar..."
echo ""

# ────────────────────────────────────────────────────────────────
# Deploy a Firebase Hosting
# ────────────────────────────────────────────────────────────────
log_info "Deploying a Firebase Hosting..."

if [ "$ENVIRONMENT" = "production" ]; then
    firebase deploy --only hosting --project=$PROJECT_ID
else
    firebase deploy --only hosting:staging --project=$PROJECT_ID
fi

log_success "Deployment completado"

# ────────────────────────────────────────────────────────────────
# Obtener URL del sitio
# ────────────────────────────────────────────────────────────────
log_info "Obteniendo URL del sitio..."

SITE_URL="https://$PROJECT_ID.web.app"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT INFO                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Site URL: $SITE_URL"
echo "📊 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo ""

# ────────────────────────────────────────────────────────────────
# Limpiar archivos temporales
# ────────────────────────────────────────────────────────────────
log_info "Limpiando archivos temporales..."
rm -f .env.production.local
log_success "Limpieza completada"

echo ""
log_success "¡Deployment completado exitosamente! 🎉"
echo ""
log_info "Puedes ver tu aplicación en: $SITE_URL"
echo ""
