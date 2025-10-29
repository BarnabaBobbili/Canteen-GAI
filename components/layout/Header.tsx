
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MenuIcon } from '../icons';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none md:hidden">
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Welcome, {user?.name}!</h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
                <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`https://i.pravatar.cc/150?u=${user?.email}`}
                    alt="User avatar"
                />
            </div>
        </header>
    );
};

export default Header;