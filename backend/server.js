require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;

if (!MONGO_URI || !JWT_SECRET) {
    console.error("FATAL ERROR: MONGO_URI and JWT_SECRET must be defined in .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

// --- MONGOOSE SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Cashier', 'Staff'], default: 'Staff' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    lastLogin: { type: Date, default: Date.now }
}, { toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; delete ret.password; } } });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    allergens: [String],
    supplier: String,
    expiryDate: String
}, { toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } } });
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    cashier: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } } });
const Order = mongoose.model('Order', OrderSchema);

const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: String,
    email: String
}, { toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } } });
const Supplier = mongoose.model('Supplier', SupplierSchema);

const DiscountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: String,
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } } });
const Discount = mongoose.model('Discount', DiscountSchema);


// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};


// --- API ROUTES ---
const router = express.Router();

// Auth Routes
router.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // First user gets Admin role, others get Cashier by default
        const isFirstUser = (await User.countDocuments()) === 0;
        const role = isFirstUser ? 'Admin' : 'Cashier';

        user = new User({ name, email, password, role });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Generic CRUD factory
const createCrudRoutes = (model, modelName) => {
    const crudRouter = express.Router();
    
    crudRouter.post('/', async (req, res) => {
        try {
            const item = new model(req.body);
            await item.save();
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: `Error creating ${modelName}`, error: error.message });
        }
    });

    crudRouter.get('/', async (req, res) => {
        try {
            const items = await model.find();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: `Error fetching ${modelName}s`, error: error.message });
        }
    });

    crudRouter.put('/:id', async (req, res) => {
        try {
            const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!item) return res.status(404).json({ message: `${modelName} not found` });
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: `Error updating ${modelName}`, error: error.message });
        }
    });

    crudRouter.delete('/:id', async (req, res) => {
        try {
            const item = await model.findByIdAndDelete(req.params.id);
            if (!item) return res.status(404).json({ message: `${modelName} not found` });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: `Error deleting ${modelName}`, error: error.message });
        }
    });

    return crudRouter;
};

// Use middleware for protected routes
router.use('/users', authMiddleware, createCrudRoutes(User, 'User'));
router.use('/products', authMiddleware, createCrudRoutes(Product, 'Product'));
router.use('/orders', authMiddleware, createCrudRoutes(Order, 'Order'));
router.use('/suppliers', authMiddleware, createCrudRoutes(Supplier, 'Supplier'));
router.use('/discounts', authMiddleware, createCrudRoutes(Discount, 'Discount'));

// Special Routes
router.patch('/products/:id/stock', authMiddleware, async (req, res) => {
    try {
        const { change } = req.body;
        if (typeof change !== 'number') {
            return res.status(400).json({ message: 'Stock change must be a number' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.stock += change;
        if (product.stock < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' });
        }
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
});


// Dashboard Routes
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
    try {
        const totalRevenue = (await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]))[0]?.total || 0;

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });

        // A simple way to count "new customers" could be unique customer names.
        const newCustomers = (await Order.distinct('customerName')).length;

        res.json({ totalRevenue, totalOrders, newCustomers, pendingOrders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

router.get('/dashboard/sales', authMiddleware, async (req, res) => {
     // Dummy data for now as it was in the mock
    res.json([
        { name: 'Mon', sales: 400.50 }, { name: 'Tue', sales: 300.25 },
        { name: 'Wed', sales: 500.00 }, { name: 'Thu', sales: 280.75 },
        { name: 'Fri', sales: 450.10 }, { name: 'Sat', sales: 600.90 },
        { name: 'Sun', sales: 550.60 },
    ]);
});

router.get('/dashboard/top-products', authMiddleware, async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', sales: { $sum: '$items.quantity' } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, name: '$_id', sales: '$sales' } }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top products', error: error.message });
    }
});


app.use('/api', router);

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});