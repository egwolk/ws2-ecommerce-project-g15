const setupSession = require('./session');
const setupBodyParser = require('./bodyParser');
const setupStaticFiles = require('./staticFiles');
const setupViewEngine = require('./viewEngine');
const { addAuthDataToLocals } = require('./auth');

function setupMiddleware(app) {
    setupSession(app);
    setupBodyParser(app);
    setupStaticFiles(app);
    setupViewEngine(app);
    
    app.use(addAuthDataToLocals);
}

module.exports = setupMiddleware;