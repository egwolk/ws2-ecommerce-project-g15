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
// In debug mode, allow anonymous orders by skipping requireLogin
const maybeRequireLogin = (req, res, next) => {
    if (process.env.DEBUG_ALLOW_ANON_ORDER === 'true') return next();
    return requireLogin(req, res, next);
};
router.post('/checkout', maybeRequireLogin, (req, res) => req.ordersController.checkout(req, res));

module.exports = router;