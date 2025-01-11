import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EmailDialog = ({ open, handleClose, isScheduled = false }) => {
    const [email, setEmail] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [time, setTime] = useState(new Date());
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        if (!email.endsWith('@prodigaltech.com')) {
            setEmailError('Email must be from prodigaltech.com domain');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = () => {
        if (!validateEmail(email)) return;

        if (isScheduled) {
            console.log('Scheduling report:', {
                email,
                frequency,
                time: time.toLocaleTimeString()
            });
        } else {
            console.log('Sending report to:', email);
        }
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isScheduled ? 'Schedule Report' : 'Send Report'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!emailError}
                        helperText={emailError}
                        sx={{ mb: 2 }}
                    />

                    {isScheduled && (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    value={frequency}
                                    label="Frequency"
                                    onChange={(e) => setFrequency(e.target.value)}
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>

                            <Typography variant="subtitle2" gutterBottom>
                                Select Time
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DesktopTimePicker
                                    value={time}
                                    onChange={(newTime) => setTime(newTime)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {isScheduled ? 'Schedule' : 'Send'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailDialog; 