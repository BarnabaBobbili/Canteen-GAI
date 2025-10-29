
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import { User, Role } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            alert("Could not fetch users. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleOpenModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user ? { ...user } : { name: '', email: '', role: Role.STAFF, status: 'Active' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = async () => {
        if (!currentUser) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!currentUser.name?.trim() || !currentUser.email?.trim()) {
            alert("Name and Email are required.");
            return;
        }
        if (!emailRegex.test(currentUser.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            if (currentUser.id) {
                await updateUser(currentUser as User);
            } else {
                await addUser(currentUser as Omit<User, 'id' | 'lastLogin'>);
            }
            await fetchUsers();
            handleCloseModal();
        } catch (error) {
             console.error("Failed to save user:", error);
             alert("Failed to save user. Please try again.");
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user. Please try again.");
                fetchUsers();
            }
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        { header: 'Status', accessor: 'status', cell: (status: 'Active' | 'Inactive') => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status}
            </span>
        )},
        { header: 'Last Login', accessor: 'lastLogin' },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <Button onClick={() => handleOpenModal()}>Add User</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading users...</p> : <Table columns={columns} data={filteredUsers} onEdit={(user) => handleOpenModal(user)} onDelete={(user) => handleDelete(user.id)} />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser?.id ? 'Edit User' : 'Add User'}>
                <div className="space-y-4">
                    <Input label="Name" value={currentUser?.name || ''} onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})} required />
                    <Input label="Email" type="email" value={currentUser?.email || ''} onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})} required />
                    <Select label="Role" value={currentUser?.role || ''} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as Role})}>
                        {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                    </Select>
                     <Select label="Status" value={currentUser?.status || ''} onChange={(e) => setCurrentUser({...currentUser, status: e.target.value as 'Active' | 'Inactive'})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </Select>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
