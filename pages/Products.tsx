
import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';
import { Product } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

// Fix: Define a type for the form state to handle allergens as a string
type ProductFormData = Omit<Partial<Product>, 'allergens'> & {
    allergens?: string;
};

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fix: Use the new form data type for the state
    const [currentProduct, setCurrentProduct] = useState<ProductFormData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            alert("Could not fetch products. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleOpenModal = (product: Partial<Product> | null = null) => {
        // Fix: Correctly convert allergens array to string for the form
        setCurrentProduct(product ? { ...product, allergens: product.allergens?.join(', ') } : { name: '', category: '', price: 0, stock: 0, allergens: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleSave = async () => {
        if (!currentProduct) return;

        if (!currentProduct.name?.trim() || !currentProduct.category?.trim()) {
            alert("Name and Category are required.");
            return;
        }
        if (currentProduct.price === undefined || currentProduct.price < 0) {
            alert("Price must be a non-negative number.");
            return;
        }
        if (currentProduct.stock === undefined || !Number.isInteger(currentProduct.stock) || currentProduct.stock < 0) {
            alert("Stock must be a non-negative integer.");
            return;
        }

        const productData = {
            ...currentProduct,
            // Fix: Correctly convert allergens string back to array for API
            allergens: typeof currentProduct.allergens === 'string' ? currentProduct.allergens.split(',').map(a => a.trim()).filter(Boolean) : []
        };

        try {
            if (currentProduct.id) {
                await updateProduct(productData as Product);
            } else {
                await addProduct(productData as Omit<Product, 'id'>);
            }
            await fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Failed to delete product. Please try again.");
                fetchProducts();
            }
        }
    };
    
    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        { header: 'Price', accessor: 'price', cell: (price: number) => `$${price.toFixed(2)}` },
        { header: 'Stock', accessor: 'stock' },
        { header: 'Allergens', accessor: 'allergens', cell: (allergens: string[]) => allergens.join(', ') },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                <Button onClick={() => handleOpenModal()}>Add Product</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                 <div className="mb-4">
                    <Input
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading products...</p> : <Table columns={columns} data={filteredProducts} onEdit={(product) => handleOpenModal(product)} onDelete={(product) => handleDelete(product.id)} />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentProduct?.id ? 'Edit Product' : 'Add Product'}>
                <div className="space-y-4">
                    <Input label="Name" value={currentProduct?.name || ''} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} required />
                    <Input label="Category" value={currentProduct?.category || ''} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} required />
                    <Input label="Price" type="number" step="0.01" min="0" value={currentProduct?.price ?? ''} onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} required />
                    <Input label="Stock" type="number" min="0" value={currentProduct?.stock ?? ''} onChange={(e) => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value, 10)})} required />
                    {/* Fix: Remove incorrect type assertion for value prop and update onChange */}
                    <Input label="Allergens (comma-separated)" value={currentProduct?.allergens || ''} onChange={(e) => setCurrentProduct({...currentProduct, allergens: e.target.value})} />
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
