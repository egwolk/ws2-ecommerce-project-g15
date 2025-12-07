const express = require('express');
const router = express.Router();
const ProductService = require('../services/products.services');
const https = require('https');

// Same-origin proxy for Chart.js to avoid third-party script blocking
let cachedChartJs = null;
router.get('/assets/chart.js', (req, res) => {
    if (cachedChartJs) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.send(cachedChartJs);
    }
    const url = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    https.get(url, (resp) => {
        if (resp.statusCode !== 200) {
            res.status(502).send('// Failed to fetch Chart.js');
            return;
        }
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            cachedChartJs = data;
            res.setHeader('Content-Type', 'application/javascript');
            res.send(cachedChartJs);
        });
    }).on('error', (err) => {
        console.error('Chart.js proxy error:', err);
        res.status(502).send('// Chart.js proxy error');
    });
});

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