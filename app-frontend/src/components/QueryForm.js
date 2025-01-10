import React, { useState } from 'react';

function QueryForm() {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Query submitted:', query);
    };

    return (
        <div style={{ 
            padding: '20px',
            display: 'flex',
            gap: '20px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <h3>Enter the prompt</h3>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Create a report that's in your mind by writing a prompt here"
                        rows="8"
                        style={{ 
                            width: '100%', 
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button 
                        type="submit"
                        onClick={handleSubmit}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
            <div style={{ 
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px'
            }}>
                <h3>List metadata</h3>
                {/* Results will be displayed here */}
            </div>
        </div>
    );
}

export default QueryForm; 