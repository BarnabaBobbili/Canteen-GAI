import { User, Role, Product, Order, Supplier, Discount } from '../types';

// This is the URL for the backend server.
// The backend folder in this project contains a server that can be run locally.
// Make sure your backend server is running on this port.
const API_BASE_URL = 'http://localhost:3001/api';


// --- AUTH ---
export const apiLogin = async (email: string, pass: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });
        if (!response.ok) {
            return null;
        }
        // The backend should return { token: '...', user: { ... } }
        const data = await response.json();
        // You might want to store the token in localStorage for authenticated requests
        if (data.token) {
             localStorage.setItem('canteen-token', data.token);
        }
        return data.user;
    } catch (error) {
        console.error("API login failed:", error);
        return null;
    }
};

export const apiSignUp = async (name: string, email: string, pass: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass }),
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        if (data.token) {
             localStorage.setItem('canteen-token', data.token);
        }
        return data.user;
    } catch (error) {
        console.error("API signup failed:", error);
        return null;
    }
};

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('canteen-token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};


// --- USERS ---
export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
};

export const addUser = async (user: Omit<User, 'id' | 'lastLogin'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to add user');
    return await response.json();
};

export const updateUser = async (user: User): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete user');
};

// --- PRODUCTS ---
export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add product');
    return await response.json();
};

export const updateProduct = async (product: Product): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete product');
};

export const updateProductStock = async (productId: string, quantityChange: number): Promise<Product | null> => {
     const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`, { 
        method: 'PATCH', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ change: quantityChange }) 
    });
    if (!response.ok) throw new Error('Failed to update stock');
    return await response.json();
};

// --- ORDERS ---
export const getOrders = async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
};

export const addOrder = async (order: Omit<Order, 'id' | 'timestamp'>): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to add order');
    return await response.json();
};

export const updateOrder = async (order: Order): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return await response.json();
};

export const deleteOrder = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete order');
};

// --- SUPPLIERS ---
export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return await response.json();
};

export const addSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
     const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error('Failed to add supplier');
    return await response.json();
};

export const updateSupplier = async (supplier: Supplier): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplier.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error('Failed to update supplier');
    return await response.json();
};

export const deleteSupplier = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete supplier');
};

// --- DISCOUNTS ---
export const getDiscounts = async (): Promise<Discount[]> => {
    const response = await fetch(`${API_BASE_URL}/discounts`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch discounts');
    return await response.json();
};

export const addDiscount = async (discount: Omit<Discount, 'id'>): Promise<Discount> => {
    const response = await fetch(`${API_BASE_URL}/discounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(discount),
    });
    if (!response.ok) throw new Error('Failed to add discount');
    return await response.json();
};

export const updateDiscount = async (discount: Discount): Promise<Discount> => {
    const response = await fetch(`${API_BASE_URL}/discounts/${discount.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(discount),
    });
    if (!response.ok) throw new Error('Failed to update discount');
    return await response.json();
};

export const deleteDiscount = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete discount');
};

// --- DASHBOARD ---
export const getDashboardStats = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
};

export const getSalesData = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/sales`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch sales data');
    return await response.json();
};

export const getTopProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/top-products`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch top products');
    return await response.json();
};
