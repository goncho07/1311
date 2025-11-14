# GUÍA DE INSTALACIÓN DEL BACKEND EN WINDOWS
## Peepos SaaS - Laravel 12 + MySQL

**Sistema Operativo:** Windows 10/11
**Fecha:** 13 de Noviembre, 2025

---

## 🔍 ESTADO ACTUAL

### ❌ Componentes NO Instalados
- **PHP:** No detectado
- **Composer:** No detectado
- **MySQL:** No detectado

**IMPORTANTE:** Necesitas instalar estos tres componentes para que el backend funcione.

---

## 📦 OPCIÓN 1: INSTALACIÓN RÁPIDA CON LARAGON (RECOMENDADO)

**Laragon** incluye PHP, MySQL, Composer y más en un solo paquete. Es la forma más fácil.

### Descargar Laragon

1. Visita: https://laragon.org/download/
2. Descarga **Laragon Full** (incluye PHP 8.2, MySQL, Apache)
3. Ejecuta el instalador (`laragon-wamp.exe`)

### Instalación

1. **Ejecutar instalador**
   - Clic derecho → "Ejecutar como administrador"
   - Elegir ubicación: `C:\laragon` (recomendado)
   - Instalar componentes completos

2. **Iniciar Laragon**
   - Abrir Laragon
   - Clic en "Start All" (iniciará Apache y MySQL)

3. **Verificar instalación**
   - Abrir terminal de Laragon: Clic derecho en Laragon → Terminal
   ```bash
   php -v
   # Debería mostrar: PHP 8.2.x

   composer --version
   # Debería mostrar: Composer version 2.x

   mysql --version
   # Debería mostrar: mysql Ver 8.0.x
   ```

### Configurar PATH (si es necesario)

Si los comandos no funcionan fuera de Laragon:

1. **Abrir Variables de Entorno:**
   - Presionar `Win + Pause`
   - Clic en "Configuración avanzada del sistema"
   - Clic en "Variables de entorno"

2. **Editar PATH:**
   - En "Variables del sistema", buscar "Path"
   - Clic en "Editar"
   - Agregar estas rutas:
     ```
     C:\laragon\bin\php\php-8.2
     C:\laragon\bin\composer
     C:\laragon\bin\mysql\mysql-8.0\bin
     ```

3. **Reiniciar terminal**

### Saltar a la sección "Configurar Backend" más abajo

---

## 📦 OPCIÓN 2: INSTALACIÓN MANUAL (AVANZADO)

Si prefieres instalar cada componente por separado:

---

### PASO 1: INSTALAR PHP 8.2

#### Descargar PHP

1. Visita: https://windows.php.net/download/
2. Descargar **PHP 8.2 Thread Safe** (x64)
3. Archivo: `php-8.2.x-Win32-vs16-x64.zip`

#### Instalar PHP

1. **Extraer archivos:**
   ```
   Crear carpeta: C:\php82
   Extraer el ZIP en: C:\php82
   ```

2. **Configurar php.ini:**
   ```bash
   # En C:\php82
   copy php.ini-development php.ini
   ```

3. **Editar php.ini:**
   Abrir `C:\php82\php.ini` con Notepad++ o VS Code

   Descomentar (quitar `;`) las siguientes líneas:
   ```ini
   extension=curl
   extension=fileinfo
   extension=gd
   extension=mbstring
   extension=mysqli
   extension=openssl
   extension=pdo_mysql
   extension=zip
   extension=redis
   ```

   Cambiar también:
   ```ini
   max_execution_time = 300
   memory_limit = 512M
   upload_max_filesize = 100M
   post_max_size = 100M
   ```

4. **Agregar PHP al PATH:**
   - Win + Pause → Variables de entorno
   - Editar "Path" en Variables del sistema
   - Agregar: `C:\php82`
   - Clic en "Aceptar"

5. **Verificar instalación:**
   ```bash
   # Abrir nueva terminal (cmd o PowerShell)
   php -v
   ```

---

### PASO 2: INSTALAR COMPOSER

1. **Descargar Composer:**
   - Visita: https://getcomposer.org/download/
   - Descargar: `Composer-Setup.exe`

2. **Ejecutar instalador:**
   - Ejecutar como administrador
   - Seleccionar PHP: `C:\php82\php.exe` (o donde instalaste PHP)
   - Siguiente → Instalar

3. **Verificar instalación:**
   ```bash
   composer --version
   ```

---

