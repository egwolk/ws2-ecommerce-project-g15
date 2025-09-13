const setupBodyParser = require('./bodyParser');
const setupSession = require('./session');
const setupViewEngine = require('./viewEngine');
const setupStaticFiles = require('./staticFiles');

function setupMiddleware(app) {
    setupBodyParser(app);
    setupSession(app);
    setupViewEngine(app);
    setupStaticFiles(app);
}

module.exports = setupMiddleware;