/**
 * ═══════════════════════════════════════════════════════════
 * USE EVALUACIONES HOOK - Hook para gestión de evaluaciones
 * ═══════════════════════════════════════════════════════════
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '@/src/api/endpoints';
import type { Evaluacion, EvaluacionCreate, EvaluacionFilters } from '@/src/types/models.types';

/**
 * Hook para listar evaluaciones
 */
export const useEvaluaciones = (filters?: EvaluacionFilters) => {
  return useQuery({
    queryKey: ['evaluaciones', filters],
    queryFn: () => evaluacionesApi.list(filters),
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

/**
 * Hook para obtener evaluaciones de un estudiante
 */
export const useEvaluacionesByEstudiante = (
  estudianteId: number,
  periodoId: number,
  bimestre?: string
) => {
  return useQuery({
    queryKey: ['evaluaciones', 'estudiante', estudianteId, periodoId, bimestre],
    queryFn: () => evaluacionesApi.listByEstudiante(estudianteId, periodoId, bimestre),
    enabled: !!estudianteId && !!periodoId,
  });
};

/**
 * Hook para obtener una evaluación por ID
 */
export const useEvaluacion = (id: number) => {
  return useQuery({
    queryKey: ['evaluacion', id],
    queryFn: () => evaluacionesApi.get(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear evaluación
 */
export const useCreateEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EvaluacionCreate) => evaluacionesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });
    },
  });
};

/**
 * Hook para registro masivo de evaluaciones
 */
export const useCreateBulkEvaluaciones = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evaluaciones: EvaluacionCreate[]) => evaluacionesApi.createBulk(evaluaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });
    },
  });
};

/**
 * Hook para actualizar evaluación
 */
export const useUpdateEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Evaluacion> }) =>
      evaluacionesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });
      queryClient.invalidateQueries({ queryKey: ['evaluacion', variables.id] });
    },
  });
};

/**
 * Hook para eliminar evaluación
 */
export const useDeleteEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => evaluacionesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });
    },
  });
};

/**
 * Hook para generar boleta de notas
 */
export const useGenerarBoleta = () => {
  return useMutation({
    mutationFn: ({
      estudianteId,
      periodoId,
      bimestre,
    }: {
      estudianteId: number;
      periodoId: number;
      bimestre: string;
    }) => evaluacionesApi.generarBoleta(estudianteId, periodoId, bimestre),
  });
};

/**
 * Hook para obtener resumen de notas
 */
export const useResumenNotas = (estudianteId: number, periodoId: number) => {
  return useQuery({
    queryKey: ['evaluaciones', 'resumen', estudianteId, periodoId],
    queryFn: () => evaluacionesApi.getResumenNotas(estudianteId, periodoId),
    enabled: !!estudianteId && !!periodoId,
  });
};

/**
 * Hook para obtener estadísticas de un curso
 */
export const useEstadisticasCurso = (cursoId: number, periodoId: number, bimestre: string) => {
  return useQuery({
    queryKey: ['evaluaciones', 'estadisticas', cursoId, periodoId, bimestre],
    queryFn: () => evaluacionesApi.getEstadisticasCurso(cursoId, periodoId, bimestre),
    enabled: !!cursoId && !!periodoId && !!bimestre,
  });
};

/**
 * Hook para obtener historial de evaluaciones
 */
export const useHistorialEvaluaciones = (estudianteId: number, cursoId?: number) => {
  return useQuery({
    queryKey: ['evaluaciones', 'historial', estudianteId, cursoId],
    queryFn: () => evaluacionesApi.getHistorial(estudianteId, cursoId),
    enabled: !!estudianteId,
  });
};

/**
 * Hook para exportar evaluaciones
 */
export const useExportEvaluaciones = () => {
  return useMutation({
    mutationFn: (filters?: EvaluacionFilters) => evaluacionesApi.export(filters),
  });
};
