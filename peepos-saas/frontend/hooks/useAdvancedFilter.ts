import { useState, useMemo, useCallback, useEffect } from 'react';
import { SortConfig, SearchTag, GenericUser, Student } from '@/types';

// Helper type guards
const isStudent = (user: any): user is Student => user && 'studentCode' in user;

// Configuration for the filter hook
export interface FilterConfig<T> {
  getId: (item: T) => string;
  getFullName: (item: T) => string;
  // Function to create a specific tag (like grade or status)
  createSpecializedTag: (value: string, items: T[]) => SearchTag | null;
  // Function to apply filters based on tags
  applyTagFilters: (items: T[], tags: SearchTag[]) => T[];
}

export const useAdvancedFilter = <T,>(
  items: T[],
  filterConfig: FilterConfig<T>,
  rowsPerPage: number = 10
) => {
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'fullName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddTag = useCallback(
    (value: string) => {
      const lowerValue = value.toLowerCase().trim();
      if (searchTags.some((t) => t.value.toLowerCase() === lowerValue || t.displayValue.toLowerCase() === lowerValue)) return;

      // Try to create a specialized tag first (e.g., grade, status)
      let newTag = filterConfig.createSpecializedTag(lowerValue, items);

      // If not, create a generic keyword tag
      if (!newTag) {
        const isValid = items.some(
          (item) =>
            filterConfig.getFullName(item).toLowerCase().includes(lowerValue) || filterConfig.getId(item).includes(lowerValue)
        );
        newTag = { value: value, displayValue: value, type: 'keyword', isValid };
      }

      setSearchTags((prev) => [...prev, newTag!]);
    },
    [items, searchTags, filterConfig]
  );

  const handleRemoveTag = useCallback((value: string) => {
    setSearchTags((prev) => prev.filter((t) => t.value !== value));
  }, []);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTags([]);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTags, items]);

  const filteredItems = useMemo(() => {
    let filtered = filterConfig.applyTagFilters(items, searchTags);

    if (sortConfig) {
      // Create a mutable copy for sorting
      filtered = [...filtered];
      filtered.sort((a, b) => {
        // Special handling for fullName which is not a direct property on GenericUser
        const aVal = sortConfig.key === 'fullName' ? filterConfig.getFullName(a) : (a as any)[sortConfig.key];
        const bVal = sortConfig.key === 'fullName' ? filterConfig.getFullName(b) : (b as any)[sortConfig.key];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [items, searchTags, sortConfig, filterConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    // State
    searchTags,
    sortConfig,
    currentPage,

    // Derived Data
    paginatedItems,
    totalPages,
    filteredCount: filteredItems.length,

    // Actions
    handleAddTag,
    handleRemoveTag,
    handleSort,
    setCurrentPage,
    clearFilters,
  };
};