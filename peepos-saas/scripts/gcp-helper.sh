#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS - Google Cloud Helper Script
# Comandos útiles para gestión de la infraestructura
# ═══════════════════════════════════════════════════════════════

PROJECT_ID="peepos-saas"
REGION="us-central1"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ────────────────────────────────────────────────────────────────
# Función para mostrar ayuda
# ────────────────────────────────────────────────────────────────
show_help() {
    cat << EOF
╔═══════════════════════════════════════════════════════════════╗
║              PEEPOS GCP Helper Script                         ║
╚═══════════════════════════════════════════════════════════════╝

Uso: ./gcp-helper.sh <comando>

Comandos Disponibles:

  📊 INFORMACIÓN
    status              - Ver estado de todos los servicios
    info                - Información completa del proyecto
    urls                - Mostrar URLs de servicios

  🔑 SECRETS
    list-secrets        - Listar todos los secrets
    create-secret       - Crear un nuevo secret
    update-secret       - Actualizar un secret existente
    view-secret         - Ver contenido de un secret

  🗄️  BASE DE DATOS
    db-connect          - Conectar a Cloud SQL via proxy
    db-status           - Ver estado de Cloud SQL
    db-backup           - Crear backup manual
    run-migrations      - Ejecutar migraciones pendientes

  📝 LOGS
    logs                - Ver logs del backend en tiempo real
    logs-sql            - Ver logs de Cloud SQL
    logs-errors         - Ver solo errores

  🚀 DEPLOYMENT
    deploy-backend      - Deploy rápido del backend
    deploy-frontend     - Deploy rápido del frontend
    deploy-all          - Deploy backend y frontend

  🔧 MANTENIMIENTO
    scale-up            - Escalar servicios (más recursos)
    scale-down          - Reducir servicios (menos costos)
    clear-cache         - Limpiar cache de la aplicación
    restart             - Reiniciar servicios

  🧹 LIMPIEZA
    cleanup-images      - Eliminar imágenes Docker antiguas
    cleanup-logs        - Eliminar logs antiguos

  🆘 TROUBLESHOOTING
    health-check        - Verificar health de todos los servicios
    debug               - Modo debug con información completa
    test-connectivity   - Test de conectividad entre servicios

Ejemplos:
  ./gcp-helper.sh status
  ./gcp-helper.sh logs
  ./gcp-helper.sh deploy-backend

EOF
}

# ────────────────────────────────────────────────────────────────
# Funciones de Información
# ────────────────────────────────────────────────────────────────
cmd_status() {
    log_info "Verificando estado de servicios..."
    echo ""

    # Cloud Run
    echo "🚀 Cloud Run Services:"
    gcloud run services list --region=$REGION --project=$PROJECT_ID --format="table(SERVICE,URL,LAST_DEPLOYED_BY,LAST_MODIFIED_AT)"
    echo ""

    # Cloud SQL
    echo "🗄️  Cloud SQL Instances:"
    gcloud sql instances list --project=$PROJECT_ID --format="table(NAME,DATABASE_VERSION,REGION,TIER,STATUS)"
    echo ""

    # Firebase
    echo "🔥 Firebase Hosting:"
    firebase hosting:sites:list --project=$PROJECT_ID 2>/dev/null || echo "  Ejecuta 'firebase login' primero"
    echo ""
}

cmd_info() {
    log_info "Información del Proyecto"
    echo ""
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo ""

    # URLs
    BACKEND_URL=$(gcloud run services describe peepos-api --region=$REGION --project=$PROJECT_ID --format='value(status.url)' 2>/dev/null)
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: https://$PROJECT_ID.web.app"
    echo ""

    # Costos estimados
    log_info "Recursos activos:"
    gcloud compute networks vpc-access connectors list --region=$REGION --project=$PROJECT_ID 2>/dev/null
}

cmd_urls() {
    log_info "URLs de Servicios"
    echo ""

    BACKEND_URL=$(gcloud run services describe peepos-api --region=$REGION --project=$PROJECT_ID --format='value(status.url)' 2>/dev/null)

    echo "🔗 Backend API:"
    echo "   $BACKEND_URL"
    echo "   $BACKEND_URL/api/v1/health"
    echo ""

    echo "🔗 Frontend:"
    echo "   https://$PROJECT_ID.web.app"
    echo "   https://$PROJECT_ID.firebaseapp.com"
    echo ""

    echo "🔗 Consoles:"
    echo "   Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
    echo "   Cloud SQL: https://console.cloud.google.com/sql?project=$PROJECT_ID"
    echo "   Firebase: https://console.firebase.google.com/project/$PROJECT_ID"
}

