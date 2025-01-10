import React from 'react';

function Header() {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <img src="/prodigal logo.svg" alt="Prodigal logo" style={{ height: '40px' }} />
            <select 
                style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    width: '200px',
                    border: '1px solid #ccc' 
                }}
            >
                <option value="">Select tenant</option>
                {/* Add tenant options here */}
            </select>
        </div>
    );
}

export default Header; 