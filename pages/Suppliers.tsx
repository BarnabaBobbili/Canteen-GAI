
import React, { useState, useEffect, useMemo } from 'react';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../services/api';
import { Supplier } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const suppliersData = await getSuppliers();
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            alert("Could not fetch suppliers. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers;
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const handleOpenModal = (supplier: Partial<Supplier> | null = null) => {
        setCurrentSupplier(supplier ? { ...supplier } : { name: '', contactPerson: '', phone: '', email: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSupplier(null);
    };

    const handleSave = async () => {
        if (!currentSupplier) return;
        
        const trimmedSupplier = {
            ...currentSupplier,
            name: currentSupplier.name?.trim(),
            contactPerson: currentSupplier.contactPerson?.trim(),
            phone: currentSupplier.phone?.trim(),
            email: currentSupplier.email?.trim(),
        };

        if (!trimmedSupplier.name || !trimmedSupplier.contactPerson || !trimmedSupplier.phone || !trimmedSupplier.email) {
            alert("Please fill all fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedSupplier.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            if (trimmedSupplier.id) {
                await updateSupplier(trimmedSupplier as Supplier);
            } else {
                await addSupplier(trimmedSupplier as Omit<Supplier, 'id'>);
            }
            await fetchSuppliers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save supplier:", error);
            alert("Failed to save supplier. Please try again.");
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await deleteSupplier(id);
                setSuppliers(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error("Failed to delete supplier:", error);
                alert("Failed to delete supplier. Please try again.");
                fetchSuppliers();
            }
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Contact Person', accessor: 'contactPerson' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
                <Button onClick={() => handleOpenModal()}>Add Supplier</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <Input
                        placeholder="Search by name, contact, or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading suppliers...</p> : <Table columns={columns} data={filteredSuppliers} onEdit={(supplier) => handleOpenModal(supplier)} onDelete={(supplier) => handleDelete(supplier.id)} />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentSupplier?.id ? 'Edit Supplier' : 'Add Supplier'}>
                <div className="space-y-4">
                    <Input label="Supplier Name" value={currentSupplier?.name || ''} onChange={(e) => setCurrentSupplier({...currentSupplier, name: e.target.value})} required/>
                    <Input label="Contact Person" value={currentSupplier?.contactPerson || ''} onChange={(e) => setCurrentSupplier({...currentSupplier, contactPerson: e.target.value})} required/>
                    <Input label="Phone" type="tel" value={currentSupplier?.phone || ''} onChange={(e) => setCurrentSupplier({...currentSupplier, phone: e.target.value})} required/>
                    <Input label="Email" type="email" value={currentSupplier?.email || ''} onChange={(e) => setCurrentSupplier({...currentSupplier, email: e.target.value})} required/>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Suppliers;
