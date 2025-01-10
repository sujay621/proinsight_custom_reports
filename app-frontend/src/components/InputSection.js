import React from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const InputSection = ({ prompt, setPrompt, handleSubmit, loading, disabled }) => {
    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Enter your prompt
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write a prompt to generate reports you have in mind"
                sx={{ mb: 2 }}
                disabled={disabled}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || disabled}
                sx={{ width: '100%' }}
            >
                {loading ? 'Loading...' : 'Submit'}
            </Button>
        </Box>
    );
};

export default InputSection; 