# 🧪 PEEPOS - Guía de Testing

Esta guía describe la estrategia de testing completa para Peepos, incluyendo unit tests, integration tests y E2E tests.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Ejecutar Tests](#ejecutar-tests)
- [CI/CD](#cicd)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

---

## 🎯 Visión General

### Pirámide de Testing

```
           /\
          /  \
         / E2E \          ← Pocos, críticos
        /───────\
       /   INT   \        ← Moderados
      /───────────\
     /    UNIT     \      ← Muchos, rápidos
    /_______________\
```

### Objetivos de Coverage

- **Unit Tests**: ≥ 80%
- **Feature Tests**: ≥ 70%
- **E2E Tests**: Flujos críticos de negocio

### Stack de Testing

**Backend:**
- PHPUnit (Unit & Feature tests)
- PHPStan (Static analysis)
- PHP CS Fixer (Code style)

**Frontend:**
- Vitest (Unit & Integration tests)
- React Testing Library (Component tests)
- Playwright (E2E tests)
- ESLint (Code quality)

---

## 🔧 Backend Testing

### Estructura de Tests

```
backend/tests/
├── Unit/                    # Tests unitarios
│   ├── Services/
│   ├── Models/
│   └── Helpers/
├── Feature/                 # Tests de integración
│   ├── MultiTenancyTest.php
│   ├── MatriculaTest.php
│   ├── EvaluacionTest.php
│   ├── AsistenciaTest.php
│   └── ImportacionTest.php
├── TestCase.php            # Base test class
└── CreatesApplication.php  # Bootstrap
```

### Configuración

**phpunit.xml:**
```xml
<phpunit>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### Tests Implementados

#### 1. Multi-Tenancy Tests ([backend/tests/Feature/MultiTenancyTest.php](backend/tests/Feature/MultiTenancyTest.php))

```php
✓ tenant_identification_works_from_header
✓ cannot_access_other_tenant_data
✓ tenant_database_isolation_works
✓ suspended_tenant_cannot_access_api
✓ expired_tenant_cannot_access_api
✓ tenant_can_only_access_features_from_their_plan
```

**Qué verifica:**
- Identificación correcta del tenant desde headers
- Aislamiento completo de datos entre tenants
- Validación de estado y expiración de tenants
- Control de acceso basado en plan

#### 2. Matrícula Tests ([backend/tests/Feature/MatriculaTest.php](backend/tests/Feature/MatriculaTest.php))

```php
✓ can_create_matricula_with_available_cupo
✓ cannot_create_matricula_without_cupos
✓ cannot_create_duplicate_matricula_for_same_period
✓ can_approve_pending_matricula
✓ can_reject_pending_matricula
✓ can_retire_student
✓ validates_student_age_for_grade
```

**Qué verifica:**
- Control de cupos disponibles
- Prevención de matrículas duplicadas
- Flujo completo de aprobación/rechazo
- Validaciones de edad y requisitos

#### 3. Evaluación Tests ([backend/tests/Feature/EvaluacionTest.php](backend/tests/Feature/EvaluacionTest.php))

```php
✓ can_create_evaluation
✓ can_register_student_grade
✓ validates_grade_within_scale
✓ calculates_grade_status_correctly
✓ can_calculate_student_average
✓ cannot_register_duplicate_grade
```

**Qué verifica:**
- Registro de notas dentro de escala
- Cálculo correcto de estados (aprobado/desaprobado)
- Promedios ponderados
- Prevención de duplicados

#### 4. Asistencia Tests ([backend/tests/Feature/AsistenciaTest.php](backend/tests/Feature/AsistenciaTest.php))

```php
✓ can_register_attendance_present
✓ can_register_attendance_absent
✓ can_register_tardiness
✓ can_justify_absence
✓ can_calculate_attendance_percentage
✓ identifies_students_with_low_attendance
```

**Qué verifica:**
- Registro de diferentes tipos de asistencia
- Justificaciones de ausencias
- Cálculo de porcentajes
- Identificación de estudiantes en riesgo

#### 5. Importación Tests ([backend/tests/Feature/ImportacionTest.php](backend/tests/Feature/ImportacionTest.php))

```php
✓ can_import_students_from_excel
✓ validates_required_fields_during_import
✓ validates_dni_format
✓ prevents_duplicate_dni_import
✓ can_update_existing_students_on_import
✓ handles_large_file_import
```

**Qué verifica:**
- Importación correcta desde Excel
- Validaciones de formato y datos
- Manejo de duplicados
- Performance con archivos grandes

### Ejecutar Tests Backend

```bash
cd backend

# Todos los tests
./test-suite.sh

# Solo unit tests
php artisan test --testsuite=Unit

# Solo feature tests
php artisan test --testsuite=Feature

# Con coverage
./test-suite.sh --coverage

# Modo rápido
./test-suite.sh --quick

# Para CI/CD
./test-suite.sh --ci
```

---

## 🎨 Frontend Testing

### Estructura de Tests

```
frontend/
├── src/
│   ├── components/
│   │   └── StudentCard.test.tsx
│   ├── hooks/
│   │   └── useStudents.test.ts
│   ├── services/
│   │   └── api.test.ts
│   └── tests/
│       └── setup.ts
├── e2e/
│   ├── auth.spec.ts
│   └── students.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

### Configuración

**vitest.config.ts:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      lines: 70,
      functions: 70,
      branches: 70,
    },
  },
});
```

### Tests Implementados

#### 1. Component Tests ([frontend/src/components/StudentCard.test.tsx](frontend/src/components/StudentCard.test.tsx))

```typescript
✓ renders student information correctly
✓ shows/hides email when provided/not provided
✓ calls onEdit when edit button is clicked
✓ calls onDelete when delete button is clicked
✓ shows loading state
```

**Qué verifica:**
- Renderizado correcto de datos
- Interacciones de usuario (clicks)
- Estados (loading, error)
- Conditional rendering

#### 2. Hook Tests ([frontend/src/hooks/useStudents.test.ts](frontend/src/hooks/useStudents.test.ts))

```typescript
✓ fetches students on mount
✓ handles fetch error
✓ filters students by search term
✓ filters students by grade and section
✓ creates a new student
✓ updates an existing student
✓ deletes a student
✓ handles pagination
```

**Qué verifica:**
- Fetching de datos
- Manejo de errores
- Filtros y búsqueda
- CRUD operations
- Paginación

### Ejecutar Tests Frontend

```bash
cd frontend

