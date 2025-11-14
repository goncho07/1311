/**
 * ═══════════════════════════════════════════════════════════
 * ESTUDIANTES PAGE - Adaptado para usar API real
 * ═══════════════════════════════════════════════════════════
 *
 * CAMBIOS REALIZADOS:
 * - ✅ Usar useEstudiantes hook (React Query)
 * - ✅ Paginación real de API
 * - ✅ Filtros conectados a la API
 * - ✅ Estados de loading y error
 * - ✅ Mutations para crear/editar/eliminar
 * - ✅ Invalidación automática de cache
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import {
  useEstudiantes,
  useCreateEstudiante,
  useDeleteEstudiante,
  useImportEstudiantes,
  useExportEstudiantes,
} from '@/hooks/useEstudiantes';
import type { EstudianteFilters } from '@/src/types/models.types';
import toast from 'react-hot-toast';

const EstudiantesPage: React.FC = () => {
  const navigate = useNavigate();

  // 🔴 CAMBIO 1: Estado de filtros (conectados a la API)
  const [filters, setFilters] = useState<EstudianteFilters>({
    page: 1,
    per_page: 20,
    search: '',
    grado: undefined,
    seccion: undefined,
    turno: undefined,
    situacion: 'MATRICULADO',
  });

  // 🔴 CAMBIO 2: Usar React Query hooks (datos reales de API)
  const { data, isLoading, error, refetch } = useEstudiantes(filters);
  const createMutation = useCreateEstudiante();
  const deleteMutation = useDeleteEstudiante();
  const importMutation = useImportEstudiantes();
  const exportMutation = useExportEstudiantes();

  // ════════════════════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════════════════════

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (field: keyof EstudianteFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreate = () => {
    // Abrir modal de creación
    // Por ahora, redirige a formulario de creación
    navigate('/estudiantes/nuevo');
  };

  const handleEdit = (id: number) => {
    navigate(`/estudiantes/${id}/editar`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      // 🔴 React Query invalida automáticamente el cache
      // La lista se refresca automáticamente
      toast.success('Estudiante eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando estudiante:', error);
      toast.error('Error al eliminar estudiante');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importMutation.mutateAsync(file);
      toast.success(`Importación exitosa: ${result.imported} estudiantes importados`);
    } catch (error: any) {
      console.error('Error importando:', error);
      toast.error('Error al importar archivo');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);

      // Descargar archivo Excel
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo exportado exitosamente');
    } catch (error: any) {
      console.error('Error exportando:', error);
      toast.error('Error al exportar datos');
    }
  };

  // ════════════════════════════════════════════════════════
  // ESTADOS DE CARGA Y ERROR
  // ════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-6">
        <p className="text-red-700 font-semibold">Error al cargar estudiantes</p>
        <p className="text-red-600 text-sm mt-2">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // 🔴 CAMBIO 3: Extraer datos de la respuesta paginada
  const estudiantes = data?.data || [];
  const meta = data?.meta;

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de estudiantes matriculados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download size={20} />
            {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload size={20} />
            Importar
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
              disabled={importMutation.isPending}
            />
          </label>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o código..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Grado */}
          <select
            value={filters.grado || ''}
            onChange={(e) => handleFilterChange('grado', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los grados</option>
            <option value="1°">1° Grado</option>
            <option value="2°">2° Grado</option>
            <option value="3°">3° Grado</option>
            <option value="4°">4° Grado</option>
            <option value="5°">5° Grado</option>
          </select>

          {/* Filtro Sección */}
          <select
            value={filters.seccion || ''}
            onChange={(e) => handleFilterChange('seccion', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las secciones</option>
            <option value="A">Sección A</option>
            <option value="B">Sección B</option>
            <option value="C">Sección C</option>
            <option value="D">Sección D</option>
          </select>

          {/* Filtro Situación */}
          <select
            value={filters.situacion || ''}
            onChange={(e) => handleFilterChange('situacion', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las situaciones</option>
            <option value="MATRICULADO">Matriculado</option>
            <option value="TRASLADADO">Trasladado</option>
            <option value="RETIRADO">Retirado</option>
          </select>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado/Sección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estudiantes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron estudiantes con los filtros seleccionados
                </td>
              </tr>
            ) : (
              estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estudiante.codigo_estudiante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {estudiante.usuario?.nombre_completo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {estudiante.usuario?.email || 'Sin email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estudiante.usuario?.dni || 'No registrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estudiante.grado} - {estudiante.seccion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estudiante.turno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        estudiante.situacion === 'MATRICULADO'
                          ? 'bg-green-100 text-green-800'
                          : estudiante.situacion === 'TRASLADADO'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {estudiante.situacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(estudiante.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(estudiante.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={deleteMutation.isPending}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {meta && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {meta.from} a {meta.to} de {meta.total} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page === meta.last_page}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstudiantesPage;

/**
 * 📝 NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. React Query maneja automáticamente:
 *    - Cache de datos (5 minutos por defecto)
 *    - Revalidación en background
 *    - Estados de loading/error
 *    - Invalidación de cache después de mutations
 *
 * 2. Los filtros se sincronizan con la URL de la API:
 *    - Paginación: page, per_page
 *    - Búsqueda: search
 *    - Filtros específicos: grado, seccion, turno, situacion
 *
 * 3. Mutations (create, update, delete):
 *    - Invalidan automáticamente el cache
 *    - Refrescan la lista sin recargar la página
 *
 * 4. Importar/Exportar:
 *    - Usa FormData para enviar archivos
 *    - Descarga blobs para Excel
 */
