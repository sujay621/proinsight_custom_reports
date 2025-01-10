import React from 'react';
import { AppBar, Toolbar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function Header() {
    return (
        <AppBar position="static" color="default">
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <img src="/prodigal logo.svg" alt="Prodigal logo" style={{ height: '40px' }} />
                <FormControl variant="outlined" style={{ width: '200px' }}>
                    <InputLabel id="tenant-select-label">Tenant</InputLabel>
                    <Select
                        labelId="tenant-select-label"
                        defaultValue=""
                        label="Tenant"
                    >
                        <MenuItem value="" disabled>
                            Select tenant
                        </MenuItem>
                        <MenuItem value="tenant1">Tenant 1</MenuItem>
                        <MenuItem value="tenant2">Tenant 2</MenuItem>
                    </Select>
                </FormControl>
            </Toolbar>
        </AppBar>
    );
}

export default Header; 