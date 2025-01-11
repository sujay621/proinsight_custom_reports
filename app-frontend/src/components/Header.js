import React from 'react';
import { AppBar, Toolbar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTenant } from '../hooks/useTenant';
import { TENANT_LIST } from '../constants/tenants';

function Header() {
    const { selectedTenant, selectTenant } = useTenant();

    const handleTenantChange = async (event) => {
        const tenant = event.target.value;
        await selectTenant(tenant);
    };

    return (
        <AppBar position="static" color="default">
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <img src="/prodigal logo.svg" alt="Prodigal logo" style={{ height: '40px' }} />
                <FormControl variant="outlined" style={{ width: '300px' }}>
                    <InputLabel id="tenant-select-label">Tenant</InputLabel>
                    <Select
                        labelId="tenant-select-label"
                        value={selectedTenant || ''}
                        onChange={handleTenantChange}
                        label="Tenant"
                    >
                        <MenuItem value="">
                            <em>Select tenant</em>
                        </MenuItem>
                        {TENANT_LIST.map((tenant) => (
                            <MenuItem key={tenant} value={tenant}>
                                {tenant}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Toolbar>
        </AppBar>
    );
}

export default Header; 