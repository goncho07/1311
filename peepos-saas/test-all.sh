#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS - Master Test Suite
# Ejecuta TODOS los tests del proyecto (Backend + Frontend + E2E)
# ═══════════════════════════════════════════════════════════════
#
# Uso:
#   ./test-all.sh [opciones]
#
# Opciones:
#   --quick         Solo tests rápidos
#   --coverage      Generar reportes de cobertura
#   --ci            Modo CI/CD
#   --skip-backend  Saltar tests de backend
#   --skip-frontend Saltar tests de frontend
#   --skip-e2e      Saltar tests E2E
#
# ═══════════════════════════════════════════════════════════════

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_section() { echo -e "${CYAN}═══ $1 ═══${NC}"; }

# Configuración
QUICK_MODE=false
COVERAGE=false
CI_MODE=false
SKIP_BACKEND=false
SKIP_FRONTEND=false
SKIP_E2E=false

# Parsear argumentos
for arg in "$@"; do
    case $arg in
        --quick) QUICK_MODE=true ;;
        --coverage) COVERAGE=true ;;
        --ci) CI_MODE=true ;;
        --skip-backend) SKIP_BACKEND=true ;;
        --skip-frontend) SKIP_FRONTEND=true ;;
        --skip-e2e) SKIP_E2E=true ;;
    esac
done

# Banner
clear
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║          🧪  PEEPOS MASTER TEST SUITE  🧪                ║"
echo "║                                                           ║"
echo "║  Ejecuta todos los tests del proyecto                    ║"
echo "║  Backend + Frontend + E2E                                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    log_info "Estructura esperada:"
    echo "  peepos-saas/"
    echo "  ├── backend/"
    echo "  ├── frontend/"
    echo "  └── test-all.sh"
    exit 1
fi

START_TIME=$(date +%s)

# Contadores
SUITES_PASSED=0
SUITES_FAILED=0
TESTS_TOTAL=0

# Opciones para scripts hijos
SCRIPT_OPTS=""
if $QUICK_MODE; then
    SCRIPT_OPTS="$SCRIPT_OPTS --quick"
fi
if $COVERAGE; then
    SCRIPT_OPTS="$SCRIPT_OPTS --coverage"
fi
if $CI_MODE; then
    SCRIPT_OPTS="$SCRIPT_OPTS --ci"
fi

# ═══════════════════════════════════════════════════════════════
# 1. BACKEND TESTS
# ═══════════════════════════════════════════════════════════════
if ! $SKIP_BACKEND; then
    echo ""
    log_section "PASO 1/3: BACKEND TESTS"
    echo ""

    if [ ! -f "backend/test-suite.sh" ]; then
        log_error "Script de tests de backend no encontrado"
        exit 1
    fi

    log_info "Ejecutando suite de tests backend..."
    cd backend

    # Dar permisos de ejecución
    chmod +x test-suite.sh

    # Ejecutar tests
    if ./test-suite.sh $SCRIPT_OPTS; then
        log_success "Backend tests: PASSED"
        ((SUITES_PASSED++))
    else
        log_error "Backend tests: FAILED"
        ((SUITES_FAILED++))
        if $CI_MODE; then
            exit 1
        fi
    fi

    cd ..
else
    log_warning "Saltando backend tests (--skip-backend)"
fi

# ═══════════════════════════════════════════════════════════════
# 2. FRONTEND TESTS
# ═══════════════════════════════════════════════════════════════
if ! $SKIP_FRONTEND; then
    echo ""
    log_section "PASO 2/3: FRONTEND TESTS"
    echo ""

    if [ ! -f "frontend/test-suite.sh" ]; then
        log_error "Script de tests de frontend no encontrado"
        exit 1
    fi

    log_info "Ejecutando suite de tests frontend..."
    cd frontend

    # Dar permisos de ejecución
    chmod +x test-suite.sh

    # Ejecutar tests
    if ./test-suite.sh $SCRIPT_OPTS; then
        log_success "Frontend tests: PASSED"
        ((SUITES_PASSED++))
    else
        log_error "Frontend tests: FAILED"
        ((SUITES_FAILED++))
        if $CI_MODE; then
            exit 1
        fi
    fi

    cd ..
else
    log_warning "Saltando frontend tests (--skip-frontend)"
fi

# ═══════════════════════════════════════════════════════════════
# 3. E2E TESTS
# ═══════════════════════════════════════════════════════════════
if ! $SKIP_E2E; then
    echo ""
    log_section "PASO 3/3: E2E TESTS"
    echo ""

    log_info "Ejecutando tests E2E con Playwright..."
    cd frontend

    # Verificar que Playwright está instalado
    if [ ! -d "node_modules/@playwright" ]; then
        log_warning "Playwright no está instalado, instalando..."
        npm ci
        npx playwright install --with-deps chromium
    fi

    # Ejecutar E2E tests
    if npx playwright test --project=chromium; then
        log_success "E2E tests: PASSED"
        ((SUITES_PASSED++))
    else
        log_error "E2E tests: FAILED"
        ((SUITES_FAILED++))

        # Mostrar reporte si existe
        if [ -d "playwright-report" ]; then
            log_info "Reporte disponible en: frontend/playwright-report/index.html"
        fi

        if $CI_MODE; then
            exit 1
        fi
    fi

    cd ..
else
    log_warning "Saltando E2E tests (--skip-e2e)"
fi

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                     RESUMEN FINAL                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

TOTAL_SUITES=$((SUITES_PASSED + SUITES_FAILED))

echo "Suites ejecutadas: $TOTAL_SUITES"
echo ""

if [ $SUITES_PASSED -gt 0 ]; then
    log_success "Suites exitosas: $SUITES_PASSED"
fi

if [ $SUITES_FAILED -gt 0 ]; then
    log_error "Suites fallidas: $SUITES_FAILED"
fi

echo ""
log_info "Tiempo total: ${MINUTES}m ${SECONDS}s"
echo ""

# Reportes de coverage
if $COVERAGE; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                  REPORTES DE COVERAGE                     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    if [ -f "backend/coverage-report/index.html" ]; then
        log_info "Backend Coverage: backend/coverage-report/index.html"
    fi

    if [ -f "frontend/coverage/index.html" ]; then
        log_info "Frontend Coverage: frontend/coverage/index.html"
    fi

    echo ""
fi

# Resultado final
if [ $SUITES_FAILED -eq 0 ]; then
    log_success "═══════════════════════════════════════════════════════════"
    log_success "  ¡TODOS LOS TESTS PASARON EXITOSAMENTE! 🎉"
    log_success "═══════════════════════════════════════════════════════════"
    echo ""
    exit 0
else
    log_error "═══════════════════════════════════════════════════════════"
    log_error "  ALGUNOS TESTS FALLARON"
    log_error "═══════════════════════════════════════════════════════════"
    echo ""
    log_info "Revisa los errores arriba para más detalles"
    echo ""
    exit 1
fi
