import { useTenantContext } from '../context/TenantContext';
import axios from 'axios';

export const useTenant = () => {
    const { selectedTenant, setSelectedTenant } = useTenantContext();

    const selectTenant = async (tenant) => {
        try {
            await axios.post(`http://localhost:8000/current-tenant?tenant=${tenant}`);
            setSelectedTenant(tenant);
        } catch (error) {
            console.error('Error setting tenant:', error);
        }
    };

    return { selectedTenant, selectTenant };
}; 