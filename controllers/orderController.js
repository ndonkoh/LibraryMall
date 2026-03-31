const db = require('../config/jsonDatabase');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { order_type, items } = req.body;
        const userid = req.user.userid;

        if (!order_type || !items || items.length === 0) {
            return res.status(400).json({ status: false, message: 'Order type and items required' });
        }

        if (!['loan', 'buy'].includes(order_type)) {
            return res.status(400).json({ status: false, message: 'Invalid order type' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];
        
        for (let item of items) {
            const book = await db.getBookById(item.book_id);
            if (book) {
                totalAmount += book.price * item.quantity;
                orderItems.push({
                    book_id: item.book_id,
                    quantity: item.quantity,
                    price: book.price,
                    book: book
                });
                
                // Update book quantity for loans
                if (order_type === 'loan') {
                    await db.updateBook(item.book_id, {
                        quantity: book.quantity - item.quantity
                    });
                }
            }
        }

        // Create order
        const newOrder = await db.createOrder({
            userid,
            order_type,
            amount: totalAmount,
            items: orderItems
        });

        if (!newOrder) {
            return res.status(500).json({ status: false, message: 'Failed to create order' });
        }

        res.status(201).json({
            status: true,
            message: 'Order created successfully',
            order_id: newOrder.order_id
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ status: false, message: 'Failed to create order' });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const userid = req.user.userid;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const orders = await db.getOrdersByUserId(userid);
        
        // Sort by order_date descending
        orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        // Apply pagination
        const paginatedOrders = orders.slice(offset, offset + parseInt(limit));
        const total = orders.length;

        res.json({
            status: true,
            orders: paginatedOrders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch orders' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await db.getOrders();
        const order = orders.find(o => o.order_id === parseInt(id));

        if (!order) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }

        // Get user information
        const user = await db.getUserById(order.userid);
        if (user) {
            order.username = user.username;
            order.email = user.email;
        }

        res.json({ status: true, data: order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch order' });
    }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'completed', 'rejected'].includes(status)) {
            return res.status(400).json({ status: false, message: 'Invalid status' });
        }

        const success = await db.updateOrder(id, { status });
        if (!success) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }

        res.json({ status: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ status: false, message: 'Failed to update order' });
    }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let orders = await db.getOrders();
        
        // Filter by status if provided
        if (status) {
            orders = orders.filter(order => order.status === status);
        }

        // Sort by order_date descending
        orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        // Add user information
        for (let order of orders) {
            const user = await db.getUserById(order.userid);
            if (user) {
                order.username = user.username;
            }
        }

        // Apply pagination
        const paginatedOrders = orders.slice(offset, offset + parseInt(limit));
        const total = orders.length;

        res.json({
            status: true,
            data: paginatedOrders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch orders' });
    }
};

// Get order stats (Admin)
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await db.getOrderStats();
        
        res.json({
            status: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch stats' });
    }
};
