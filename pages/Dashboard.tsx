import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';
import { getDashboardStats, getSalesData, getTopProducts } from '../services/api';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
    pendingOrders: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, sales, products] = await Promise.all([
                    getDashboardStats(),
                    getSalesData(),
                    getTopProducts()
                ]);
                setStats(statsData);
                setSalesData(sales);
                setTopProducts(products);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total Revenue" value={`$${stats?.totalRevenue.toLocaleString()}`} change="+5.2%"/>
                <StatCard title="Total Orders" value={stats?.totalOrders.toString() || '0'} change="+2.1%"/>
                <StatCard title="New Customers" value={stats?.newCustomers.toString() || '0'} change="+1.5%"/>
                <StatCard title="Pending Orders" value={stats?.pendingOrders.toString() || '0'} change="-0.5%"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                   <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Trends</h2>
                   <SalesTrendChart data={salesData} />
                </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Selling Products</h2>
                    <TopProductsChart data={topProducts} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
