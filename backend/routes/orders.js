const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const OrdersService = require('../services/orders.service');
const OrdersController = require('../controllers/orders.controller');

// Attach controller instance to request
router.use((req, res, next) => {
    const service = new OrdersService(req.app.locals.client, req.app.locals.dbName);
    req.ordersController = new OrdersController(service);
    next();
});

// POST /orders/checkout – create a new order
router.post('/checkout', requireLogin, (req, res) => req.ordersController.checkout(req, res));

module.exports = router;