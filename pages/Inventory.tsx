
import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, updateProductStock } from '../services/api';
import { Product } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface StockTransaction {
    productId: string;
    type: 'Inflow' | 'Outflow';
    quantity: number;
}

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transaction, setTransaction] = useState<Partial<StockTransaction>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleOpenModal = () => {
        setTransaction({ type: 'Inflow', quantity: 0, productId: products.length > 0 ? products[0].id : '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTransaction({});
    };

    const handleSave = async () => {
        if (!transaction.productId || !transaction.type || !transaction.quantity || transaction.quantity <= 0) {
            alert("Please fill all fields with valid values.");
            return;
        }
        
        const quantityChange = transaction.type === 'Inflow' ? transaction.quantity : -transaction.quantity;
        
        const currentProduct = products.find(p => p.id === transaction.productId);
        if (transaction.type === 'Outflow' && currentProduct && currentProduct.stock < transaction.quantity) {
             alert("Cannot record outflow. Not enough stock.");
             return;
        }

        await updateProductStock(transaction.productId, quantityChange);

        await fetchProducts();
        handleCloseModal();
    };

    const getStatus = (product: Product) => {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (expiryDate < today) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Expired</span>;
        }
        if (product.stock <= 20) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Low Stock</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>;
    };
    
    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        { header: 'Stock', accessor: 'stock' },
        { header: 'Supplier', accessor: 'supplier' },
        { header: 'Expiry Date', accessor: 'expiryDate' },
        { header: 'Status', accessor: 'id', cell: (_: any, product: Product) => getStatus(product) },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                <Button onClick={handleOpenModal}>Update Stock</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <Input
                        placeholder="Search by name, category, or supplier..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading inventory...</p> : <Table columns={columns} data={filteredProducts} />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Update Stock">
                <div className="space-y-4">
                     <Select label="Product" value={transaction.productId || ''} onChange={(e) => setTransaction({...transaction, productId: e.target.value})}>
                        {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                    </Select>
                     <Select label="Transaction Type" value={transaction.type || 'Inflow'} onChange={(e) => setTransaction({...transaction, type: e.target.value as 'Inflow' | 'Outflow'})}>
                        <option value="Inflow">Inflow (Add Stock)</option>
                        <option value="Outflow">Outflow (Wastage/Correction)</option>
                    </Select>
                    <Input label="Quantity" type="number" min="1" value={transaction.quantity || ''} onChange={(e) => setTransaction({...transaction, quantity: parseInt(e.target.value, 10)})} />
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save Transaction</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Inventory;