import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const useQuery = () => {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedSQL, setGeneratedSQL] = useState(null);

    const executeQuery = async (prompt, tenant) => {
        setLoading(true);
        setError(null);
        
        try {
            // First, get the SQL query from the LLM
            const queryResponse = await axios.post(`${API_BASE_URL}/fetch-query`, {
                query: prompt,
                tenant: tenant
            });

            const sqlQuery = queryResponse.data.generated_sql;
            setGeneratedSQL(sqlQuery);

            // Then execute the generated query
            const resultsResponse = await axios.post(`${API_BASE_URL}/execute-query`, {
                query: sqlQuery,
                tenant: tenant
            });

            if (resultsResponse.data.results) {
                setResults(resultsResponse.data.results);
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

    return { results, error, loading, generatedSQL, executeQuery };
}; 