function setupSecurityHeaders(app) {
    app.disable('x-powered-by');
    
    app.use((req, res, next) => {
        // Skip security headers for static file routes (they have their own headers)
        if (req.url.startsWith('/styles/') || 
            req.url.startsWith('/scripts/') || 
            req.url.startsWith('/assets/')) {
            return next();
        }
        
        // Full security headers for HTML pages and API routes only
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        res.setHeader('Content-Security-Policy', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "font-src 'self'; " +
            "img-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';"
        );
        
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    });
}

module.exports = setupSecurityHeaders;