# ────────────────────────────────────────────────────────────────
# Funciones de Secrets
# ────────────────────────────────────────────────────────────────
cmd_list_secrets() {
    log_info "Secrets en Secret Manager"
    gcloud secrets list --project=$PROJECT_ID --format="table(NAME,CREATED,REPLICATION)"
}

cmd_create_secret() {
    read -p "Nombre del secret: " SECRET_NAME
    read -sp "Valor del secret: " SECRET_VALUE
    echo ""

    echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID

    log_success "Secret '$SECRET_NAME' creado"
}

cmd_update_secret() {
    read -p "Nombre del secret a actualizar: " SECRET_NAME
    read -sp "Nuevo valor: " SECRET_VALUE
    echo ""

    echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME \
        --data-file=- \
        --project=$PROJECT_ID

    log_success "Secret '$SECRET_NAME' actualizado"
}

cmd_view_secret() {
    read -p "Nombre del secret: " SECRET_NAME

    gcloud secrets versions access latest \
        --secret=$SECRET_NAME \
        --project=$PROJECT_ID
}

# ────────────────────────────────────────────────────────────────
# Funciones de Base de Datos
# ────────────────────────────────────────────────────────────────
cmd_db_connect() {
    log_info "Iniciando Cloud SQL Proxy..."

    # Descargar proxy si no existe
    if [ ! -f "./cloud-sql-proxy" ]; then
        log_info "Descargando Cloud SQL Proxy..."
        curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
        chmod +x cloud-sql-proxy
    fi

    INSTANCE_CONNECTION=$(gcloud sql instances describe peepos-mysql-prod --project=$PROJECT_ID --format='value(connectionName)')

    log_info "Connection: $INSTANCE_CONNECTION"
    log_info "Conectando en localhost:3306..."

    ./cloud-sql-proxy $INSTANCE_CONNECTION &
    PROXY_PID=$!

    echo ""
    log_success "Proxy iniciado (PID: $PROXY_PID)"
    echo "Conecta con: mysql -h 127.0.0.1 -u peepos_app -p peepos_central"
    echo ""
    read -p "Presiona Enter para detener el proxy..."

    kill $PROXY_PID
    log_success "Proxy detenido"
}

cmd_db_status() {
    log_info "Estado de Cloud SQL"
    gcloud sql instances describe peepos-mysql-prod --project=$PROJECT_ID --format="table(name,state,databaseVersion,region,tier,ipAddresses[0].ipAddress)"
}

cmd_db_backup() {
    log_info "Creando backup manual..."
    BACKUP_ID="manual-backup-$(date +%Y%m%d-%H%M%S)"

    gcloud sql backups create \
        --instance=peepos-mysql-prod \
        --description="$BACKUP_ID" \
        --project=$PROJECT_ID

    log_success "Backup creado: $BACKUP_ID"
}

cmd_run_migrations() {
    log_info "Ejecutando migraciones..."
    gcloud run jobs execute peepos-migrations \
        --region=$REGION \
        --project=$PROJECT_ID \
        --wait

    log_success "Migraciones completadas"
}

# ────────────────────────────────────────────────────────────────
# Funciones de Logs
# ────────────────────────────────────────────────────────────────
cmd_logs() {
    log_info "Logs del backend (tiempo real)..."
    gcloud run services logs tail peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID
}

cmd_logs_sql() {
    log_info "Logs de Cloud SQL..."
    gcloud sql operations list \
        --instance=peepos-mysql-prod \
        --project=$PROJECT_ID \
        --limit=20
}

cmd_logs_errors() {
    log_info "Solo errores (últimos 50)..."
    gcloud run services logs read peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID \
        --limit=50 \
        --filter="severity>=ERROR"
}

# ────────────────────────────────────────────────────────────────
# Funciones de Deployment
# ────────────────────────────────────────────────────────────────
cmd_deploy_backend() {
    log_info "Deploying backend..."
    cd backend && ./deploy.sh production
}

