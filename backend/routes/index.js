const express = require('express');
const router = express.Router();
const ProductService = require('../services/products.services');

// Home route
router.get('/', async (req, res) => {
    try {
        // Get featured products (first 3 active products)
        const productService = new ProductService(req.app.locals.client, req.app.locals.dbName);
        const allProducts = await productService.getAllProducts();
        const featuredProducts = allProducts.slice(0, 3);
        
        res.render('index', { 
            title: "Home", 
            message: "Welcome to ",
            featuredProducts 
        });
    } catch (err) {
        console.error("Error loading featured products:", err);
        res.render('index', { 
            title: "Home", 
            message: "Welcome to ",
            featuredProducts: [] 
        });
    }
});

module.exports = router;