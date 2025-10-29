
import { Role } from './types';

export const ROLES_HIERARCHY = {
    [Role.ADMIN]: [Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.STAFF],
    [Role.MANAGER]: [Role.MANAGER, Role.CASHIER, Role.STAFF],
    [Role.CASHIER]: [Role.CASHIER],
    [Role.STAFF]: [Role.STAFF],
};

export const NAVIGATION_ITEMS = [
    { name: 'Dashboard', page: 'Dashboard', roles: [Role.ADMIN, Role.MANAGER] },
    { name: 'New Order', page: 'NewOrder', roles: [Role.ADMIN, Role.MANAGER, Role.CASHIER] },
    { name: 'Orders', page: 'Orders', roles: [Role.ADMIN, Role.MANAGER, Role.CASHIER] },
    { name: 'Products', page: 'Products', roles: [Role.ADMIN, Role.MANAGER] },
    { name: 'Inventory', page: 'Inventory', roles: [Role.ADMIN, Role.MANAGER] },
    { name: 'Suppliers', page: 'Suppliers', roles: [Role.ADMIN, Role.MANAGER] },
    { name: 'Discounts', page: 'Discounts', roles: [Role.ADMIN, Role.MANAGER] },
    { name: 'Users', page: 'Users', roles: [Role.ADMIN] },
    { name: 'Settings', page: 'Settings', roles: [Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.STAFF] },
];
