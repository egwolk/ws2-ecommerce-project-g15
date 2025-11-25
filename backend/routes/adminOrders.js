const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const AdminOrdersService = require('../services/adminOrders.service');
const AdminOrdersController = require('../controllers/adminOrders.controller');

// Attach controller instance to request
router.use((req, res, next) => {
    const service = new AdminOrdersService(req.app.locals.client, req.app.locals.dbName);
    req.adminOrdersController = new AdminOrdersController(service);
    next();
});

// GET /admin/orders – list all orders for admins
router.get('/orders', requireAdmin, (req, res) => req.adminOrdersController.listOrders(req, res));

module.exports = router;