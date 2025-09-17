const setupSession = require('./session');
const setupBodyParser = require('./bodyParser');
const setupStaticFiles = require('./staticFiles');
const setupViewEngine = require('./viewEngine');
const setupSecurityHeaders = require('./security');
const setupCacheControl = require('./cache');
const auth = require('./auth');
const currentPage = require('./currentPage');

function setupMiddleware(app) {
    // Security headers should be first
    setupSecurityHeaders(app);
    
    // Cache control for static files
    setupCacheControl(app);
    
    setupSession(app);
    setupBodyParser(app);
    setupStaticFiles(app);
    setupViewEngine(app);
    currentPage(app);
    app.use(auth.addAuthDataToLocals);
}

module.exports = setupMiddleware;