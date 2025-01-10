import React from 'react';
import './QueryForm.css';

const ResultsTable = ({ results }) => {
    if (!results || results.length === 0) return null;

    const columns = Object.keys(results[0]);

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Query Results</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
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
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
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