# ═══════════════════════════════════════════════════════════════
# PEEPOS Backend - Multi-stage Dockerfile for Google Cloud Run
# Optimizado para producción con Apache + PHP 8.2
# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# STAGE 1: Composer Builder
# ═══════════════════════════════════════════════════════════════
FROM composer:2.7 AS composer-builder

WORKDIR /app

# Copiar archivos de composer
COPY composer.json composer.lock ./

# Instalar dependencias (sin dev)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader

# ═══════════════════════════════════════════════════════════════
# STAGE 2: Production Image
# ═══════════════════════════════════════════════════════════════
FROM php:8.2-apache AS production

# ────────────────────────────────────────────────────────────────
# Instalar extensiones PHP y dependencias del sistema
# ────────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    git \
    unzip \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        zip \
        pdo \
        pdo_mysql \
        mysqli \
        mbstring \
        exif \
        pcntl \
        bcmath \
        opcache \
        sockets \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ────────────────────────────────────────────────────────────────
# Instalar Redis extension
# ────────────────────────────────────────────────────────────────
RUN pecl install redis-6.0.2 \
    && docker-php-ext-enable redis

# ────────────────────────────────────────────────────────────────
# Configurar OPcache para producción
# ────────────────────────────────────────────────────────────────
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini

# ────────────────────────────────────────────────────────────────
# Configurar PHP para producción
# ────────────────────────────────────────────────────────────────
RUN echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "upload_max_filesize=10M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=10M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "max_input_time=300" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "expose_php=Off" >> /usr/local/etc/php/conf.d/custom.ini

# ────────────────────────────────────────────────────────────────
# Configurar Apache para Cloud Run (puerto 8080)
# ────────────────────────────────────────────────────────────────
RUN echo "Listen 8080" >> /etc/apache2/ports.conf && \
    sed -i 's/80/8080/g' /etc/apache2/sites-available/000-default.conf && \
    sed -i 's/\/var\/www\/html/\/var\/www\/public/g' /etc/apache2/sites-available/000-default.conf

# Habilitar módulos Apache necesarios
RUN a2enmod rewrite headers

# Configurar Apache para Laravel
RUN echo '<Directory /var/www/public>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/sites-available/000-default.conf

# ────────────────────────────────────────────────────────────────
# Copiar aplicación
# ────────────────────────────────────────────────────────────────
WORKDIR /var/www

# Copiar vendor desde builder
COPY --from=composer-builder /app/vendor ./vendor

# Copiar código de la aplicación
COPY . .

# ────────────────────────────────────────────────────────────────
# Optimizaciones Laravel
# ────────────────────────────────────────────────────────────────
RUN php artisan config:cache || echo "Config cache failed, continuing..." \
    && php artisan route:cache || echo "Route cache failed, continuing..." \
    && php artisan view:cache || echo "View cache failed, continuing..." \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative

# ────────────────────────────────────────────────────────────────
# Configurar permisos
# ────────────────────────────────────────────────────────────────
RUN chown -R www-data:www-data \
    /var/www/storage \
    /var/www/bootstrap/cache && \
    chmod -R 775 \
    /var/www/storage \
    /var/www/bootstrap/cache

# ────────────────────────────────────────────────────────────────
# Health check
# ────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/health || exit 1

# ────────────────────────────────────────────────────────────────
# Exponer puerto 8080 (requerido por Cloud Run)
# ────────────────────────────────────────────────────────────────
EXPOSE 8080

# ────────────────────────────────────────────────────────────────
# Iniciar Apache
# ────────────────────────────────────────────────────────────────
CMD ["apache2-foreground"]
