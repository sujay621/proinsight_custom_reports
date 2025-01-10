import React from 'react';
import './QueryForm.css';

const MetadataTable = ({ metadataInfo }) => {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th className="tableHeaderStyle">Column</th>
                    <th className="tableHeaderStyle">Type</th>
                    <th className="tableHeaderStyle">Description</th>
                </tr>
            </thead>
            <tbody>
                {metadataInfo.map((info, index) => (
                    <tr key={index}>
                        <td className="tableCellStyle">{info.column}</td>
                        <td className="tableCellStyle">{info.type}</td>
                        <td className="tableCellStyle">{info.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MetadataTable; 