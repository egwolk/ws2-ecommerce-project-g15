const helmet = require('helmet')
const compression = require('compression')

function setupSecurityHeaders(app) {
    // Trust proxy if in production (for Render, Heroku, etc.)
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    
    // Compression middleware
    app.use(compression());
    
    // Helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: {
           directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://challenges.cloudflare.com"
                ],
                frameSrc: [
                    "'self'",
                    "https://challenges.cloudflare.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://challenges.cloudflare.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'"
                ],
                fontSrc: [
                    "'self'",
                    "data:"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https:",
                    "http:"
                ]
           }
        }
    }));
    app.disable('x-powered-by');
    
}

module.exports = setupSecurityHeaders;