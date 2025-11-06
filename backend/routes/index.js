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

router.get('/about', (req, res) => {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    res.render('about', {
        title: 'About Me',
        name: 'Erin Drew Covacha',
        description: 'I am a web systems student building projects with Node.js,Express, and EJS.',
        metaPreset: 'about',
        canonicalUrl: `${baseUrl}/about`
    });
});

/* 500 testing
router.get('/crash', (req, res) => {
    throw new Error('Test crash');
});

router.get('/crash-async', async (req, res, next) => {
    try {
        throw new Error('Async crash');
    } catch (err) {
        next(err);
    }
});
*/

module.exports = router;