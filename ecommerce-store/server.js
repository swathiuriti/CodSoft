const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend UI assets
app.use(express.static(path.join(__dirname, '../public')));

// In-Memory Database Store for Products
let products = [
    { id: 1, name: "Wireless Headphones", category: "Electronics", price: 99.99, icon: "🎧" },
    { id: 2, name: "Smart Watch", category: "Electronics", price: 199.99, icon: "⌚" },
    { id: 3, name: "Running Shoes", category: "Footwear", price: 79.50, icon: "👟" },
    { id: 4, name: "Leather Backpack", category: "Accessories", price: 120.00, icon: "🎒" },
    { id: 5, name: "Mechanical Keyboard", category: "Electronics", price: 149.99, icon: "⌨️" }
];

// In-Memory Orders Database
let orders = [];

// GET: Fetch all products with search & category filter support
app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let filtered = products;

    if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
    }

    if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    res.json(filtered);
});

// POST: Mock Payment Integration & Order Checkout
app.post('/api/checkout', (req, res) => {
    const { items, totalAmount, paymentDetails } = req.body;

    if (!items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: "Shopping cart is empty!" });
    }

    const newOrder = {
        orderId: `ORD-${Date.now()}`,
        items,
        totalAmount,
        paymentStatus: "SUCCESS",
        timestamp: new Date()
    };

    orders.push(newOrder);

    res.status(200).json({
        message: "Payment processed successfully!",
        order: newOrder
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`E-Commerce Server running at http://localhost:${PORT}`);
});