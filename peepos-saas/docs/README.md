# Documentación - Peepos SaaS

Repositorio de documentación técnica del proyecto.

## 📚 Documentación Disponible

### 🔒 Seguridad
- **[SECURITY.md](SECURITY.md)** - 🔴 CRÍTICO: Guía completa de seguridad multi-tenant
  - 3 Capas de protección contra Data Leakage
  - Trait BelongsToTenant
  - Middleware de validación
  - Aislamiento de bases de datos
  - Tests de seguridad
  - Incident Response

## 📋 Contenido Planeado

### 📐 Arquitectura
- Diagrama de arquitectura del sistema
- Flujo de datos multi-tenant
- Decisiones de diseño
- Patrones de desarrollo

### 🔐 API
- Documentación de endpoints
- Ejemplos de requests/responses
- Autenticación JWT con Sanctum
- Autorización por roles
- Rate limiting

### 💻 Desarrollo
- Guía de setup local
- Convenciones de código (PSR-12)
- Guía de contribución
- Workflow Git

### 🚀 Deployment
- Proceso de deployment a Cloud Run
- Configuración de Cloud SQL
- Variables de entorno
- CI/CD con Google Cloud Build
- Monitoreo y Logging

### 🧪 Testing
- Estrategia de testing
- Cobertura de tests
- Tests unitarios
- Tests de integración
- Tests E2E
- Tests de seguridad

### 🤖 IA y Automatización
- Integración Gemini AI
- Sistema de importación masiva
- Extracción de datos de documentos
- WhatsApp Business API

## 📊 Estado Actual

### ✅ Completado
- [x] Documentación de seguridad multi-tenant
- [x] Guía de 3 capas de protección
- [x] Setup inicial del proyecto

### 🚧 En Desarrollo
- [ ] Diagramas de arquitectura
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Guías de deployment
- [ ] Estrategia de testing

### 📝 Pendiente
- [ ] Documentación de módulos específicos
- [ ] Guía de troubleshooting
- [ ] FAQ para desarrolladores
- [ ] Video tutoriales

## 🎯 Prioridades

1. **Alta**: Documentación de seguridad (✅ Completada)
2. **Alta**: Documentación de API endpoints
3. **Media**: Guía de deployment
4. **Media**: Documentación de arquitectura
5. **Baja**: Video tutoriales

## 🤝 Contribuir

### Formato
- Toda documentación debe estar en formato Markdown
- Usar encabezados claros y jerarquía lógica
- Incluir ejemplos de código cuando sea relevante
- Agregar diagramas cuando sea posible

### Estructura
```
docs/
├── SECURITY.md          # ✅ Seguridad multi-tenant
├── API.md              # 🚧 Documentación de API
├── ARCHITECTURE.md     # 📝 Arquitectura del sistema
├── DEPLOYMENT.md       # 📝 Guía de deployment
├── TESTING.md          # 📝 Estrategia de testing
├── CONTRIBUTING.md     # 📝 Guía de contribución
└── README.md          # Este archivo
```

### Convenciones
- Usar emojis para mejor visualización
- Marcar secciones críticas con 🔴
- Incluir ejemplos de código con sintaxis highlighting
- Agregar tabla de contenidos en documentos largos
- Mantener documentación actualizada con el código

## 🔗 Enlaces Útiles

### Backend
- [README Backend](../backend/README.md)
- [Configuración Tenancy](../backend/config/tenancy.php)
- [Rutas API](../backend/routes/api.php)

### Frontend
- [README Frontend](../frontend/README.md)
- [Componentes](../frontend/components/)

### DevOps
- [Dockerfile](../backend/Dockerfile)
- [Cloud Build](../backend/cloudbuild.yaml)
- [Docker Compose](../docker-compose.yml)

## 📞 Contacto

- **Equipo Técnico**: dev@peepos.com
- **Seguridad**: security@peepos.com
- **Soporte**: soporte@peepos.com

---

**Última actualización**: Enero 2025
