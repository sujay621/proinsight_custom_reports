import React, { useState, useEffect } from 'react';
import { useQuery } from '../hooks/useQuery';
import { useTenant } from '../hooks/useTenant';
import MetadataTable from './MetadataTable';
import ResultsTable from './ResultsTable';
import InputSection from './InputSection';
import { LoadingState, ErrorMessage } from './LoadingState';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';

function QueryForm({ setResults, setError }) {
    const [prompt, setPrompt] = useState('');
    const { results, error, loading, generatedSQL, executeQuery } = useQuery();
    const { selectedTenant } = useTenant();

    const metadataInfo = [
        { column: "agent_id", type: "string", description: "Unique identifier for each agent" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTenant) {
            setError('Please select a tenant first');
            return;
        }
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        await executeQuery(prompt, selectedTenant);
    };

    useEffect(() => {
        setResults(results);
        setError(error);
    }, [results, error, setResults, setError]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 3 }}>
                {!selectedTenant && (
                    <Typography color="error">
                        Please select a tenant to proceed
                    </Typography>
                )}
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <InputSection 
                            prompt={prompt} 
                            setPrompt={setPrompt} 
                            handleSubmit={handleSubmit} 
                            loading={loading}
                            disabled={!selectedTenant}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        {generatedSQL && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Generated SQL Query
                                </Typography>
                                <pre style={{ 
                                    backgroundColor: '#f5f5f5',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    overflowX: 'auto'
                                }}>
                                    {generatedSQL}
                                </pre>
                            </Box>
                        )}
                        <Typography variant="h6" gutterBottom>
                            Available Metadata
                        </Typography>
                        <MetadataTable metadataInfo={metadataInfo} />
                    </Paper>
                </Grid>
            </Grid>

            {loading && <LoadingState />}
            {error && <ErrorMessage error={error} />}
            {!loading && results && (
                <Paper sx={{ mt: 3, p: 2 }}>
                    <ResultsTable results={results} />
                </Paper>
            )}
        </Container>
    );
}

export default QueryForm; 