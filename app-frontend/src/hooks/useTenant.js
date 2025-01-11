import { useTenantContext } from '../context/TenantContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const useTenant = () => {
    const { selectedTenant, setSelectedTenant } = useTenantContext();

    const selectTenant = async (tenant) => {
        try {
            await axios.post(`${API_BASE_URL}/current-tenant?tenant=${tenant}`);
            setSelectedTenant(tenant);
        } catch (error) {
            console.error('Error setting tenant:', error);
        }
    };

    return { selectedTenant, selectTenant };
}; 