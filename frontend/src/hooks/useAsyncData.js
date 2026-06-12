import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Reusable hook to fetch data with loading/error states
 * Eliminates 50+ lines of duplicate code across StudentTasks, StudentPerformance, AdminTasks, etc.
 * 
 * Usage:
 * const { data, loading, error, refetch } = useAsyncData('/student/tasks', []);
 */
export function useAsyncData(url, dependencies = [], transformFn = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(url);
        
        if (isMounted) {
          const processedData = transformFn ? transformFn(res.data) : res.data;
          setData(processedData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          console.error(`Error fetching ${url}:`, err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(url);
      const processedData = transformFn ? transformFn(res.data) : res.data;
      setData(processedData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
