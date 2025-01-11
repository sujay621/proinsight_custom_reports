import React, { useState } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import ScheduleDialog from './components/ScheduleDialog';
import SendEmailDialog from './components/SendEmailDialog';
import { Button, Container, Box } from '@mui/material';
import { TenantProvider } from './context/TenantContext';
import { useTenant } from './hooks/useTenant';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

// Create a wrapper component to use the context
const AppContent = () => {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [openSendEmailDialog, setOpenSendEmailDialog] = useState(false);
    const { selectedTenant } = useTenant();

    const handleScheduleSubmit = async (scheduleData) => {
        try {
            // Here you would typically make an API call to save the schedule
            console.log('Schedule Data:', {
                tenant: selectedTenant,
                ...scheduleData
            });
            
            // Example API call (uncomment and modify as needed):
            // await axios.post('http://localhost:8000/schedule-report', {
            //     tenant: selectedTenant,
            //     ...scheduleData
            // });
            
            // Show success message or handle response
        } catch (error) {
            console.error('Error scheduling report:', error);
            // Handle error (show error message, etc.)
        }
    };

    const convertToCSV = (results) => {
        if (!results || results.length === 0) return '';
        
        // Get headers from the first result object
        const headers = Object.keys(results[0]);
        
        // Create CSV header row
        const headerRow = headers.join(',');
        
        // Create CSV data rows
        const dataRows = results.map(row => {
            return headers.map(header => {
                // Handle cases where the value might contain commas or quotes
                let value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                value = value.toString();
                // Escape quotes and wrap in quotes if contains comma or quote
                if (value.includes('"') || value.includes(',')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        // Combine header and data rows
        return [headerRow, ...dataRows].join('\n');
    };

    const handleSendNowSubmit = async (emailData) => {
        try {
            // Convert results to CSV
            const csvData = convertToCSV(results);
            
            // Create a Blob containing the CSV data
            const blob = new Blob([csvData], { type: 'text/csv' });
            
            // Create FormData object to send file
            const formData = new FormData();
            formData.append('file', blob, 'report.csv');
            formData.append('emails', JSON.stringify(emailData.emails));

            // Send POST request with FormData
            const response = await axios.post(`${API_BASE_URL}/send-report`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Report sent successfully:', response.data);
            // You might want to show a success message to the user here
            
        } catch (error) {
            console.error('Error sending report:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <Header />
            <QueryForm setResults={setResults} setError={setError} />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {!error && results && selectedTenant && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenSendEmailDialog(true)}
                        >
                            Send Now
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
            </Container>

            <ScheduleDialog
                open={openScheduleDialog}
                onClose={() => setOpenScheduleDialog(false)}
                onSubmit={handleScheduleSubmit}
            />
            <SendEmailDialog
                open={openSendEmailDialog}
                onClose={() => setOpenSendEmailDialog(false)}
                onSubmit={handleSendNowSubmit}
            />
        </div>
    );
};

const App = () => {
    return (
        <TenantProvider>
            <AppContent />
        </TenantProvider>
    );
};

export default App;
