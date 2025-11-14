# ✅ Pre-Deployment Checklist - PEEPOS

Utiliza este checklist antes de cada deployment a producción para asegurar que todo esté configurado correctamente.

---

## 📋 CONFIGURACIÓN INICIAL (Primera vez solamente)

### Google Cloud Platform

- [ ] Cuenta de GCP creada y facturación habilitada
- [ ] Proyecto `peepos-saas` creado
- [ ] gcloud CLI instalado y autenticado
- [ ] Permisos de Owner/Editor en el proyecto
- [ ] Firebase proyecto inicializado

### APIs Habilitadas

- [ ] Cloud Run API
- [ ] Cloud SQL Admin API
- [ ] Cloud Build API
- [ ] Container Registry API
- [ ] Secret Manager API
- [ ] VPC Access API
- [ ] Service Networking API

### Infraestructura Base

- [ ] Cloud SQL MySQL 8.0 instance creada
- [ ] VPC Connector configurado
- [ ] Service Account `peepos-api` creado
- [ ] IAM roles asignados correctamente
- [ ] Cloud Storage bucket creado

---

## 🔐 SECRETS Y CREDENCIALES

### Secret Manager

- [ ] `laravel-app-key` creado (generar con `php artisan key:generate`)
- [ ] `mysql-password` creado
- [ ] `gemini-api-key` creado
- [ ] `whatsapp-api-key` creado (si aplica)
- [ ] `sendgrid-api-key` creado (si aplica)

### Verificación

```bash
# Verificar que todos los secrets existen
./scripts/gcp-helper.sh list-secrets
```

---

## 🗄️ BASE DE DATOS

### Cloud SQL

- [ ] Instance en estado `RUNNABLE`
- [ ] Base de datos `peepos_central` creada
- [ ] Usuario `peepos_app` creado con permisos
- [ ] Backups automáticos configurados
- [ ] Unix socket configurado para Cloud Run

### Migraciones

- [ ] Todas las migraciones están commiteadas
- [ ] Migraciones testeadas en local/staging
- [ ] Cloud Run Job `peepos-migrations` creado
- [ ] Plan de rollback preparado si falla

### Verificación

```bash
# Test de conexión
./scripts/gcp-helper.sh db-status
```

---

## 🔧 BACKEND (Laravel API)

### Configuración

- [ ] `backend/.env.cloudrun` actualizado con valores correctos
- [ ] `PROJECT_ID` correcto
- [ ] `CLOUD_SQL_CONNECTION` configurado
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL` con dominio de producción

### Código

- [ ] Branch `main` actualizado
- [ ] Todos los tests pasando
- [ ] Linter sin errores críticos
- [ ] Sin credenciales hardcodeadas en el código
- [ ] Logs de debug eliminados

### Docker

- [ ] `Dockerfile` optimizado
- [ ] `.dockerignore` configurado
- [ ] Build local exitoso (opcional)

### Verificación

```bash
# Test local del Dockerfile
cd backend
docker build -t peepos-backend-test .

# Verificar que no haya secretos en el código
grep -r "password\|secret\|key" --include="*.php" app/ | grep -v "config("
```

---

## 🎨 FRONTEND (React + Vite)

### Configuración

- [ ] `.env.production` configurado
- [ ] `VITE_API_BASE_URL` apunta al backend de producción
- [ ] Variables de Firebase correctas
- [ ] `VITE_ENABLE_DEVTOOLS=false`
- [ ] `VITE_LOG_LEVEL=error`

### Código

- [ ] Build exitoso localmente
- [ ] Linter sin errores
- [ ] Sin console.log en producción
- [ ] Assets optimizados
- [ ] Lazy loading implementado

### Firebase

- [ ] `firebase.json` configurado
- [ ] Headers de seguridad establecidos
- [ ] Cache policies configuradas
- [ ] Redirects y rewrites configurados

### Verificación

```bash
cd frontend

# Build de prueba
npm run build

# Verificar tamaño del bundle
du -sh dist/

# Verificar que no haya API keys hardcodeadas
grep -r "AIza" src/ || echo "OK"
```

---

## 🌐 NETWORKING Y SEGURIDAD

### CORS

- [ ] `backend/config/cors.php` actualizado
- [ ] Dominios de producción agregados
- [ ] Patterns para subdominios configurados
- [ ] Headers expuestos correctamente

### SSL/TLS

- [ ] Certificados SSL automáticos (Cloud Run/Firebase)
- [ ] HTTPS forzado
- [ ] HSTS headers configurados

### Firewall

- [ ] Cloud SQL solo accesible via VPC
- [ ] Service account con mínimos permisos
- [ ] No hay IPs públicas innecesarias

### Verificación

```bash
# Test CORS
curl -I https://peepos-saas.web.app

