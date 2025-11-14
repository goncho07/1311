/**
 * ═══════════════════════════════════════════════════════════
 * USE ESTUDIANTES HOOK - Hook para gestión de estudiantes
 * ═══════════════════════════════════════════════════════════
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '@/src/api/endpoints';
import type { Estudiante, EstudianteFilters } from '@/src/types/models.types';

/**
 * Hook para listar estudiantes
 */
export const useEstudiantes = (filters?: EstudianteFilters) => {
  return useQuery({
    queryKey: ['estudiantes', filters],
    queryFn: () => estudiantesApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un estudiante por ID
 */
export const useEstudiante = (id: number) => {
  return useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => estudiantesApi.get(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear estudiante
 */
export const useCreateEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Estudiante>) => estudiantesApi.create(data),
    onSuccess: () => {
      // Invalidar cache para refrescar lista
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

/**
 * Hook para actualizar estudiante
 */
export const useUpdateEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Estudiante> }) =>
      estudiantesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['estudiante', variables.id] });
    },
  });
};

/**
 * Hook para eliminar estudiante
 */
export const useDeleteEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => estudiantesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

/**
 * Hook para importar estudiantes desde Excel
 */
export const useImportEstudiantes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => estudiantesApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

/**
 * Hook para exportar estudiantes a Excel
 */
export const useExportEstudiantes = () => {
  return useMutation({
    mutationFn: (filters?: EstudianteFilters) => estudiantesApi.export(filters),
  });
};

/**
 * Hook para buscar estudiante por código
 */
export const useSearchEstudianteByCode = (codigo: string) => {
  return useQuery({
    queryKey: ['estudiante', 'codigo', codigo],
    queryFn: () => estudiantesApi.searchByCode(codigo),
    enabled: !!codigo && codigo.length >= 3,
  });
};

/**
 * Hook para obtener estudiantes por aula
 */
export const useEstudiantesByAula = (aulaId: number) => {
  return useQuery({
    queryKey: ['estudiantes', 'aula', aulaId],
    queryFn: () => estudiantesApi.getByAula(aulaId),
    enabled: !!aulaId,
  });
};

/**
 * Hook para subir foto de estudiante
 */
export const useUploadEstudianteFoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      estudiantesApi.uploadPhoto(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estudiante', variables.id] });
    },
  });
};

/**
 * Hook para cambiar estado del estudiante
 */
export const useChangeEstudianteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: 'activo' | 'inactivo' | 'retirado' | 'egresado' }) =>
      estudiantesApi.changeStatus(id, estado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['estudiante', variables.id] });
    },
  });
};

/**
 * Hook para obtener historial académico
 */
export const useEstudianteHistorial = (id: number) => {
  return useQuery({
    queryKey: ['estudiante', id, 'historial'],
    queryFn: () => estudiantesApi.getHistorial(id),
    enabled: !!id,
  });
};

/**
 * Hook para asignar apoderado
 */
export const useAssignApoderado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ estudianteId, apoderadoId }: { estudianteId: number; apoderadoId: number }) =>
      estudiantesApi.assignApoderado(estudianteId, apoderadoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estudiante', variables.estudianteId] });
    },
  });
};

/**
 * Hook para remover apoderado
 */
export const useRemoveApoderado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ estudianteId, apoderadoId }: { estudianteId: number; apoderadoId: number }) =>
      estudiantesApi.removeApoderado(estudianteId, apoderadoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estudiante', variables.estudianteId] });
    },
  });
};
