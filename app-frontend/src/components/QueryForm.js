import React, { useState, useEffect } from 'react';
import { useQuery } from '../hooks/useQuery';
import MetadataTable from './MetadataTable';
import ResultsTable from './ResultsTable';
import InputSection from './InputSection';
import { LoadingState, ErrorMessage } from './LoadingState';
import { Container, Grid, Paper, Typography } from '@mui/material';

function QueryForm({ setResults, setError }) {
    const [prompt, setPrompt] = useState('');
    const { results, error, loading, executeQuery } = useQuery();

    const metadataInfo = [
        { column: "agent_id", type: "string", description: "Unique identifier for each agent" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const hardcodedQuery = `
            SELECT agent_id, 
                   count(*) as Answering_Machine 
            FROM main.samudra_v2_silver.voice_mvp_alliancerevcycle__call_data 
            WHERE called_at > '2024-12-01' 
            AND called_at < '2025-01-02' 
            AND ARRAY_CONTAINS(tags, 'generic/Answering Machine') 
            GROUP BY agent_id
        `;
        executeQuery(hardcodedQuery);
    };

    // Update results and error state in App.js
    useEffect(() => {
        setResults(results);
        setError(error);
    }, [results, error, setResults, setError]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <InputSection 
                            prompt={prompt} 
                            setPrompt={setPrompt} 
                            handleSubmit={handleSubmit} 
                            loading={loading} 
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            List Metadata
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