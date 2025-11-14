#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# PEEPOS Backend - Suite de Testing Completa
# ═══════════════════════════════════════════════════════════════
#
# Ejecuta todos los tests y validaciones de código
#
# Uso:
#   ./test-suite.sh [opciones]
#
# Opciones:
#   --quick         Solo tests rápidos
#   --coverage      Generar reporte de cobertura
#   --ci            Modo CI/CD (sin interacción)
#
# ═══════════════════════════════════════════════════════════════

set -e

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

# Configuración
QUICK_MODE=false
COVERAGE=false
CI_MODE=false

# Parsear argumentos
for arg in "$@"; do
    case $arg in
        --quick) QUICK_MODE=true ;;
        --coverage) COVERAGE=true ;;
        --ci) CI_MODE=true ;;
    esac
done

# Banner
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║       🧪  PEEPOS BACKEND TESTING SUITE  🧪               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    log_error "Este script debe ejecutarse desde el directorio backend/"
    exit 1
fi

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0

# ────────────────────────────────────────────────────────────────
# 1. Verificar entorno de testing
# ────────────────────────────────────────────────────────────────
log_info "Verificando entorno de testing..."

if [ ! -f "vendor/bin/phpunit" ]; then
    log_error "PHPUnit no está instalado"
    log_info "Ejecuta: composer install"
    exit 1
fi

if [ ! -f ".env.testing" ]; then
    log_warning "No existe .env.testing, creando desde .env.example..."
    cp .env.example .env.testing
    sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/g' .env.testing
    sed -i 's/DB_DATABASE=.*/DB_DATABASE=:memory:/g' .env.testing
fi

log_success "Entorno verificado"

# ────────────────────────────────────────────────────────────────
# 2. Limpiar caché de testing
# ────────────────────────────────────────────────────────────────
log_info "Limpiando caché de testing..."
php artisan config:clear --env=testing || true
php artisan cache:clear --env=testing || true
rm -rf .phpunit.cache
log_success "Caché limpiado"

# ────────────────────────────────────────────────────────────────
# 3. Ejecutar Unit Tests
# ────────────────────────────────────────────────────────────────
echo ""
log_info "═══════════════════════════════════════════════════════"
log_info "1/6 - Ejecutando Unit Tests..."
log_info "═══════════════════════════════════════════════════════"

if $COVERAGE; then
    php artisan test --testsuite=Unit --coverage --min=80
else
    php artisan test --testsuite=Unit
fi

if [ $? -eq 0 ]; then
    log_success "Unit Tests: PASSED"
    ((TESTS_PASSED++))
else
    log_error "Unit Tests: FAILED"
    ((TESTS_FAILED++))
    if $CI_MODE; then
        exit 1
    fi
fi

# ────────────────────────────────────────────────────────────────
# 4. Ejecutar Feature Tests
# ────────────────────────────────────────────────────────────────
echo ""
log_info "═══════════════════════════════════════════════════════"
log_info "2/6 - Ejecutando Feature Tests..."
log_info "═══════════════════════════════════════════════════════"

if $COVERAGE; then
    php artisan test --testsuite=Feature --coverage --min=70
else
    php artisan test --testsuite=Feature
fi

if [ $? -eq 0 ]; then
    log_success "Feature Tests: PASSED"
    ((TESTS_PASSED++))
else
    log_error "Feature Tests: FAILED"
    ((TESTS_FAILED++))
    if $CI_MODE; then
        exit 1
    fi
fi

# ────────────────────────────────────────────────────────────────
# 5. Análisis estático con PHPStan (si no es quick mode)
# ────────────────────────────────────────────────────────────────
if ! $QUICK_MODE; then
    echo ""
    log_info "═══════════════════════════════════════════════════════"
    log_info "3/6 - Analizando código con PHPStan..."
    log_info "═══════════════════════════════════════════════════════"

    if [ -f "vendor/bin/phpstan" ]; then
        ./vendor/bin/phpstan analyse app --level=5 --no-progress
        if [ $? -eq 0 ]; then
            log_success "PHPStan: PASSED"
            ((TESTS_PASSED++))
        else
            log_error "PHPStan: FAILED"
            ((TESTS_FAILED++))
        fi
    else
        log_warning "PHPStan no está instalado, saltando..."
        log_info "Instala con: composer require --dev phpstan/phpstan"
    fi
else
    log_warning "Saltando PHPStan (modo rápido)"
fi

# ────────────────────────────────────────────────────────────────
# 6. Verificar Code Style con PHP CS Fixer (si no es quick mode)
# ────────────────────────────────────────────────────────────────
if ! $QUICK_MODE; then
    echo ""
    log_info "═══════════════════════════════════════════════════════"
    log_info "4/6 - Verificando Code Style..."
    log_info "═══════════════════════════════════════════════════════"

    if [ -f "vendor/bin/php-cs-fixer" ]; then
        ./vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
        if [ $? -eq 0 ]; then
            log_success "Code Style: PASSED"
            ((TESTS_PASSED++))
        else
            log_warning "Code Style: ISSUES FOUND"
            log_info "Ejecuta './vendor/bin/php-cs-fixer fix' para corregir"
        fi
    else
        log_warning "PHP CS Fixer no está instalado, saltando..."
        log_info "Instala con: composer require --dev friendsofphp/php-cs-fixer"
    fi
else
    log_warning "Saltando Code Style (modo rápido)"
fi

# ────────────────────────────────────────────────────────────────
# 7. Security Audit (si no es quick mode)
# ────────────────────────────────────────────────────────────────
if ! $QUICK_MODE; then
    echo ""
    log_info "═══════════════════════════════════════════════════════"
    log_info "5/6 - Ejecutando Security Audit..."
    log_info "═══════════════════════════════════════════════════════"

    composer audit --no-dev
    if [ $? -eq 0 ]; then
        log_success "Security Audit: PASSED"
        ((TESTS_PASSED++))
    else
        log_warning "Security Audit: VULNERABILITIES FOUND"
        log_info "Revisa las vulnerabilidades y actualiza dependencias"
    fi
else
    log_warning "Saltando Security Audit (modo rápido)"
fi

# ────────────────────────────────────────────────────────────────
# 8. Generar reporte de cobertura (si está habilitado)
# ────────────────────────────────────────────────────────────────
if $COVERAGE; then
    echo ""
    log_info "═══════════════════════════════════════════════════════"
    log_info "6/6 - Generando Reporte de Cobertura..."
    log_info "═══════════════════════════════════════════════════════"

    php artisan test --coverage-html coverage-report

    if [ -d "coverage-report" ]; then
        log_success "Reporte generado en: coverage-report/index.html"
        log_info "Abre el reporte con: open coverage-report/index.html"
    fi
fi

# ────────────────────────────────────────────────────────────────
# Resumen Final
# ────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    RESUMEN DE TESTS                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo "Tests ejecutados: $TOTAL_TESTS"
echo ""

if [ $TESTS_PASSED -gt 0 ]; then
    log_success "Tests exitosos: $TESTS_PASSED"
fi

if [ $TESTS_FAILED -gt 0 ]; then
    log_error "Tests fallidos: $TESTS_FAILED"
fi

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "¡Todos los tests pasaron exitosamente! 🎉"
    echo ""
    exit 0
else
    log_error "Algunos tests fallaron. Revisa los errores arriba."
    echo ""
    exit 1
fi