# Verificar SSL
curl -vI https://api.peepos.app 2>&1 | grep -i ssl
```

---

## 📊 MONITOREO Y LOGS

### Cloud Monitoring

- [ ] Alertas configuradas para errores
- [ ] Dashboard de métricas creado
- [ ] Notificaciones por email configuradas

### Logging

- [ ] Log level en `error` o `warning` para producción
- [ ] Logs estructurados (JSON)
- [ ] Sensitive data no loggeada

### Health Checks

- [ ] Endpoint `/api/v1/health` funcionando
- [ ] Health check de Dockerfile configurado

### Verificación

```bash
# Test health check
curl https://[backend-url]/api/v1/health

# Ver logs recientes
./scripts/gcp-helper.sh logs-errors
```

---

## 🚀 DEPLOYMENT

### Pre-Deploy

- [ ] Crear backup de base de datos
- [ ] Notificar al equipo del deployment
- [ ] Preparar plan de rollback
- [ ] Verificar ventana de mantenimiento

### Durante Deploy

- [ ] Backend deployado primero
- [ ] Migraciones ejecutadas sin errores
- [ ] Health check del backend OK
- [ ] Frontend deployado después

### Post-Deploy

- [ ] Health checks pasando
- [ ] Smoke tests exitosos
- [ ] Logs sin errores críticos
- [ ] Performance aceptable

### Verificación

```bash
# Deploy completo
./scripts/gcp-helper.sh health-check

# Verificar URLs
./scripts/gcp-helper.sh urls
```

---

## 🧪 TESTING POST-DEPLOYMENT

### Tests Funcionales

- [ ] Login de usuario funciona
- [ ] Creación de tenant funciona
- [ ] CRUD de estudiantes funciona
- [ ] Importación de datos funciona
- [ ] AI Assistant responde
- [ ] Notificaciones funcionan

### Tests de Rendimiento

- [ ] Tiempo de respuesta < 500ms
- [ ] Carga de página < 3s
- [ ] Sin errores en consola del navegador
- [ ] Lighthouse score > 80

### Tests de Seguridad

- [ ] SQL injection protegido
- [ ] XSS protegido
- [ ] CSRF tokens funcionando
- [ ] Rate limiting activo
- [ ] Authentication funcionando

---

## 💰 COSTOS

### Revisión de Recursos

- [ ] Min instances apropiadas (1 para prod, 0 para staging)
- [ ] Max instances limitadas
- [ ] Cloud SQL tier adecuado
- [ ] Budget alerts configuradas

### Verificación

```bash
# Ver estado de recursos
./scripts/gcp-helper.sh status

# Ver costos estimados
gcloud billing accounts list
```

---

## 📱 DOMINIOS CUSTOM (Opcional)

### Backend

- [ ] Dominio `api.peepos.app` configurado
- [ ] DNS apuntando a Cloud Run
- [ ] SSL certificado provisionado

### Frontend

- [ ] Dominio `peepos.app` configurado
- [ ] DNS apuntando a Firebase Hosting
- [ ] SSL certificado provisionado

---

## 📞 CONTACTOS DE EMERGENCIA

- **DevOps Lead**: _____________
- **Backend Lead**: _____________
- **Frontend Lead**: _____________
- **GCP Support**: support.google.com/cloud

---

## 🔄 ROLLBACK PLAN

En caso de problemas:

### Backend Rollback

```bash
# Revertir a versión anterior
PREVIOUS_REVISION=$(gcloud run revisions list --service=peepos-api --region=us-central1 --format='value(REVISION)' | sed -n 2p)

gcloud run services update-traffic peepos-api \
  --to-revisions=$PREVIOUS_REVISION=100 \
  --region=us-central1
```

### Frontend Rollback

```bash
# Ver historial de deploys
firebase hosting:releases:list

# Rollback a versión anterior
firebase hosting:rollback
```

### Database Rollback

```bash
# Restaurar desde backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=peepos-mysql-prod \
  --backup-instance=peepos-mysql-prod
```

---

## ✅ DEPLOYMENT COMPLETADO

- [ ] Todas las verificaciones pasaron
- [ ] Equipo notificado del deployment exitoso
- [ ] Documentación actualizada si hubo cambios
- [ ] Checklist archivado con fecha de deployment

**Deployed by**: _____________
**Date**: _____________
**Version**: _____________
**Notes**: _____________

---

## 📚 Referencias Rápidas

- [Guía de Deployment Completa](./DEPLOYMENT.md)
- [Backend Deploy Script](./backend/deploy.sh)
- [Frontend Deploy Script](./frontend/deploy.sh)
- [GCP Helper Script](./scripts/gcp-helper.sh)

---

**¡Buen deployment! 🚀**
