
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
    const isPositive = change.startsWith('+');
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                 <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
};

export default StatCard;
