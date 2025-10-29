
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { NAVIGATION_ITEMS } from '../../constants';
import { DashboardIcon, OrdersIcon, ProductsIcon, UsersIcon, SettingsIcon, LogoutIcon, CloseIcon, InventoryIcon, SupplierIcon, DiscountIcon, NewOrderIcon } from '../icons';

interface SidebarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    Dashboard: DashboardIcon,
    'New Order': NewOrderIcon,
    Orders: OrdersIcon,
    Products: ProductsIcon,
    Inventory: InventoryIcon,
    Suppliers: SupplierIcon,
    Discounts: DiscountIcon,
    Users: UsersIcon,
    Settings: SettingsIcon,
};


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const handleNavigation = (page: string) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) { // md breakpoint
            setOpen(false);
        }
    };

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white">CanteenOS</h1>
                 <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                    <CloseIcon className="h-6 w-6"/>
                </button>
            </div>
            <nav className="mt-4 flex-1 overflow-y-auto">
                {NAVIGATION_ITEMS.map((item) => {
                    const Icon = iconMap[item.name];
                    if (item.roles.includes(user.role)) {
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.page)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 transform ${
                                    currentPage === item.page
                                        ? 'bg-primary-700 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {Icon && <Icon className="h-5 w-5 mr-3" />}
                                <span>{item.name}</span>
                            </button>
                        );
                    }
                    return null;
                })}
            </nav>
            <div className="p-4 border-t border-gray-700">
                 <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 transition-colors duration-200 transform hover:bg-gray-700 hover:text-white"
                >
                    <LogoutIcon className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-800 text-white flex flex-col transition-transform transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
               {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;