### PASO 3: INSTALAR MYSQL 8.0

#### Descargar MySQL

1. Visita: https://dev.mysql.com/downloads/installer/
2. Descargar: **MySQL Installer for Windows**
3. Elegir: `mysql-installer-community-8.0.x.msi`

#### Instalar MySQL

1. **Ejecutar instalador:**
   - Ejecutar como administrador
   - Elegir: "Custom" (personalizado)

2. **Seleccionar componentes:**
   - ✅ MySQL Server 8.0.x
   - ✅ MySQL Workbench (opcional, herramienta GUI)
   - ✅ MySQL Shell (opcional)

3. **Configuración del servidor:**
   - **Type:** Development Computer
   - **Port:** 3306 (default)
   - **Authentication:** Use Strong Password Encryption

4. **Configurar contraseña root:**
   - Crear contraseña segura para el usuario `root`
   - **¡IMPORTANTE!** Anotar esta contraseña

5. **Windows Service:**
   - ✅ Configure MySQL Server as a Windows Service
   - Service Name: `MySQL80`
   - ✅ Start at System Startup

6. **Finalizar instalación**

7. **Verificar instalación:**
   ```bash
   mysql --version
   ```

#### Configurar MySQL PATH (si es necesario)

Si `mysql` no funciona en terminal:

1. Agregar al PATH:
   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```

2. Reiniciar terminal

---

## 🔧 CONFIGURAR BACKEND

Una vez instalados PHP, Composer y MySQL:

### 1. Instalar Dependencias de Laravel

```bash
# Ir al directorio del backend
cd "d:\2010-main (3)\peepos-saas\backend"

# Instalar dependencias con Composer
composer install

# Esto puede tardar 2-5 minutos
```

### 2. Copiar y Configurar .env

```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

### 3. Configurar Base de Datos en .env

Editar el archivo `.env`:

```env
# Aplicación
APP_NAME="Peepos SaaS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peepos_central
DB_USERNAME=root
DB_PASSWORD=TU_CONTRASEÑA_AQUI    # ← Cambiar por tu contraseña de MySQL

# Redis (opcional, si no tienes Redis, cambiar a 'array')
CACHE_STORE=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

# Multi-tenancy
CENTRAL_DOMAIN=localhost
TENANCY_DATABASE_PREFIX=peepos_tenant_
TENANCY_DOMAIN_SUFFIX=.peepos.local

# CORS - Frontend
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Crear Base de Datos

#### Opción A: Usando MySQL Workbench (GUI)

1. Abrir MySQL Workbench
2. Conectar al servidor local
3. Ejecutar este SQL:
   ```sql
   CREATE DATABASE peepos_central CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

#### Opción B: Usando Terminal

```bash
# Conectar a MySQL
mysql -u root -p
# Ingresar contraseña cuando se solicite

# Crear base de datos
CREATE DATABASE peepos_central CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verificar
SHOW DATABASES;

# Salir
EXIT;
```

### 5. Ejecutar Migraciones

```bash
# En el directorio del backend
cd "d:\2010-main (3)\peepos-saas\backend"

# Ejecutar migraciones de la base de datos central
php artisan migrate

# Debería ver:
# Migration table created successfully.
# Migrating: xxxx_create_tenants_table
# Migrated:  xxxx_create_tenants_table (XX.XXms)
# ... etc
```

### 6. (Opcional) Crear Tenant de Prueba

```bash
# Crear un tenant demo
php artisan tenants:create ^
  --codigo=demo ^
  --nombre="Institución Demo" ^
  --email=admin@demo.com

# Esto creará:
# - Registro en la tabla tenants
# - Base de datos: peepos_tenant_demo
# - Ejecutará migraciones del tenant
```

### 7. Iniciar Servidor de Desarrollo

```bash
# Iniciar servidor Laravel
php artisan serve --host=0.0.0.0 --port=8000

# El servidor estará disponible en:
# http://localhost:8000
# http://127.0.0.1:8000
```

---

## ✅ VERIFICAR INSTALACIÓN

### 1. Verificar PHP y Extensiones

```bash
php -v
# Debe mostrar PHP 8.2.x

php -m
# Debe incluir: pdo_mysql, mbstring, curl, gd, zip, openssl
```

### 2. Verificar Composer

```bash
composer --version
# Debe mostrar Composer version 2.x
```

### 3. Verificar MySQL

```bash
mysql --version
# Debe mostrar mysql Ver 8.0.x

# Probar conexión
mysql -u root -p
# Ingresar contraseña
# Si conecta, escribir: EXIT;
```

