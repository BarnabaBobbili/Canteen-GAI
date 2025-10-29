
import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrder, deleteOrder } from '../services/api';
import { Order } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

interface OrdersProps {
    setCurrentPage: (page: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ setCurrentPage }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersData = await getOrders();
            setOrders(ordersData);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            alert("Could not fetch orders. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        return orders.filter(order =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.cashier.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);

    const handleOpenModal = (order: Order) => {
        setCurrentOrder({ ...order });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentOrder(null);
    };

    const handleSaveStatus = async () => {
        if (!currentOrder) return;
        try {
            await updateOrder(currentOrder);
            await fetchOrders();
            handleCloseModal();
        } catch(error) {
            console.error("Failed to update order:", error);
            alert("Failed to update order. Please try again.");
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            try {
                await deleteOrder(id);
                setOrders(prev => prev.filter(o => o.id !== id));
            } catch (error) {
                console.error("Failed to delete order:", error);
                alert("Failed to delete order. Please try again.");
                fetchOrders();
            }
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Order ID', accessor: 'id', cell: (id: string) => `#${id.slice(-6)}`},
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Total', accessor: 'total', cell: (total: number) => `$${total.toFixed(2)}` },
        { header: 'Status', accessor: 'status', cell: (status: Order['status']) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                {status}
            </span>
        )},
        { header: 'Date', accessor: 'timestamp', cell: (ts: string) => new Date(ts).toLocaleString() },
        { header: 'Cashier', accessor: 'cashier' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                <Button onClick={() => setCurrentPage('NewOrder')}>Create New Order</Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <Input
                        placeholder="Search by Order ID, customer, or cashier..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {loading ? <p>Loading orders...</p> : <Table columns={columns} data={filteredOrders} onEdit={handleOpenModal} onDelete={(order: Order) => handleDelete(order.id)} />}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Order Details #${currentOrder?.id.slice(-6)}`}>
                {currentOrder && (
                    <>
                        <div className="space-y-4">
                            <div><strong>Customer:</strong> {currentOrder.customerName}</div>
                            <div><strong>Total:</strong> ${currentOrder.total.toFixed(2)}</div>
                            <div>
                                <strong>Items:</strong>
                                <ul className="list-disc list-inside mt-2 bg-gray-50 p-3 rounded">
                                    {currentOrder.items.map(item => (
                                        <li key={item.productId} className="flex justify-between">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <Select
                                label="Order Status"
                                value={currentOrder.status}
                                onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value as Order['status'] })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </Select>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button onClick={handleSaveStatus}>Save Status</Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
