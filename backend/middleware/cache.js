const path = require('path');

// Cache control middleware for static files
function setupCacheControl(app) {
    // Cache static assets with proper headers
    app.use('/styles', (req, res, next) => {
        // CSS files - cache for 1 hour in development, 1 day in production
        const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
        
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        res.removeHeader('Expires'); // Remove Expires header, use Cache-Control instead
        
        // Add ETag for cache validation
        res.setHeader('ETag', `"${Date.now()}"`);
        
        next();
    });
    
    app.use('/scripts', (req, res, next) => {
        // JS files - cache for 1 hour in development, 1 day in production
        const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
        
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        res.removeHeader('Expires');
        res.setHeader('ETag', `"${Date.now()}"`);
        
        next();
    });
    
    // No cache for HTML pages (dynamic content)
    app.use((req, res, next) => {
        if (req.url.endsWith('.html') || req.url === '/' || !req.url.includes('.')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.removeHeader('Expires');
        }
        next();
    });
}

module.exports = setupCacheControl;