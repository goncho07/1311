/**
 * ═══════════════════════════════════════════════════════════
 * USE MATRÍCULAS HOOK - Hook para gestión de matrículas
 * ═══════════════════════════════════════════════════════════
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matriculasApi } from '@/src/api/endpoints';
import type { Matricula, MatriculaCreate, MatriculaFilters } from '@/src/types/models.types';

/**
 * Hook para listar matrículas
 */
export const useMatriculas = (filters?: MatriculaFilters) => {
  return useQuery({
    queryKey: ['matriculas', filters],
    queryFn: () => matriculasApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener una matrícula por ID
 */
export const useMatricula = (id: number) => {
  return useQuery({
    queryKey: ['matricula', id],
    queryFn: () => matriculasApi.get(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear matrícula
 */
export const useCreateMatricula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatriculaCreate) => matriculasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });
};

/**
 * Hook para actualizar matrícula
 */
export const useUpdateMatricula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Matricula> }) =>
      matriculasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['matricula', variables.id] });
    },
  });
};

/**
 * Hook para eliminar matrícula
 */
export const useDeleteMatricula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => matriculasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });
};

/**
 * Hook para cambiar estado de matrícula
 */
export const useChangeMatriculaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      estado,
      observaciones,
    }: {
      id: number;
      estado: 'matriculado' | 'retirado' | 'trasladado';
      observaciones?: string;
    }) => matriculasApi.changeStatus(id, estado, observaciones),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['matricula', variables.id] });
    },
  });
};

/**
 * Hook para obtener matrículas de un estudiante
 */
export const useMatriculasByEstudiante = (estudianteId: number) => {
  return useQuery({
    queryKey: ['matriculas', 'estudiante', estudianteId],
    queryFn: () => matriculasApi.getByEstudiante(estudianteId),
    enabled: !!estudianteId,
  });
};

/**
 * Hook para obtener matrículas por aula
 */
export const useMatriculasByAula = (aulaId: number, periodoId?: number) => {
  return useQuery({
    queryKey: ['matriculas', 'aula', aulaId, periodoId],
    queryFn: () => matriculasApi.getByAula(aulaId, periodoId),
    enabled: !!aulaId,
  });
};

/**
 * Hook para importar matrículas
 */
export const useImportMatriculas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => matriculasApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });
};

/**
 * Hook para exportar matrículas
 */
export const useExportMatriculas = () => {
  return useMutation({
    mutationFn: (filters?: MatriculaFilters) => matriculasApi.export(filters),
  });
};

/**
 * Hook para generar ficha de matrícula
 */
export const useGenerarFichaMatricula = () => {
  return useMutation({
    mutationFn: (id: number) => matriculasApi.generateFicha(id),
  });
};
