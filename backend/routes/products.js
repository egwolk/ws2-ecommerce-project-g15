const express = require('express');
const router = express.Router();
const ProductService = require('../services/products.services');
const ProductController = require('../controllers/products.controller');

// Create controller with app.locals when router is used
router.use((req, res, next) => {
    if (!req.productController) {
        const productService = new ProductService(req.app.locals.client, req.app.locals.dbName);
        req.productController = new ProductController(productService);
    }
    next();
});

// Admin routes FIRST (before parameterized routes)
router.get('/admin', (req, res) => req.productController.showAdminProducts(req, res));
router.get('/admin/create', (req, res) => req.productController.showCreateForm(req, res));
router.post('/admin/create', (req, res) => req.productController.createProduct(req, res));
router.get('/admin/:id/edit', (req, res) => req.productController.showEditForm(req, res));
router.post('/admin/:id/edit', (req, res) => req.productController.updateProduct(req, res));
router.post('/admin/:id/delete', (req, res) => req.productController.deleteProduct(req, res));

// Public product routes AFTER (parameterized routes last)
router.get('/', (req, res) => req.productController.showAllProducts(req, res));
router.get('/:id', (req, res) => req.productController.showProduct(req, res));

module.exports = router;