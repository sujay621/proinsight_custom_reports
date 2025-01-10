import { useState } from 'react';
import axios from 'axios';

export const useQuery = () => {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const executeQuery = async (query) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8000/execute-query', {
                query: query.trim()
            });

            if (response.data.results) {
                setResults(response.data.results);
            } else {
                setError('No results returned');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.detail || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { results, error, loading, executeQuery };
}; 