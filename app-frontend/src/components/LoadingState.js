import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingState = () => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
                mt: 2
            }}
        >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
                Processing your request...
            </Typography>
        </Box>
    );
};

export const ErrorMessage = ({ error }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography 
                color="error" 
                sx={{ 
                    p: 2, 
                    bgcolor: 'error.light', 
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
            >
                {error}
            </Typography>
        </Box>
    );
};

export { LoadingState };