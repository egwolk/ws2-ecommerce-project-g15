function setupSecurityHeaders(app) {
    app.disable('x-powered-by');
    
    app.use((req, res, next) => {
        // Skip security headers for static assets
        if (req.url.startsWith('/styles/') || 
            req.url.startsWith('/scripts/') || 
            req.url.startsWith('/assets/') ||
            req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            return next();
        }
        
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        res.setHeader('Content-Security-Policy', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; " +
            "font-src 'self' https://fonts.cdnfonts.com; " +
            "img-src 'self' data: https: http:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';"
        );
        
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    });
}

module.exports = setupSecurityHeaders;