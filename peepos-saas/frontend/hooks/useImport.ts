import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi, type ImportBatch, type ImportFile, type ImportRecord, type BatchEstado } from '@/src/api/endpoints/import';

const QUERY_KEYS = {
  batches: ['import', 'batches'] as const,
  batch: (id: number) => ['import', 'batch', id] as const,
  file: (id: number) => ['import', 'file', id] as const,
  records: (fileId: number, estado?: string) => ['import', 'records', fileId, estado] as const,
};

export const useImportBatches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.batches,
    queryFn: () => importApi.listarBatches(),
  });
};

export const useImportBatch = (batchId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.batch(batchId),
    queryFn: () => importApi.obtenerBatch(batchId),
    enabled: options?.enabled ?? true,
    refetchInterval: (data) => {
      if (data && (data.estado === 'EN_PROGRESO' || data.estado === 'PENDIENTE')) {
        return 3000;
      }
      return false;
    },
  });
};

export const useImportFile = (fileId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.file(fileId),
    queryFn: () => importApi.obtenerArchivo(fileId),
  });
};

export const useImportRecords = (fileId: number, estado?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.records(fileId, estado),
    queryFn: () => importApi.obtenerRegistros(fileId, estado),
  });
};

export const useCrearBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nombre?: string; archivos: File[] }) => 
      importApi.crearBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batches });
    },
  });
};

export const useActualizarRegistro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: { datos_mapeados: Record<string, any> } }) => 
      importApi.actualizarRegistro(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['import', 'records'] });
    },
  });
};

export const useConfirmarImportacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: number) => importApi.confirmarImportacion(batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batch(batchId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batches });
    },
  });
};

export const useCancelarBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: number) => importApi.cancelarBatch(batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batch(batchId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batches });
    },
  });
};
