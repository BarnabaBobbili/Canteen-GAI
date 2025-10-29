
import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, addOrder } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

interface NewOrderProps {
    setCurrentPage: (page: string) => void;
}

const NewOrder: React.FC<NewOrderProps> = ({ setCurrentPage }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProductsData = async () => {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
            setLoading(false);
        };
        fetchProductsData();
    }, []);
    
    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert("This product is out of stock.");
            return;
        }
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    alert("Cannot add more than available stock.");
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
    };
    
    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else if (newQuantity > product.stock) {
            alert("Cannot add more than available stock.");
        } else {
            setCart(cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
        }
    };
    
    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);
    
    const handlePlaceOrder = async () => {
        if (!customerName.trim()) {
            alert('Please enter a customer name.');
            return;
        }
        if (cart.length === 0) {
            alert('The order is empty.');
            return;
        }
        if (!user) {
            alert('You must be logged in to place an order.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addOrder({
                customerName,
                // Fix: The map was incorrectly removing the `name` property which is required by the Order type.
                items: cart,
                total,
                cashier: user.name,
                status: 'Completed',
            });
            alert('Order placed successfully!');
            setCart([]);
            setCustomerName('');
            setCurrentPage('Orders');
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('There was an error placing the order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">New Order (POS)</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow">
                         <Input 
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mb-4"
                        />
                        {loading ? <p>Loading products...</p> : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                               {filteredProducts.map(product => (
                                   <button 
                                      key={product.id}
                                      onClick={() => addToCart(product)}
                                      disabled={product.stock <= 0}
                                      className="border rounded-lg p-3 text-left hover:border-primary-500 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
                                   >
                                       <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                       <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                                       <p className={`text-xs font-medium ${product.stock > 20 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </p>
                                   </button>
                               ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Current Order</h2>
                         <Input 
                            label="Customer Name"
                            placeholder="Enter customer name"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="mb-4"
                        />
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {cart.length > 0 ? cart.map(item => (
                               <div key={item.productId} className="flex items-center justify-between text-sm">
                                   <div>
                                       <p className="font-medium text-gray-800">{item.name}</p>
                                       <p className="text-gray-500">${item.price.toFixed(2)}</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                                       <span>{item.quantity}</span>
                                       <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300">+</button>
                                   </div>
                               </div>
                            )) : <p className="text-gray-500 text-center py-4">No items in order.</p>}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full mt-4" onClick={handlePlaceOrder} disabled={isSubmitting || cart.length === 0}>
                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrder;
