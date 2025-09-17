const path = require('path');

// Cache control middleware for static files
function setupCacheControl(app) {
    // Cache static assets with proper headers
    app.use('/styles', (req, res, next) => {
        // CSS files - cache for 1 hour in development, 1 day in production
        const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
        
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        // Remove deprecated Expires header completely
        res.removeHeader('Expires');
        
        // Add ETag for cache validation
        res.setHeader('ETag', `"${Date.now()}"`);
        
        next();
    });
    
    app.use('/scripts', (req, res, next) => {
        // JS files - cache for 1 hour in development, 1 day in production
        const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
        
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        // Remove deprecated Expires header completely
        res.removeHeader('Expires');
        res.setHeader('ETag', `"${Date.now()}"`);
        
        next();
    });
    
    // No cache for HTML pages (dynamic content) - updated without deprecated headers
    app.use((req, res, next) => {
        if (req.url.endsWith('.html') || req.url === '/' || !req.url.includes('.')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            // Remove deprecated Pragma header - it's no longer needed with modern Cache-Control
            // res.setHeader('Pragma', 'no-cache'); // REMOVED
            res.removeHeader('Expires');
        }
        next();
    });
}

module.exports = setupCacheControl;