/**
 * Tests para useStudents Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStudents } from './useStudents';

// Mock del servicio API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '@/services/api';

describe('useStudents', () => {
  const mockStudents = [
    {
      id: 1,
      dni: '12345678',
      nombres: 'Juan',
      apellido_paterno: 'Pérez',
      apellido_materno: 'García',
      grado: '5°',
      seccion: 'A',
    },
    {
      id: 2,
      dni: '87654321',
      nombres: 'María',
      apellido_paterno: 'López',
      apellido_materno: 'Torres',
      grado: '5°',
      seccion: 'A',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches students on mount', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: mockStudents },
    });

    const { result } = renderHook(() => useStudents());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students).toEqual(mockStudents);
    expect(api.get).toHaveBeenCalledWith('/estudiantes');
  });

  it('handles fetch error', async () => {
    const error = new Error('Network error');
    (api.get as any).mockRejectedValue(error);

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar estudiantes');
    expect(result.current.students).toEqual([]);
  });

  it('filters students by search term', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: mockStudents },
    });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(2);
    });

    // Buscar por nombre
    result.current.setSearchTerm('Juan');

    await waitFor(() => {
      expect(result.current.filteredStudents).toHaveLength(1);
      expect(result.current.filteredStudents[0].nombres).toBe('Juan');
    });
  });

  it('filters students by grade and section', async () => {
    const mixedStudents = [
      ...mockStudents,
      {
        id: 3,
        dni: '11223344',
        nombres: 'Pedro',
        apellido_paterno: 'Ramírez',
        apellido_materno: 'Silva',
        grado: '6°',
        seccion: 'B',
      },
    ];

    (api.get as any).mockResolvedValue({
      data: { data: mixedStudents },
    });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(3);
    });

    // Filtrar por grado
    result.current.setFilters({ grado: '5°' });

    await waitFor(() => {
      expect(result.current.filteredStudents).toHaveLength(2);
    });

    // Filtrar por grado y sección
    result.current.setFilters({ grado: '5°', seccion: 'A' });

    await waitFor(() => {
      expect(result.current.filteredStudents).toHaveLength(2);
    });
  });

  it('creates a new student', async () => {
    const newStudent = {
      dni: '99999999',
      nombres: 'Nuevo',
      apellido_paterno: 'Estudiante',
      apellido_materno: 'Test',
      grado: '5°',
      seccion: 'A',
    };

    const createdStudent = { id: 3, ...newStudent };

    (api.get as any).mockResolvedValue({
      data: { data: mockStudents },
    });

    (api.post as any).mockResolvedValue({
      data: { data: createdStudent },
    });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(2);
    });

    await result.current.createStudent(newStudent);

    expect(api.post).toHaveBeenCalledWith('/estudiantes', newStudent);

    await waitFor(() => {
      expect(result.current.students).toHaveLength(3);
    });
  });

  it('updates an existing student', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: mockStudents },
    });

    const updatedData = { nombres: 'Juan Carlos' };
    const updatedStudent = { ...mockStudents[0], ...updatedData };

    (api.put as any).mockResolvedValue({
      data: { data: updatedStudent },
    });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(2);
    });

    await result.current.updateStudent(1, updatedData);

    expect(api.put).toHaveBeenCalledWith('/estudiantes/1', updatedData);

    await waitFor(() => {
      const student = result.current.students.find((s) => s.id === 1);
      expect(student?.nombres).toBe('Juan Carlos');
    });
  });

  it('deletes a student', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: mockStudents },
    });

    (api.delete as any).mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(2);
    });

    await result.current.deleteStudent(1);

    expect(api.delete).toHaveBeenCalledWith('/estudiantes/1');

    await waitFor(() => {
      expect(result.current.students).toHaveLength(1);
      expect(result.current.students.find((s) => s.id === 1)).toBeUndefined();
    });
  });

  it('handles pagination', async () => {
    const paginatedResponse = {
      data: mockStudents,
      meta: {
        current_page: 1,
        total: 20,
        per_page: 10,
        last_page: 2,
      },
    };

    (api.get as any).mockResolvedValue({ data: paginatedResponse });

    const { result } = renderHook(() => useStudents({ perPage: 10 }));

    await waitFor(() => {
      expect(result.current.pagination).toEqual(paginatedResponse.meta);
    });

    // Cambiar de página
    result.current.setPage(2);

    expect(api.get).toHaveBeenCalledWith('/estudiantes', {
      params: { page: 2, per_page: 10 },
    });
  });
});
