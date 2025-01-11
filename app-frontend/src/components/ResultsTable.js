import React from 'react';
import './QueryForm.css';

const ResultsTable = ({ results }) => {
    if (!results || results.length === 0) return null;

    const columns = Object.keys(results[0]);

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Query Results</h3>
            <div style={{ 
                overflowX: 'auto', 
                maxHeight: '400px', // Adjust the height as needed
                overflowY: 'auto', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                backgroundColor: '#f9f9f9'
            }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    marginTop: '10px' 
                }}>
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <th key={column} className="tableHeaderStyle">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f2f2f2' }}>
                                {columns.map(column => (
                                    <td key={column} className="tableCellStyle">
                                        {row[column]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable; 