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
    Chip,
    Stack,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ScheduleDialog = ({ open, onClose, onSubmit }) => {
    const [currentEmail, setCurrentEmail] = useState('');
    const [emails, setEmails] = useState([]);
    const [time, setTime] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [selectedDay, setSelectedDay] = useState('monday');
    const [selectedDate, setSelectedDate] = useState('1');

    const handleAddEmail = () => {
        if (currentEmail && currentEmail.includes('@')) {
            setEmails([...emails, currentEmail]);
            setCurrentEmail('');
        }
    };

    const handleRemoveEmail = (emailToRemove) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    const handleSubmit = () => {
        onSubmit({ 
            emails, 
            time, 
            frequency,
            schedule: frequency === 'weekly' ? selectedDay : 
                     frequency === 'monthly' ? selectedDate : 
                     null
        });
        onClose();
    };

    const isValidForm = () => {
        return emails.length > 0 && 
               time && 
               (frequency === 'daily' || 
                (frequency === 'weekly' && selectedDay) || 
                (frequency === 'monthly' && selectedDate));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Email Input Section */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                            label="Add Email"
                            type="email"
                            value={currentEmail}
                            onChange={(e) => setCurrentEmail(e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <IconButton 
                            onClick={handleAddEmail}
                            color="primary"
                            disabled={!currentEmail || !currentEmail.includes('@')}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>

                    {/* Email Chips */}
                    {emails.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            {emails.map((email, index) => (
                                <Chip
                                    key={index}
                                    label={email}
                                    onDelete={() => handleRemoveEmail(email)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    )}

                    <TextField
                        label="Time"
                        type="time"
                        fullWidth
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 300, // 5 min
                        }}
                        required
                    />

                    <FormControl fullWidth>
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

                    {/* Weekly Day Selector */}
                    {frequency === 'weekly' && (
                        <FormControl fullWidth>
                            <InputLabel>Day of Week</InputLabel>
                            <Select
                                value={selectedDay}
                                label="Day of Week"
                                onChange={(e) => setSelectedDay(e.target.value)}
                            >
                                <MenuItem value="monday">Monday</MenuItem>
                                <MenuItem value="tuesday">Tuesday</MenuItem>
                                <MenuItem value="wednesday">Wednesday</MenuItem>
                                <MenuItem value="thursday">Thursday</MenuItem>
                                <MenuItem value="friday">Friday</MenuItem>
                                <MenuItem value="saturday">Saturday</MenuItem>
                                <MenuItem value="sunday">Sunday</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {/* Monthly Date Selector */}
                    {frequency === 'monthly' && (
                        <FormControl fullWidth>
                            <InputLabel>Date of Month</InputLabel>
                            <Select
                                value={selectedDate}
                                label="Date of Month"
                                onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                {[...Array(31)].map((_, i) => (
                                    <MenuItem key={i + 1} value={(i + 1).toString()}>
                                        {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={!isValidForm()}
                >
                    Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleDialog; 