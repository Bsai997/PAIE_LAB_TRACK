import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetch(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [url, token]);

  return { data, loading, error };
}
