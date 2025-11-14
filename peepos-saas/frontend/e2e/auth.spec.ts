/**
 * E2E Tests - Authentication Flow
 *
 * Tests completos del flujo de autenticación:
 * - Login
 * - Logout
 * - Protected routes
 * - Session persistence
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveTitle(/Peepos/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByPlaceholder(/código de colegio/i)).toBeVisible();
    await expect(page.getByPlaceholder(/correo/i)).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click login button without filling form
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Expect validation messages
    await expect(page.getByText(/el código de colegio es requerido/i)).toBeVisible();
    await expect(page.getByText(/el correo es requerido/i)).toBeVisible();
    await expect(page.getByText(/la contraseña es requerida/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByPlaceholder(/código de colegio/i).fill('invalid-school');
    await page.getByPlaceholder(/correo/i).fill('invalid@example.com');
    await page.getByPlaceholder(/contraseña/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Expect error message
    await expect(
      page.getByText(/credenciales inválidas|usuario o contraseña incorrectos/i)
    ).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill form with valid test credentials
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('director@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Expect redirect to dashboard
    await page.waitForURL('/director/dashboard');
    await expect(page).toHaveURL(/\/director\/dashboard/);

    // Expect dashboard content
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should persist session after page reload', async ({ page, context }) => {
    // Login
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('director@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.waitForURL('/director/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/director\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('director@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.waitForURL('/director/dashboard');

    // Click logout button (assuming it's in a dropdown or menu)
    await page.getByRole('button', { name: /perfil|usuario/i }).click();
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('should protect routes from unauthenticated access', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/director/dashboard');

    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page).toHaveURL(/\/login/);

    // Should show message
    await expect(
      page.getByText(/debes iniciar sesión|por favor inicia sesión/i)
    ).toBeVisible();
  });

  test('should remember tenant code', async ({ page }) => {
    // Fill tenant code
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');

    // Check "Remember me" or similar option
    const rememberCheckbox = page.getByRole('checkbox', { name: /recordar/i });
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    // Submit with wrong credentials (intentional)
    await page.getByPlaceholder(/correo/i).fill('test@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('wrong');
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Reload page
    await page.reload();

    // Tenant code should be remembered
    const tenantInput = page.getByPlaceholder(/código de colegio/i);
    await expect(tenantInput).toHaveValue('test-colegio');
  });
});

test.describe('Role-based Access Control', () => {
  test('director should access director dashboard', async ({ page }) => {
    await page.goto('/login');

    // Login as director
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('director@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await page.waitForURL('/director/dashboard');

    // Should see director-specific menu items
    await expect(page.getByRole('link', { name: /estudiantes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /matrículas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /reportes/i })).toBeVisible();
  });

  test('docente should access docente dashboard', async ({ page }) => {
    await page.goto('/login');

    // Login as docente
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('docente@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await page.waitForURL('/docente/dashboard');

    // Should see docente-specific menu items
    await expect(page.getByRole('link', { name: /mis cursos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /evaluaciones/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /asistencia/i })).toBeVisible();
  });

  test('docente should not access director routes', async ({ page }) => {
    await page.goto('/login');

    // Login as docente
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('docente@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await page.waitForURL('/docente/dashboard');

    // Try to access director route
    await page.goto('/director/estudiantes');

    // Should be redirected or show error
    await expect(
      page.getByText(/no tienes permiso|acceso denegado|403/i)
    ).toBeVisible();
  });
});
