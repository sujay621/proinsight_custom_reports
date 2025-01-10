import React, { useState } from 'react';

function QueryForm() {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Query submitted:', query);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your SQL query"
                    rows="4"
                    style={{ width: '100%', marginBottom: '10px' }}
                />
                <button type="submit">Execute Query</button>
            </form>
        </div>
    );
}

export default QueryForm; 