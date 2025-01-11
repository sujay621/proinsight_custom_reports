import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Chip,
    Stack,
} from '@mui/material';

const SendEmailDialog = ({ open, onClose, onSubmit }) => {
    const [currentEmail, setCurrentEmail] = useState('');
    const [emails, setEmails] = useState([]);

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
        onSubmit({ emails });
        setEmails([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Send Report Now</DialogTitle>
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
                        <Button 
                            onClick={handleAddEmail}
                            variant="contained"
                            size="small"
                            disabled={!currentEmail || !currentEmail.includes('@')}
                            sx={{ mt: 1 }}
                        >
                            Add
                        </Button>
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={emails.length === 0}
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendEmailDialog; 