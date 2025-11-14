#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS - Script de Deployment para Google Cloud SQL
# ═══════════════════════════════════════════════════════════════
#
# Este script configura:
# 1. Instancia Cloud SQL MySQL 8.0
# 2. Base de datos central
# 3. Usuario de aplicación
# 4. Migraciones
# 5. Seeders
#
# Uso: ./deploy-cloud-sql.sh [opción]
#   setup     - Configurar Cloud SQL por primera vez
#   migrate   - Ejecutar migraciones
#   seed      - Ejecutar seeders
#   proxy     - Iniciar Cloud SQL Proxy
#   all       - Ejecutar todo
#
# ═══════════════════════════════════════════════════════════════

set -e  # Salir si hay errores

# ────────────────────────────────────────────────────────────────
# Colores para output
# ────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ────────────────────────────────────────────────────────────────
# Configuración (MODIFICAR SEGÚN TU PROYECTO)
# ────────────────────────────────────────────────────────────────
PROJECT_ID="tu-proyecto-id"
REGION="us-central1"
INSTANCE_NAME="peepos-mysql-prod"
DB_NAME="peepos_central"
DB_USER="peepos_app"
DB_TIER="db-n1-standard-2"
STORAGE_SIZE="20GB"

# ────────────────────────────────────────────────────────────────
# Funciones Helper
# ────────────────────────────────────────────────────────────────

print_step() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ────────────────────────────────────────────────────────────────
# Verificar dependencias
# ────────────────────────────────────────────────────────────────

check_dependencies() {
    print_step "Verificando dependencias"

    # Verificar gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI no está instalado"
        echo "Instalar desde: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "gcloud CLI instalado"

    # Verificar autenticación
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        print_error "No hay cuenta autenticada en gcloud"
        echo "Ejecutar: gcloud auth login"
        exit 1
    fi
    print_success "Cuenta autenticada"

    # Verificar proyecto configurado
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        print_warning "Proyecto actual: $CURRENT_PROJECT"
        print_info "Cambiando a proyecto: $PROJECT_ID"
        gcloud config set project $PROJECT_ID
    fi
    print_success "Proyecto configurado: $PROJECT_ID"
}

# ────────────────────────────────────────────────────────────────
# Crear instancia Cloud SQL
# ────────────────────────────────────────────────────────────────

setup_cloud_sql() {
    print_step "Configurando Cloud SQL"

    # Verificar si la instancia ya existe
    if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
        print_warning "La instancia $INSTANCE_NAME ya existe"
        return 0
    fi

    print_info "Creando instancia MySQL 8.0..."
    print_warning "Esto puede tomar 5-10 minutos"

    # Generar password seguro
    ROOT_PASSWORD=$(openssl rand -base64 32)
    echo $ROOT_PASSWORD > .root_password_temp

    gcloud sql instances create $INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=$DB_TIER \
        --region=$REGION \
        --root-password=$ROOT_PASSWORD \
        --storage-type=SSD \
        --storage-size=$STORAGE_SIZE \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04 \
        --enable-bin-log \
        --database-flags=character_set_server=utf8mb4,max_connections=200 \
        --project=$PROJECT_ID

    print_success "Instancia Cloud SQL creada"
    print_warning "Root password guardado en: .root_password_temp"
    print_warning "Guardar en lugar seguro y eliminar el archivo"

    # Crear base de datos central
    print_info "Creando base de datos central..."
    gcloud sql databases create $DB_NAME \
        --instance=$INSTANCE_NAME \
        --charset=utf8mb4 \
        --collation=utf8mb4_unicode_ci \
        --project=$PROJECT_ID

    print_success "Base de datos $DB_NAME creada"

    # Crear usuario de aplicación
    print_info "Creando usuario de aplicación..."
    APP_PASSWORD=$(openssl rand -base64 32)
    echo $APP_PASSWORD > .app_password_temp

    gcloud sql users create $DB_USER \
        --instance=$INSTANCE_NAME \
        --password=$APP_PASSWORD \
        --project=$PROJECT_ID

    print_success "Usuario $DB_USER creado"
    print_warning "App password guardado en: .app_password_temp"

    # Obtener connection name
    CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --format="value(connectionName)")

    print_success "Setup completado"
    echo ""
    print_info "Connection Name: $CONNECTION_NAME"
    print_info "Database: $DB_NAME"
    print_info "User: $DB_USER"
    echo ""
    print_warning "Guardar credenciales en Secret Manager:"
    echo "  gcloud secrets create db-password --data-file=.app_password_temp"
    echo ""
}

