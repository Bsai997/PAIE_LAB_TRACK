import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Reusable hook for paginated filtering and search
 * Eliminates 40+ lines of duplicate filter logic across SuperAdminStudents, SuperAdminTaskStudents, etc.
 * 
 * Usage:
 * const { data, loading, filters, setFilter } = useFilteredList(
 *   '/superadmin/students',
 *   { search: '', branch: 'all' }
 * );
 */
export function useFilteredList(apiUrl, initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(apiUrl, { params: filters });
        
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          console.error(`Error fetching from ${apiUrl}:`, err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [Object.values(filters).join(',')]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    data,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
  };
}
