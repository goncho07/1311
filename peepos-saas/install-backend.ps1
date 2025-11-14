# ═══════════════════════════════════════════════════════════
# SCRIPT DE INSTALACIÓN AUTOMÁTICA DEL BACKEND
# Peepos SaaS - Windows 10/11
# ═══════════════════════════════════════════════════════════

Write-Host "
╔════════════════════════════════════════════════════════════╗
║     INSTALADOR AUTOMÁTICO DE BACKEND - PEEPOS SAAS        ║
║                    Laravel 12 + MySQL                      ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  ADVERTENCIA: Este script necesita permisos de administrador" -ForegroundColor Yellow
    Write-Host "   Clic derecho en PowerShell → 'Ejecutar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para continuar de todas formas (puede fallar)"
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  PASO 1: VERIFICANDO INSTALACIONES" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# Verificar PHP
Write-Host "Verificando PHP..." -NoNewline
if (Test-CommandExists php) {
    $phpVersion = php -v | Select-String "PHP (\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    Write-Host " ✅ PHP $phpVersion instalado" -ForegroundColor Green
    $phpInstalled = $true
} else {
    Write-Host " ❌ PHP no encontrado" -ForegroundColor Red
    $phpInstalled = $false
}

# Verificar Composer
Write-Host "Verificando Composer..." -NoNewline
if (Test-CommandExists composer) {
    $composerVersion = composer --version 2>&1 | Select-String "Composer version (\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    Write-Host " ✅ Composer $composerVersion instalado" -ForegroundColor Green
    $composerInstalled = $true
} else {
    Write-Host " ❌ Composer no encontrado" -ForegroundColor Red
    $composerInstalled = $false
}

# Verificar MySQL
Write-Host "Verificando MySQL..." -NoNewline
if (Test-CommandExists mysql) {
    $mysqlVersion = mysql --version 2>&1 | Select-String "mysql\s+Ver\s+(\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    Write-Host " ✅ MySQL $mysqlVersion instalado" -ForegroundColor Green
    $mysqlInstalled = $true
} else {
    Write-Host " ❌ MySQL no encontrado" -ForegroundColor Red
    $mysqlInstalled = $false
}

Write-Host ""

# Si todo está instalado
if ($phpInstalled -and $composerInstalled -and $mysqlInstalled) {
    Write-Host "✅ Todas las dependencias están instaladas!" -ForegroundColor Green
    Write-Host ""
    $skipInstall = $true
} else {
    Write-Host "⚠️  FALTAN COMPONENTES" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Se recomienda instalar Laragon (incluye PHP, MySQL y Composer):" -ForegroundColor Cyan
    Write-Host "👉 https://laragon.org/download/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternativa: Instalación manual (ver INSTALACION_BACKEND_WINDOWS.md)" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "¿Ya instalaste los componentes faltantes? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host ""
        Write-Host "🔄 Reinicia esta terminal y ejecuta el script nuevamente" -ForegroundColor Yellow
        exit
    } else {
        Write-Host ""
        Write-Host "📖 Consulta la guía completa en: INSTALACION_BACKEND_WINDOWS.md" -ForegroundColor Cyan
        exit
    }
}

# Continuar con la configuración del backend
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  PASO 2: CONFIGURANDO BACKEND" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$backendPath = "d:\2010-main (3)\peepos-saas\backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ No se encontró el directorio del backend: $backendPath" -ForegroundColor Red
    exit
}

Set-Location $backendPath

# Verificar si hay .env
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Archivo .env ya existe" -ForegroundColor Cyan
}

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias de Composer..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar 2-5 minutos)" -ForegroundColor Gray

try {
    composer install --no-interaction 2>&1 | Out-Null
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error instalando dependencias" -ForegroundColor Red
    Write-Host "   Ejecuta manualmente: composer install" -ForegroundColor Yellow
}

# Generar APP_KEY
Write-Host ""
Write-Host "🔑 Generando clave de aplicación..." -ForegroundColor Yellow

try {
    php artisan key:generate --no-interaction 2>&1 | Out-Null
    Write-Host "✅ Clave de aplicación generada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error generando clave" -ForegroundColor Red
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  PASO 3: CONFIGURACIÓN DE BASE DE DATOS" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  IMPORTANTE: Necesitas configurar la base de datos manualmente" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edita el archivo .env:" -ForegroundColor Cyan
Write-Host "   Ruta: $backendPath\.env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configura estas variables:" -ForegroundColor Cyan
Write-Host "   DB_CONNECTION=mysql" -ForegroundColor Gray
Write-Host "   DB_HOST=127.0.0.1" -ForegroundColor Gray
Write-Host "   DB_PORT=3306" -ForegroundColor Gray
Write-Host "   DB_DATABASE=peepos_central" -ForegroundColor Gray
Write-Host "   DB_USERNAME=root" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=TU_CONTRASEÑA" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Crea la base de datos en MySQL:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p" -ForegroundColor Gray
Write-Host "   CREATE DATABASE peepos_central;" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "¿Ya configuraste la base de datos? (s/n)"

if ($response -eq 's' -or $response -eq 'S') {
    Write-Host ""
    Write-Host "🔄 Ejecutando migraciones..." -ForegroundColor Yellow

    try {
        php artisan migrate --force
        Write-Host "✅ Migraciones ejecutadas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error ejecutando migraciones" -ForegroundColor Red
        Write-Host "   Verifica tu configuración de .env" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Saltando migraciones. Ejecuta manualmente cuando estés listo:" -ForegroundColor Yellow
    Write-Host "   php artisan migrate" -ForegroundColor Gray
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configurar .env si no lo hiciste:" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ejecutar migraciones (si no se ejecutaron):" -ForegroundColor White
Write-Host "   php artisan migrate" -ForegroundColor Gray
Write-Host ""
Write-Host "3. (Opcional) Crear tenant de prueba:" -ForegroundColor White
Write-Host "   php artisan tenants:create --codigo=demo --nombre=`"Demo`" --email=admin@demo.com" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Iniciar servidor de desarrollo:" -ForegroundColor White
Write-Host "   php artisan serve" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Abrir en el navegador:" -ForegroundColor White
Write-Host "   http://localhost:8000" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Documentación completa en:" -ForegroundColor Cyan
Write-Host "   - INSTALACION_BACKEND_WINDOWS.md" -ForegroundColor Gray
Write-Host "   - INSTALACION.md" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona Enter para salir"
