const express = require('express');
const path = require('path');

function setupStaticFiles(app) {
    // Middleware to add security headers to static files (only necessary ones)
    const addSecurityHeaders = (req, res, next) => {
        // Only add headers that are appropriate for static assets
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        // Note: X-XSS-Protection is not needed for static assets like JS/CSS/fonts/images
        next();
    };

    app.use('/styles', addSecurityHeaders, express.static(path.join(__dirname, '../../frontend/styles')));
    app.use('/scripts', addSecurityHeaders, express.static(path.join(__dirname, '../../frontend/scripts')));
    app.use('/assets', addSecurityHeaders, express.static(path.join(__dirname, '../../frontend/assets')));
    
    // Ensure product images directory is properly served
    app.use('/assets/images/products', addSecurityHeaders, express.static(path.join(__dirname, '../../frontend/assets/images/products')));
}

module.exports = setupStaticFiles;