# Todos los tests
./test-suite.sh

# Solo unit tests
npm run test

# Con coverage
npm run test -- --coverage

# Watch mode (desarrollo)
npm run test -- --watch

# UI mode (navegador)
npm run test -- --ui
```

---

## 🎭 E2E Testing

### Tests Implementados

#### 1. Authentication Flow ([frontend/e2e/auth.spec.ts](frontend/e2e/auth.spec.ts))

```typescript
✓ should display login form
✓ should show validation errors for empty form
✓ should show error for invalid credentials
✓ should successfully login with valid credentials
✓ should persist session after page reload
✓ should logout successfully
✓ should protect routes from unauthenticated access
✓ director should access director dashboard
✓ docente should not access director routes
```

**Qué verifica:**
- Flujo completo de autenticación
- Validaciones de formulario
- Persistencia de sesión
- Control de acceso por rol
- Redirecciones

#### 2. Students Management ([frontend/e2e/students.spec.ts](frontend/e2e/students.spec.ts))

```typescript
✓ should display students list
✓ should search students by name
✓ should filter students by grade and section
✓ should create new student
✓ should validate required fields
✓ should edit existing student
✓ should delete student with confirmation
✓ should paginate students list
✓ should export students to Excel
```

**Qué verifica:**
- CRUD completo de estudiantes
- Búsqueda y filtros
- Validaciones
- Paginación
- Exportación

### Ejecutar E2E Tests

```bash
cd frontend

# Instalar browsers (primera vez)
npx playwright install

# Todos los E2E tests
npm run test:e2e

# Modo UI (interactivo)
npx playwright test --ui

# Solo en Chrome
npx playwright test --project=chromium

# Con debugging
npx playwright test --debug

