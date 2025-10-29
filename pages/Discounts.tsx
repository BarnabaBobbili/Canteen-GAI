
import React, { useState, useEffect, useMemo } from 'react';
import { getDiscounts, addDiscount, updateDiscount, deleteDiscount } from '../services/api';
import { Discount } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Discounts: React.FC = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState<Partial<Discount> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const data = await getDiscounts();
            setDiscounts(data);
        } catch (error) {
            console.error("Failed to fetch discounts:", error);
            alert("Could not fetch discounts. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const filteredDiscounts = useMemo(() => {
        if (!searchTerm) return discounts;
        return discounts.filter(discount =>
            discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            discount.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [discounts, searchTerm]);

    const handleOpenModal = (discount: Partial<Discount> | null = null) => {
        setCurrentDiscount(discount ? { ...discount } : { code: '', description: '', type: 'percentage', value: 0, isActive: true });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentDiscount(null);
    };

    const handleSave = async () => {
        if (!currentDiscount) return;
        
        const code = currentDiscount.code?.trim();
        const description = currentDiscount.description?.trim();

        if (!code || !description || currentDiscount.value === undefined || currentDiscount.value < 0) {
             alert("Please fill all required fields with valid values.");
             return;
        }

        const discountData = { ...currentDiscount, code, description };
        try {
            if (currentDiscount.id) {
                await updateDiscount(discountData as Discount);
            } else {
                await addDiscount(discountData as Omit<Discount, 'id'>);
            }
            await fetchDiscounts();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save discount:", error);
            alert("Failed to save discount. Please try again.");
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this discount?")) {
            try {
                await deleteDiscount(id);
                setDiscounts(prev => prev.filter(d => d.id !== id));
            } catch (error) {
                console.error("Failed to delete discount:", error);
                alert("Failed to delete discount. Please try again.");
                fetchDiscounts();
            }
        }
    };

    const columns = [
        { header: 'Code', accessor: 'code' },
        { header: 'Description', accessor: 'description' },
        { header: 'Type', accessor: 'type' },
        { header: 'Value', accessor: 'value', cell: (value: number, item: Discount) => (
            item.type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`
        )},
        { header: 'Status', accessor: 'isActive', cell: (isActive: boolean) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        )},
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Discount Management</h1>
                <Button onClick={() => handleOpenModal()}>Add Discount</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <Input
                        placeholder="Search by code or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading discounts...</p> : <Table columns={columns} data={filteredDiscounts} onEdit={(d) => handleOpenModal(d)} onDelete={(d) => handleDelete(d.id)} />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentDiscount?.id ? 'Edit Discount' : 'Add Discount'}>
                <div className="space-y-4">
                    <Input label="Discount Code" value={currentDiscount?.code || ''} onChange={(e) => setCurrentDiscount({...currentDiscount, code: e.target.value.toUpperCase().replace(/\s/g, '')})} />
                    <Input label="Description" value={currentDiscount?.description || ''} onChange={(e) => setCurrentDiscount({...currentDiscount, description: e.target.value})} />
                    <Select label="Type" value={currentDiscount?.type || 'percentage'} onChange={(e) => setCurrentDiscount({...currentDiscount, type: e.target.value as 'percentage' | 'fixed'})}>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                    </Select>
                    <Input label="Value" type="number" min="0" value={currentDiscount?.value ?? ''} onChange={(e) => setCurrentDiscount({...currentDiscount, value: parseFloat(e.target.value)})} />
                    <div className="flex items-center">
                        <input
                            id="isActive"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            checked={currentDiscount?.isActive || false}
                            onChange={(e) => setCurrentDiscount({...currentDiscount, isActive: e.target.checked})}
                        />
                         <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Discounts;
