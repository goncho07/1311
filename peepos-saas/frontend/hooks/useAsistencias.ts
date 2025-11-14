/**
 * ═══════════════════════════════════════════════════════════
 * USE ASISTENCIAS HOOK - Hook para gestión de asistencias
 * ═══════════════════════════════════════════════════════════
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciasApi } from '@/src/api/endpoints';
import type { Asistencia, AsistenciaCreate, AsistenciaFilters } from '@/src/types/models.types';

/**
 * Hook para listar asistencias
 */
export const useAsistencias = (filters?: AsistenciaFilters) => {
  return useQuery({
    queryKey: ['asistencias', filters],
    queryFn: () => asistenciasApi.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener una asistencia por ID
 */
export const useAsistencia = (id: number) => {
  return useQuery({
    queryKey: ['asistencia', id],
    queryFn: () => asistenciasApi.get(id),
    enabled: !!id,
  });
};

/**
 * Hook para registrar asistencia
 */
export const useCreateAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AsistenciaCreate) => asistenciasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
    },
  });
};

/**
 * Hook para registro masivo de asistencias
 */
export const useCreateBulkAsistencias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asistencias: AsistenciaCreate[]) => asistenciasApi.createBulk(asistencias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
    },
  });
};

/**
 * Hook para actualizar asistencia
 */
export const useUpdateAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Asistencia> }) =>
      asistenciasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['asistencia', variables.id] });
    },
  });
};

/**
 * Hook para eliminar asistencia
 */
export const useDeleteAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => asistenciasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
    },
  });
};

/**
 * Hook para obtener asistencias de un estudiante
 */
export const useAsistenciasByEstudiante = (
  estudianteId: number,
  fechaInicio?: string,
  fechaFin?: string
) => {
  return useQuery({
    queryKey: ['asistencias', 'estudiante', estudianteId, fechaInicio, fechaFin],
    queryFn: () => asistenciasApi.getByEstudiante(estudianteId, fechaInicio, fechaFin),
    enabled: !!estudianteId,
  });
};

/**
 * Hook para obtener asistencias por aula y fecha
 */
export const useAsistenciasByAulaAndDate = (aulaId: number, fecha: string) => {
  return useQuery({
    queryKey: ['asistencias', 'aula', aulaId, fecha],
    queryFn: () => asistenciasApi.getByAulaAndDate(aulaId, fecha),
    enabled: !!aulaId && !!fecha,
  });
};

/**
 * Hook para obtener resumen de asistencia
 */
export const useResumenAsistencia = (
  estudianteId: number,
  fechaInicio: string,
  fechaFin: string
) => {
  return useQuery({
    queryKey: ['asistencias', 'resumen', estudianteId, fechaInicio, fechaFin],
    queryFn: () => asistenciasApi.getResumen(estudianteId, fechaInicio, fechaFin),
    enabled: !!estudianteId && !!fechaInicio && !!fechaFin,
  });
};

/**
 * Hook para obtener estadísticas de asistencia por aula
 */
export const useEstadisticasAsistenciaAula = (
  aulaId: number,
  fechaInicio: string,
  fechaFin: string
) => {
  return useQuery({
    queryKey: ['asistencias', 'estadisticas', aulaId, fechaInicio, fechaFin],
    queryFn: () => asistenciasApi.getEstadisticasAula(aulaId, fechaInicio, fechaFin),
    enabled: !!aulaId && !!fechaInicio && !!fechaFin,
  });
};

/**
 * Hook para exportar asistencias
 */
export const useExportAsistencias = () => {
  return useMutation({
    mutationFn: (filters?: AsistenciaFilters) => asistenciasApi.export(filters),
  });
};

/**
 * Hook para generar reporte de asistencia
 */
export const useGenerarReporteAsistencia = () => {
  return useMutation({
    mutationFn: ({
      estudianteId,
      fechaInicio,
      fechaFin,
    }: {
      estudianteId: number;
      fechaInicio: string;
      fechaFin: string;
    }) => asistenciasApi.generateReporte(estudianteId, fechaInicio, fechaFin),
  });
};
