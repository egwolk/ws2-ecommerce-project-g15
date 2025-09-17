// Security headers middleware
function setupSecurityHeaders(app) {
    // Add security headers to all responses
    app.use((req, res, next) => {
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Strict transport security (HTTPS only in production)
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        // Content Security Policy
        res.setHeader('Content-Security-Policy', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; " +
            "font-src 'self' https://fonts.cdnfonts.com; " +
            "img-src 'self' data: https: http:; " +
            "connect-src 'self';"
        );
        
        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    });
}

module.exports = setupSecurityHeaders;