cmd_deploy_frontend() {
    log_info "Deploying frontend..."
    cd frontend && ./deploy.sh production
}

cmd_deploy_all() {
    log_info "Deploying backend y frontend..."
    cmd_deploy_backend
    cmd_deploy_frontend
}

# ────────────────────────────────────────────────────────────────
# Funciones de Mantenimiento
# ────────────────────────────────────────────────────────────────
cmd_scale_up() {
    log_info "Escalando servicios (más recursos)..."
    gcloud run services update peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID \
        --memory=4Gi \
        --cpu=4 \
        --min-instances=2 \
        --max-instances=200

    log_success "Servicios escalados"
}

cmd_scale_down() {
    log_info "Reduciendo servicios (ahorro de costos)..."
    gcloud run services update peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=10

    log_success "Servicios reducidos"
}

cmd_clear_cache() {
    log_info "Limpiando cache de Laravel..."
    # Ejecutar comando en Cloud Run
    log_warning "Funcionalidad en desarrollo"
}

cmd_restart() {
    log_info "Reiniciando servicios..."
    gcloud run services update peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID \
        --no-traffic

    sleep 5

    gcloud run services update peepos-api \
        --region=$REGION \
        --project=$PROJECT_ID \
        --to-latest

    log_success "Servicios reiniciados"
}

# ────────────────────────────────────────────────────────────────
# Funciones de Limpieza
# ────────────────────────────────────────────────────────────────
cmd_cleanup_images() {
    log_info "Limpiando imágenes Docker antiguas..."
    gcloud container images list-tags gcr.io/$PROJECT_ID/peepos-backend \
        --filter='-tags:*' \
        --format='get(digest)' \
        --limit=unlimited | \
    tail -n +11 | \
    while read digest; do
        gcloud container images delete "gcr.io/$PROJECT_ID/peepos-backend@$digest" --quiet
    done

    log_success "Limpieza completada"
}

# ────────────────────────────────────────────────────────────────
# Funciones de Troubleshooting
# ────────────────────────────────────────────────────────────────
cmd_health_check() {
    log_info "Verificando health de servicios..."
    echo ""

    BACKEND_URL=$(gcloud run services describe peepos-api --region=$REGION --project=$PROJECT_ID --format='value(status.url)' 2>/dev/null)

    echo "🔍 Backend API Health Check:"
    curl -s "$BACKEND_URL/api/v1/health" | jq . || echo "❌ Backend no responde"
    echo ""

    echo "🔍 Cloud SQL Status:"
    gcloud sql instances describe peepos-mysql-prod --project=$PROJECT_ID --format='value(state)' || echo "❌ Cloud SQL no disponible"
    echo ""
}

cmd_debug() {
    log_info "Información de Debug Completa"
    echo ""

    cmd_status
    echo "════════════════════════════════════════"
    cmd_health_check
    echo "════════════════════════════════════════"
    cmd_logs_errors
}

# ────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────
COMMAND=${1:-help}

case $COMMAND in
    # Información
    status) cmd_status ;;
    info) cmd_info ;;
    urls) cmd_urls ;;

    # Secrets
    list-secrets) cmd_list_secrets ;;
    create-secret) cmd_create_secret ;;
    update-secret) cmd_update_secret ;;
    view-secret) cmd_view_secret ;;

    # Base de datos
    db-connect) cmd_db_connect ;;
    db-status) cmd_db_status ;;
    db-backup) cmd_db_backup ;;
    run-migrations) cmd_run_migrations ;;

    # Logs
    logs) cmd_logs ;;
    logs-sql) cmd_logs_sql ;;
    logs-errors) cmd_logs_errors ;;

    # Deployment
    deploy-backend) cmd_deploy_backend ;;
    deploy-frontend) cmd_deploy_frontend ;;
    deploy-all) cmd_deploy_all ;;

    # Mantenimiento
    scale-up) cmd_scale_up ;;
    scale-down) cmd_scale_down ;;
    clear-cache) cmd_clear_cache ;;
    restart) cmd_restart ;;

    # Limpieza
    cleanup-images) cmd_cleanup_images ;;

    # Troubleshooting
    health-check) cmd_health_check ;;
    debug) cmd_debug ;;

    # Help
    help|--help|-h) show_help ;;

    *)
        log_error "Comando desconocido: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
