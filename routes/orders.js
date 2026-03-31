const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// User routes (protected)
router.post('/', authenticateToken, orderController.createOrder);
router.get('/user/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, authorizeAdmin, orderController.updateOrderStatus);
router.get('/admin/stats', authenticateToken, authorizeAdmin, orderController.getOrderStats);

module.exports = router;
