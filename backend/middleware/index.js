const setupSession = require('./session');
const setupBodyParser = require('./bodyParser');
const setupStaticFiles = require('./staticFiles');
const setupViewEngine = require('./viewEngine');
const setupSecurityHeaders = require('./security');
const setupCacheControl = require('./cache');
const auth = require('./auth');
const currentPage = require('./currentPage');

function setupMiddleware(app) {
    // Security headers should be FIRST to ensure they apply to all responses
    setupSecurityHeaders(app);
    
    // Cache control for static files (after security, before session)
    setupCacheControl(app);
    
    // Session and other middleware
    setupSession(app);
    setupBodyParser(app);
    setupStaticFiles(app);
    setupViewEngine(app);
    currentPage(app);
    app.use(auth.addAuthDataToLocals);
}

module.exports = setupMiddleware;