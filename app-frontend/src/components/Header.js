import React from 'react';
import { AppBar, Toolbar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTenant } from '../hooks/useTenant';

const tenantList = ['alliancerevcycle', 'annuity', 'bca', 'blittandgaines', 'cascade', 
    'cavalry', 'ccmr3', 'creditmanagementcompany', 'creditsolutions3p', 'creditsolutionseo', 
    'crownassetmgmt', 'curofinancial', 'dc1', 'dccpc', 'dcfirstcredit', 'dcrgs', 'dcsyncom', 
    'dfc_use2_000', 'diversefundingassoc', 'ele_use2_000', 'everest', 'ffam', 'firstcreditservices', 
    'firsthelpfinancial', 'gatestonecpe', 'gatestonesci', 'gatestoneus', 'gatestoneusaa', 'grc', 
    'halsted', 'harrisandharris', 'hcm', 'holliscobb', 'icaglaw', 'icajuba', 'icamfiman', 'icbh', 
    'icbw', 'icca2', 'iccaf', 'icdatamax', 'icfcr', 'icffr', 'icgbs', 'iclcs', 'icljross', 'icmlc', 
    'icpr', 'icprocom', 'icsparklight', 'icsra', 'icsyncom', 'icucb', 'icucbeo', 'icucbmed', 
    'invcustomerservice', 'investinet', 'invinvestigations', 'koalafi', 'kohnlawfirm', 'mars', 
    'mcy_use2_000', 'mendelsonlawfirm', 'moorelaw', 'nes', 'nra', 'optio', 'pendrick', 'philipscohen', 
    'prosper', 'psb', 'rashcurtis', 'resurgent', 'revenuecycle', 'rfs', 'secservices', 'sequium', 
    'sherloq', 'sho', 'sna_use2_000', 'springoak', 'stenger', 'stillmanlaw', 'timepayment', 
    'trk_use2_000', 'trueaccord', 'tsi_use2_000', 'unifin', 'universalcredit', 'universalfidelity', 
    'zarzaurandschwartz', 'zwicker'];

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
                        {tenantList.map((tenant) => (
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