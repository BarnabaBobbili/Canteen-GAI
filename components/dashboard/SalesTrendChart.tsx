
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesTrendChartProps {
    data: any[];
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#4f46e5" activeDot={{ r: 8 }} strokeWidth={2}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesTrendChart;
