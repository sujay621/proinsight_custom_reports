import React, { useState, useEffect } from 'react';
import { 
    TextField, Button, Box, Typography, Select, MenuItem, 
    FormControl, InputLabel, Chip, OutlinedInput, Checkbox,
    ListItemText, Stack
} from '@mui/material';
import { QUICK_REPORTS, FREQUENCY_OPTIONS, AVAILABLE_TAGS } from '../constants/parameters';
import { useTenant } from '../hooks/useTenant';
import axios from 'axios';

const InputSection = ({ prompt, setPrompt, handleSubmit, loading, disabled }) => {
    const [selectedReport, setSelectedReport] = useState('Smart Report');
    const [frequency, setFrequency] = useState('');
    const [scorecards, setScorecards] = useState([]);
    const [selectedScorecard, setSelectedScorecard] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const { selectedTenant } = useTenant();

    useEffect(() => {
        const fetchScorecards = async () => {
            if (selectedReport === 'Scorecard review report' && selectedTenant) {
                try {
                    const response = await axios.get(`http://localhost:8000/scorecards/${selectedTenant}`);
                    setScorecards(response.data.scorecards);
                } catch (error) {
                    console.error('Error fetching scorecards:', error);
                }
            }
        };

        fetchScorecards();
    }, [selectedReport, selectedTenant]);

    const handleQuickReportChange = (event) => {
        const value = event.target.value;
        setSelectedReport(value);
        setFrequency('');
        setSelectedScorecard('');
        setSelectedTags([]);
        setPrompt('');
    };

    const handleTagChange = (event) => {
        const value = event.target.value;
        setSelectedTags(typeof value === 'string' ? value.split(',') : value);
    };

    const handleDeleteTag = (tagToDelete) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToDelete));
    };

    const handleQuickReportSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const reportData = {
                report_type: selectedReport,
                frequency: frequency,
                tenant: selectedTenant
            };

            if (selectedReport === 'Scorecard review report') {
                if (!frequency || !selectedScorecard) {
                    console.error('Please select all required fields');
                    return;
                }
                reportData.scorecard_name = selectedScorecard;
            } 
            else if (selectedReport === 'Tag based report') {
                if (!frequency || selectedTags.length === 0) {
                    console.error('Please select frequency and at least one tag');
                    return;
                }
                reportData.selected_tags = selectedTags;
            }

            console.log('Submitting report with data:', reportData);
            const response = await axios.post('http://localhost:8000/quick-report', reportData);
            console.log('Report generated:', response.data);
            
            // Here you can handle the response, maybe show a success message
            // or update some UI state to show the report was generated

        } catch (error) {
            console.error('Error generating report:', error);
            // Handle error, maybe show an error message to the user
        }
    };

    return (
        <Box component="form" onSubmit={selectedReport === 'Smart Report' ? handleSubmit : handleQuickReportSubmit} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Generate Custom Report
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Report Type</InputLabel>
                <Select
                    value={selectedReport}
                    onChange={handleQuickReportChange}
                    label="Select Report Type"
                    disabled={disabled}
                >
                    <MenuItem value="Smart Report">Smart Report</MenuItem>
                    <MenuItem value="" disabled>
                        ─────Quick Report Suggestions───────
                    </MenuItem>
                    {QUICK_REPORTS.map((report) => (
                        <MenuItem key={report} value={report}>
                            {report}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {(selectedReport === 'Scorecard review report' || selectedReport === 'Tag based report') && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        label="Frequency"
                    >
                        {FREQUENCY_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {selectedReport === 'Scorecard review report' && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Scorecard</InputLabel>
                    <Select
                        value={selectedScorecard}
                        onChange={(e) => setSelectedScorecard(e.target.value)}
                        label="Select Scorecard"
                    >
                        {scorecards.map((scorecard) => (
                            <MenuItem key={scorecard} value={scorecard}>
                                <Checkbox 
                                    checked={selectedScorecard === scorecard}
                                    sx={{ mr: 1 }}
                                />
                                {scorecard}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {selectedReport === 'Tag based report' && (
                <>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Tags</InputLabel>
                        <Select
                            multiple
                            value={selectedTags}
                            onChange={handleTagChange}
                            input={<OutlinedInput label="Select Tags" />}
                            displayEmpty
                            renderValue={() => ""}
                            sx={{ 
                                height: '56px',
                                '.MuiSelect-select': { 
                                    paddingY: '14px' 
                                }
                            }}
                        >
                            {AVAILABLE_TAGS.map((tag) => (
                                <MenuItem key={tag} value={tag}>
                                    <Checkbox 
                                        checked={selectedTags.indexOf(tag) > -1}
                                        sx={{ mr: 1 }}
                                    />
                                    {tag}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedTags.length > 0 && (
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            p: 2, 
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            mb: 3,
                            backgroundColor: '#f8f9fa'
                        }}>
                            {selectedTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </>
            )}

            {selectedReport === 'Smart Report' && (
                <>
                    <Typography variant="subtitle2" gutterBottom>
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
                </>
            )}

            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || disabled || (
                        selectedReport === 'Scorecard review report' && (!frequency || !selectedScorecard)
                    ) || (
                        selectedReport === 'Tag based report' && (!frequency || selectedTags.length === 0)
                    ) || (
                        selectedReport === 'Smart Report' && !prompt.trim()
                    )}
                    sx={{ flex: 1 }}
                >
                    {loading ? 'Loading...' : 'Submit'}
                </Button>
            </Stack>
        </Box>
    );
};

export default InputSection; 