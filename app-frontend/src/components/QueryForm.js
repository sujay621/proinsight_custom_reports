import React, { useState, useEffect } from 'react';
import { useQuery } from '../hooks/useQuery';
import { useTenant } from '../hooks/useTenant';
import MetadataTable from './MetadataTable';
import ResultsTable from './ResultsTable';
import InputSection from './InputSection';
import { LoadingState, ErrorMessage } from './LoadingState';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import EmailDialog from './EmailDialog';

function QueryForm({ setResults, setError }) {
    const [prompt, setPrompt] = useState('');
    const { results, error, loading, executeQuery } = useQuery();
    const { selectedTenant } = useTenant();
    const [openSendDialog, setOpenSendDialog] = useState(false);
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);

    const metadataInfo = [
        { column: "agent_id", type: "string", description: "Unique identifier for each agent" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTenant) {
            setError('Please select a tenant first');
            return;
        }
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

    useEffect(() => {
        setResults(results);
        setError(error);
    }, [results, error, setResults, setError]);

    const isValidTenant = selectedTenant && selectedTenant !== "";

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 3 }}>
                {!isValidTenant && (
                    <Typography color="error">
                        Please select a tenant to proceed
                    </Typography>
                )}
            </Box>
            <Box sx={{ 
                display: 'flex', 
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' } 
            }}>
                <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 2 }}>
                        <InputSection 
                            prompt={prompt} 
                            setPrompt={setPrompt} 
                            handleSubmit={handleSubmit} 
                            loading={loading}
                            disabled={!isValidTenant}
                        />
                    </Paper>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 2, opacity: isValidTenant ? 1 : 0.5 }}>
                        <Typography variant="h6" gutterBottom>
                            List Metadata
                        </Typography>
                        <MetadataTable metadataInfo={metadataInfo} />
                    </Paper>
                </Box>
            </Box>

            {loading && <LoadingState />}
            {error && <ErrorMessage error={error} />}
            {!loading && results && (
                <Paper sx={{ mt: 3, p: 2 }}>
                    <ResultsTable results={results} />
                </Paper>
            )}

            {results && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => setOpenSendDialog(true)}
                    >
                        Send Reports
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => setOpenScheduleDialog(true)}
                    >
                        Approve & Schedule
                    </Button>
                </Box>
            )}

            <EmailDialog
                open={openSendDialog}
                handleClose={() => setOpenSendDialog(false)}
                isScheduled={false}
            />
            <EmailDialog
                open={openScheduleDialog}
                handleClose={() => setOpenScheduleDialog(false)}
                isScheduled={true}
            />
        </Container>
    );
}

export default QueryForm; 