/**
 * E2E Tests - Students Management
 *
 * Tests completos del módulo de gestión de estudiantes:
 * - Lista de estudiantes
 * - Búsqueda y filtros
 * - Creación de estudiante
 * - Edición de estudiante
 * - Eliminación de estudiante
 */

import { test, expect } from '@playwright/test';

test.describe('Students Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    await page.getByPlaceholder(/código de colegio/i).fill('test-colegio');
    await page.getByPlaceholder(/correo/i).fill('director@test.com');
    await page.getByPlaceholder(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.waitForURL('/director/dashboard');

    // Navegar a estudiantes
    await page.getByRole('link', { name: /estudiantes/i }).click();
    await page.waitForURL('/director/estudiantes');
  });

  test('should display students list', async ({ page }) => {
    // Expect page title
    await expect(page.getByRole('heading', { name: /estudiantes/i })).toBeVisible();

    // Expect table or grid with students
    await expect(page.getByRole('table') || page.getByTestId('students-grid')).toBeVisible();

    // Expect at least one student row
    const studentRows = page.getByRole('row');
    await expect(studentRows).not.toHaveCount(0);
  });

  test('should search students by name', async ({ page }) => {
    // Get search input
    const searchInput = page.getByPlaceholder(/buscar estudiante/i);
    await expect(searchInput).toBeVisible();

    // Type search term
    await searchInput.fill('Juan');

    // Wait for results
    await page.waitForTimeout(500); // Debounce

    // Expect filtered results
    const studentRows = page.getByRole('row');
    const count = await studentRows.count();

    // All visible students should contain 'Juan'
    for (let i = 1; i < count; i++) {
      // Skip header row
      const rowText = await studentRows.nth(i).textContent();
      expect(rowText?.toLowerCase()).toContain('juan');
    }
  });

  test('should filter students by grade and section', async ({ page }) => {
    // Open filters
    const filterButton = page.getByRole('button', { name: /filtros/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }

    // Select grade
    await page.getByLabel(/grado/i).selectOption('5°');

    // Select section
    await page.getByLabel(/sección/i).selectOption('A');

    // Apply filters
    const applyButton = page.getByRole('button', { name: /aplicar/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify filtered students
    const studentRows = page.getByRole('row');
    const count = await studentRows.count();

    if (count > 1) {
      // At least one result
      for (let i = 1; i < count; i++) {
        const rowText = await studentRows.nth(i).textContent();
        expect(rowText).toContain('5°');
        expect(rowText).toContain('A');
      }
    }
  });

  test('should create new student', async ({ page }) => {
    // Click "Nuevo Estudiante" button
    await page.getByRole('button', { name: /nuevo estudiante|agregar/i }).click();

    // Expect modal or form
    await expect(page.getByRole('dialog') || page.getByRole('form')).toBeVisible();

    // Fill student form
    await page.getByLabel(/dni/i).fill('12345678');
    await page.getByLabel(/nombres/i).fill('Carlos Eduardo');
    await page.getByLabel(/apellido paterno/i).fill('Ramírez');
    await page.getByLabel(/apellido materno/i).fill('Silva');
    await page.getByLabel(/fecha de nacimiento/i).fill('2010-05-15');
    await page.getByLabel(/grado/i).selectOption('5°');
    await page.getByLabel(/sección/i).selectOption('A');

    // Optional fields
    const emailInput = page.getByLabel(/email|correo/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('carlos@example.com');
    }

    // Submit form
    await page.getByRole('button', { name: /guardar|crear/i }).click();

    // Expect success message
    await expect(
      page.getByText(/estudiante creado|registrado exitosamente/i)
    ).toBeVisible();

    // Expect modal to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify student appears in list
    await expect(page.getByText(/Carlos Eduardo.*Ramírez/i)).toBeVisible();
  });

  test('should validate required fields when creating student', async ({ page }) => {
    // Click "Nuevo Estudiante" button
    await page.getByRole('button', { name: /nuevo estudiante|agregar/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /guardar|crear/i }).click();

    // Expect validation messages
    await expect(page.getByText(/el dni es requerido/i)).toBeVisible();
    await expect(page.getByText(/los nombres son requeridos/i)).toBeVisible();
    await expect(page.getByText(/el apellido paterno es requerido/i)).toBeVisible();
  });

  test('should edit existing student', async ({ page }) => {
    // Find first student row and click edit button
    const firstStudentRow = page.getByRole('row').nth(1); // Skip header
    await firstStudentRow.getByRole('button', { name: /editar/i }).click();

    // Expect form with pre-filled data
    await expect(page.getByRole('dialog') || page.getByRole('form')).toBeVisible();

    // Verify data is loaded
    const nombreInput = page.getByLabel(/nombres/i);
    await expect(nombreInput).not.toBeEmpty();

    // Modify data
    const currentName = await nombreInput.inputValue();
    await nombreInput.fill(currentName + ' MODIFICADO');

    // Save changes
    await page.getByRole('button', { name: /guardar|actualizar/i }).click();

    // Expect success message
    await expect(
      page.getByText(/estudiante actualizado|modificado exitosamente/i)
    ).toBeVisible();

    // Verify change appears in list
    await expect(page.getByText(/MODIFICADO/i)).toBeVisible();
  });

  test('should delete student with confirmation', async ({ page }) => {
    // Get initial student count
    const initialRows = await page.getByRole('row').count();

    // Find first student and click delete
    const firstStudentRow = page.getByRole('row').nth(1);
    await firstStudentRow.getByRole('button', { name: /eliminar|borrar/i }).click();

    // Expect confirmation dialog
    await expect(
      page.getByText(/¿estás seguro.*eliminar|confirmar eliminación/i)
    ).toBeVisible();

    // Confirm deletion
    await page
      .getByRole('button', { name: /confirmar|sí|eliminar/i })
      .last()
      .click();

    // Expect success message
    await expect(
      page.getByText(/estudiante eliminado exitosamente/i)
    ).toBeVisible();

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify student count decreased
    const newRows = await page.getByRole('row').count();
    expect(newRows).toBe(initialRows - 1);
  });

  test('should cancel student deletion', async ({ page }) => {
    // Get initial student count
    const initialRows = await page.getByRole('row').count();

    // Find first student and click delete
    const firstStudentRow = page.getByRole('row').nth(1);
    await firstStudentRow.getByRole('button', { name: /eliminar|borrar/i }).click();

    // Expect confirmation dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Cancel deletion
    await page.getByRole('button', { name: /cancelar|no/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Student count should remain the same
    const newRows = await page.getByRole('row').count();
    expect(newRows).toBe(initialRows);
  });

  test('should paginate students list', async ({ page }) => {
    // Expect pagination controls
    const paginationContainer = page.getByRole('navigation', { name: /pagination/i });

    if (await paginationContainer.isVisible()) {
      // Click next page
      const nextButton = page.getByRole('button', { name: /siguiente|next/i });
      await nextButton.click();

      // URL should update with page parameter
      await expect(page).toHaveURL(/page=2/);

      // Content should change
      await page.waitForTimeout(500);

      // Click previous page
      const prevButton = page.getByRole('button', { name: /anterior|previous/i });
      await prevButton.click();

      // Back to page 1
      await expect(page).toHaveURL(/page=1|estudiantes$/);
    }
  });

  test('should export students to Excel', async ({ page }) => {
    // Click export button
    const exportButton = page.getByRole('button', { name: /exportar|descargar/i });

    if (await exportButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;

      // Verify file name
      expect(download.suggestedFilename()).toMatch(/estudiantes.*\.(xlsx|csv)/i);

      // Verify download completed
      const path = await download.path();
      expect(path).toBeTruthy();
    }
  });

  test('should show student details', async ({ page }) => {
    // Click on first student to view details
    const firstStudentRow = page.getByRole('row').nth(1);
    const viewButton = firstStudentRow.getByRole('button', { name: /ver|detalles/i });

    if (await viewButton.isVisible()) {
      await viewButton.click();

      // Expect details modal or page
      await expect(page.getByRole('dialog') || page.getByTestId('student-details')).toBeVisible();

      // Verify personal information section
      await expect(page.getByText(/información personal/i)).toBeVisible();

      // Verify academic information section
      await expect(page.getByText(/información académica/i)).toBeVisible();

      // Verify contact information section
      await expect(page.getByText(/información de contacto/i)).toBeVisible();
    }
  });
});