# ────────────────────────────────────────────────────────────────
# Iniciar Cloud SQL Proxy
# ────────────────────────────────────────────────────────────────

start_proxy() {
    print_step "Iniciando Cloud SQL Proxy"

    # Verificar si cloud_sql_proxy está instalado
    if ! command -v cloud_sql_proxy &> /dev/null; then
        print_error "cloud_sql_proxy no está instalado"
        echo "Descargar desde: https://cloud.google.com/sql/docs/mysql/sql-proxy#install"
        exit 1
    fi

    CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --format="value(connectionName)")

    print_info "Connection Name: $CONNECTION_NAME"
    print_info "Iniciando proxy en puerto 3306..."
    print_warning "Presionar Ctrl+C para detener"

    cloud_sql_proxy -instances=$CONNECTION_NAME=tcp:3306
}

# ────────────────────────────────────────────────────────────────
# Ejecutar migraciones
# ────────────────────────────────────────────────────────────────

run_migrations() {
    print_step "Ejecutando migraciones"

    print_info "Asegurarse de que Cloud SQL Proxy esté corriendo en otra terminal"
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi

    # Verificar archivo .env
    if [ ! -f .env ]; then
        print_error "Archivo .env no encontrado"
        print_info "Copiar .env.cloudrun a .env y configurar credenciales"
        exit 1
    fi

    # Migraciones de BD Central
    print_info "Ejecutando migraciones de BD Central..."
    php artisan migrate --path=database/migrations/central --force

    print_success "Migraciones completadas"
}

# ────────────────────────────────────────────────────────────────
# Ejecutar seeders
# ────────────────────────────────────────────────────────────────

run_seeders() {
    print_step "Ejecutando seeders"

    print_info "Asegurarse de que Cloud SQL Proxy esté corriendo en otra terminal"
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi

    # Seeder central
    print_info "Ejecutando CentralSeeder (creará tenant demo)..."
    php artisan db:seed --class=CentralSeeder --force

    print_success "Seeders completados"
}

# ────────────────────────────────────────────────────────────────
# Verificar estado
# ────────────────────────────────────────────────────────────────

check_status() {
    print_step "Estado de Cloud SQL"

    if ! gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
        print_error "Instancia $INSTANCE_NAME no existe"
        exit 1
    fi

    # Estado de la instancia
    STATE=$(gcloud sql instances describe $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --format="value(state)")

    echo "Instancia: $INSTANCE_NAME"
    echo "Estado: $STATE"
    echo "Región: $REGION"
    echo "Tier: $DB_TIER"
    echo ""

    # Bases de datos
    print_info "Bases de datos:"
    gcloud sql databases list --instance=$INSTANCE_NAME --project=$PROJECT_ID

    echo ""

    # Connection name
    CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --format="value(connectionName)")
    print_info "Connection Name: $CONNECTION_NAME"
}

# ────────────────────────────────────────────────────────────────
# Menú principal
# ────────────────────────────────────────────────────────────────

show_help() {
    echo "Uso: ./deploy-cloud-sql.sh [opción]"
    echo ""
    echo "Opciones:"
    echo "  setup     - Configurar Cloud SQL por primera vez"
    echo "  migrate   - Ejecutar migraciones"
    echo "  seed      - Ejecutar seeders"
    echo "  proxy     - Iniciar Cloud SQL Proxy"
    echo "  status    - Ver estado de Cloud SQL"
    echo "  all       - Ejecutar setup, migrate y seed"
    echo "  help      - Mostrar esta ayuda"
    echo ""
}

# ────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────

main() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  PEEPOS - Deployment Cloud SQL${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""

    case "${1:-help}" in
        setup)
            check_dependencies
            setup_cloud_sql
            ;;
        migrate)
            run_migrations
            ;;
        seed)
            run_seeders
            ;;
        proxy)
            start_proxy
            ;;
        status)
            check_status
            ;;
        all)
            check_dependencies
            setup_cloud_sql
            echo ""
            print_info "Iniciar Cloud SQL Proxy en otra terminal con:"
            print_info "./deploy-cloud-sql.sh proxy"
            echo ""
            read -p "Presionar Enter cuando el proxy esté corriendo..."
            run_migrations
            run_seeders
            ;;
        help|*)
            show_help
            ;;
    esac

    echo ""
}

main "$@"