# Generar reporte
npx playwright show-report
```

---

## 🚀 Ejecutar Tests

### Quick Start

```bash
# Backend
cd backend && ./test-suite.sh --quick

# Frontend
cd frontend && ./test-suite.sh --quick

# E2E (requiere apps corriendo)
cd frontend && npm run test:e2e
```

### Con Coverage

```bash
# Backend con coverage
cd backend && ./test-suite.sh --coverage

# Frontend con coverage
cd frontend && ./test-suite.sh --coverage

# Ver reportes
# Backend: open backend/coverage-report/index.html
# Frontend: open frontend/coverage/index.html
```

### Para CI/CD

```bash
# Backend
cd backend && ./test-suite.sh --ci

# Frontend
cd frontend && ./test-suite.sh --ci

# Frontend con E2E
cd frontend && ./test-suite.sh --ci --e2e
```

---

## 🔄 CI/CD

### GitHub Actions

Crear `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install Dependencies
        run: cd backend && composer install
      - name: Run Tests
        run: cd backend && ./test-suite.sh --ci

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Dependencies
        run: cd frontend && npm ci
      - name: Run Tests
        run: cd frontend && ./test-suite.sh --ci

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      - name: Run E2E Tests
        run: cd frontend && npm run test:e2e
```

---

## 📊 Coverage

### Objetivos de Coverage

| Componente | Target | Actual |
|------------|--------|--------|
| Backend Unit | 80% | - |
| Backend Feature | 70% | - |
| Frontend Unit | 70% | - |
| E2E Critical Paths | 100% | - |

### Generar Reportes

```bash
# Backend
cd backend
./test-suite.sh --coverage
open coverage-report/index.html

# Frontend
cd frontend
npm run test -- --coverage
open coverage/index.html
```

### Badges de Coverage

Agregar a README.md:

```markdown
![Backend Coverage](https://img.shields.io/badge/coverage-80%25-success)
![Frontend Coverage](https://img.shields.io/badge/coverage-75%25-success)
```

---

## ✅ Best Practices

### General

1. **AAA Pattern** (Arrange, Act, Assert)
   ```php
   // Arrange
   $estudiante = Estudiante::factory()->create();

   // Act
   $resultado = $service->procesarMatricula($estudiante->id);

   // Assert
   $this->assertEquals('APROBADA', $resultado->estado);
   ```

2. **Nombres descriptivos**
   ```php
   // ❌ Mal
   public function test1()

   // ✅ Bien
   public function cannot_create_duplicate_matricula_for_same_period()
   ```

3. **Un assert por concepto**
   ```typescript
   // ❌ Evitar
   expect(result).toBeTruthy();
   expect(result.id).toBe(1);
   expect(result.name).toBe('Test');

   // ✅ Mejor
   expect(result).toEqual({
     id: 1,
     name: 'Test'
   });
   ```

### Backend

1. **Usar Factories** para crear datos de prueba
2. **RefreshDatabase** en cada test
3. **Mockear** servicios externos (APIs, email)
4. **Transactions** para rollback automático

### Frontend

1. **Testing Library queries** en orden de prioridad:
   - getByRole
   - getByLabelText
   - getByPlaceholderText
   - getByText
   - getByTestId (último recurso)

2. **User events** en lugar de fireEvent
3. **waitFor** para async operations
4. **Mock** solo lo necesario

### E2E

1. **Page Object Model** para reducir duplicación
2. **Test isolation** - cada test independiente
3. **Selectores semánticos** (roles, labels)
4. **Esperas explícitas** (waitForSelector)

---

## 🐛 Troubleshooting

### Backend

**Error: Database not found**
```bash
php artisan config:clear
rm -rf .phpunit.cache
```

**Error: Class not found**
```bash
composer dump-autoload
```

### Frontend

**Tests fallan aleatoriamente**
```bash
# Limpiar caché
rm -rf node_modules/.vite
npm run test -- --no-cache
```

**Playwright no funciona**
```bash
npx playwright install --with-deps
```

---

## 📚 Referencias

- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

---

## 🎉 ¡Happy Testing!

Recuerda: **Los tests no son opcionales, son parte del código.**
