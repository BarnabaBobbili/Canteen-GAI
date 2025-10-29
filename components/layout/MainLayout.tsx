
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import Users from '../../pages/Users';
import Products from '../../pages/Products';
import Orders from '../../pages/Orders';
import Settings from '../../pages/Settings';
import Inventory from '../../pages/Inventory';
import NewOrder from '../../pages/NewOrder';
import Suppliers from '../../pages/Suppliers';
import Discounts from '../../pages/Discounts';

const MainLayout: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'NewOrder':
                return <NewOrder setCurrentPage={setCurrentPage} />;
            case 'Orders':
                return <Orders setCurrentPage={setCurrentPage} />;
            case 'Products':
                return <Products />;
            case 'Inventory':
                return <Inventory />;
            case 'Suppliers':
                return <Suppliers />;
            case 'Discounts':
                return <Discounts />;
            case 'Users':
                return <Users />;
            case 'Settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