### 4. Verificar Backend

```bash
# Probar endpoint de salud
curl http://localhost:8000/api/health

# O abrir en navegador:
# http://localhost:8000/api/health
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "php: command not found"

**Solución:**
1. Verificar que PHP esté instalado en `C:\php82` o donde lo instalaste
2. Agregar a PATH (Variables de entorno)
3. Reiniciar terminal

### Error: "composer: command not found"

**Solución:**
1. Reinstalar Composer con Composer-Setup.exe
2. Seleccionar correctamente la ruta de PHP durante instalación
3. Reiniciar terminal

### Error: "Access denied for user 'root'@'localhost'"

**Solución:**
1. Verificar contraseña en `.env`
2. Probar conexión manual:
   ```bash
   mysql -u root -p
   ```
3. Si olvidaste la contraseña, resetearla desde MySQL Workbench

### Error: "SQLSTATE[HY000] [2002] No connection could be made"

**Solución:**
1. Verificar que MySQL esté corriendo:
   ```bash
   # Windows Services
   Win + R → services.msc
   # Buscar: MySQL80
   # Estado debe ser: "En ejecución"
   ```
2. Si no está corriendo, iniciarlo:
   - Clic derecho → Iniciar

### Error: Extension 'pdo_mysql' not found

**Solución:**
1. Editar `php.ini`
2. Descomentar: `extension=pdo_mysql`
3. Reiniciar terminal

### Error: "Class 'Redis' not found"

**Solución:**
Si no tienes Redis instalado, cambiar en `.env`:
```env
CACHE_STORE=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
```

### Error durante "composer install"

**Solución:**
```bash
# Limpiar caché de Composer
composer clear-cache

# Reintentar con verbosidad
composer install -vvv

# Si hay problemas con memoria:
php -d memory_limit=-1 C:\ProgramData\ComposerSetup\bin\composer.phar install
```

---

## 📊 CHECKLIST DE INSTALACIÓN

### PHP
- [ ] PHP 8.2+ instalado
- [ ] php.ini configurado
- [ ] Extensiones habilitadas (pdo_mysql, mbstring, etc.)
- [ ] PHP en PATH
- [ ] `php -v` funciona

### Composer
- [ ] Composer 2.x instalado
- [ ] `composer --version` funciona
- [ ] Puede instalar paquetes

### MySQL
- [ ] MySQL 8.0+ instalado
- [ ] Servicio MySQL corriendo
- [ ] Contraseña root configurada
- [ ] `mysql --version` funciona
- [ ] Conexión exitosa con `mysql -u root -p`

### Backend
- [ ] Dependencias instaladas (`composer install`)
- [ ] Archivo `.env` configurado
- [ ] Base de datos `peepos_central` creada
- [ ] Migraciones ejecutadas (`php artisan migrate`)
- [ ] Servidor iniciado (`php artisan serve`)
- [ ] Endpoint `/api/health` responde

---

## 🚀 SIGUIENTES PASOS

Una vez todo instalado:

1. **Iniciar Frontend:**
   ```bash
   cd "d:\2010-main (3)\peepos-saas\frontend"
   npm run dev
   ```

2. **Iniciar Backend:**
   ```bash
   cd "d:\2010-main (3)\peepos-saas\backend"
   php artisan serve
   ```

3. **Abrir aplicación:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

4. **Crear usuario de prueba:**
   ```bash
   php artisan db:seed --class=UsersSeeder
   ```

---

## 📞 RECURSOS ADICIONALES

### Documentación Oficial
- **PHP:** https://www.php.net/docs.php
- **Composer:** https://getcomposer.org/doc/
- **MySQL:** https://dev.mysql.com/doc/
- **Laravel:** https://laravel.com/docs/12.x

### Herramientas Útiles
- **Laragon:** https://laragon.org/ (recomendado para desarrollo)
- **XAMPP:** https://www.apachefriends.org/ (alternativa)
- **MySQL Workbench:** GUI para MySQL
- **HeidiSQL:** Alternativa a MySQL Workbench

### Videos Tutorial (YouTube)
- Buscar: "Install PHP 8.2 on Windows"
- Buscar: "Install Laravel on Windows"
- Buscar: "MySQL setup Windows"

---

**Guía creada:** 13 de Noviembre, 2025
**Para:** Peepos SaaS Backend
**Sistema:** Windows 10/11
