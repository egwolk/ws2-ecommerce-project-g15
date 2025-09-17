function setupCacheControl(app) {
    app.use('/styles', (req, res, next) => {
        const maxAge = process.env.NODE_ENV === 'production' ? 31536000 : 3600; // 1 year in prod, 1 hour in dev
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
        res.removeHeader('Expires');
        next();
    });
    
    app.use('/scripts', (req, res, next) => {
        const maxAge = process.env.NODE_ENV === 'production' ? 31536000 : 3600; // 1 year in prod, 1 hour in dev
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
        res.removeHeader('Expires');
        next();
    });
    
    app.use('/assets', (req, res, next) => {
        const maxAge = process.env.NODE_ENV === 'production' ? 31536000 : 3600; // 1 year in prod, 1 hour in dev
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
        res.removeHeader('Expires');
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