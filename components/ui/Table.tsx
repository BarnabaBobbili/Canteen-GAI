
import React from 'react';

interface Column {
    header: string;
    accessor: string;
    cell?: (value: any, item: any) => React.ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length > 0 ? data.map((item, index) => (
                        <tr key={item.id || index}>
                            {columns.map((col) => (
                                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {col.cell ? col.cell(item[col.accessor], item) : item[col.accessor]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    {onEdit && <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-900">Edit</button>}
                                    {onDelete && <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">Delete</button>}
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr>
                           <td colSpan={columns.length + 1} className="text-center py-4 text-gray-500">No data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;