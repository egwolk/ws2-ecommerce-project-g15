function setupCacheControl(app) {
    app.use('/styles', (req, res, next) => {
        // Temporarily disable caching to force refresh after local asset migration
        res.setHeader('Cache-Control', 'no-cache');
        res.removeHeader('Expires');
        res.setHeader('ETag', `"${Date.now()}"`);
        next();
    });
    
    app.use('/scripts', (req, res, next) => {
        const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        res.removeHeader('Expires');
        res.setHeader('ETag', `"${Date.now()}"`);
        next();
    });
    
    app.use((req, res, next) => {
        if (req.url.endsWith('.html') || req.url === '/' || !req.url.includes('.')) {
            res.setHeader('Cache-Control', 'no-cache');
            res.removeHeader('Expires');
        }
        next();
    });
}

module.exports = setupCacheControl;