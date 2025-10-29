
export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  CASHIER = 'Cashier',
  STAFF = 'Staff',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    allergens: string[];
    supplier: string;
    expiryDate: string;
}

export interface Order {
    id: string;
    customerName: string;
    items: { productId: string; name: string; quantity: number; price: number }[];
    total: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    timestamp: string;
    cashier: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
}

export interface Discount {
    id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
}
