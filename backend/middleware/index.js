const setupSession = require('./session');
const setupBodyParser = require('./bodyParser');
const setupStaticFiles = require('./staticFiles');
const setupViewEngine = require('./viewEngine');
const auth = require('./auth');
const currentPage = require('./currentPage');

function setupMiddleware(app) {
    setupSession(app);
    setupBodyParser(app);
    setupStaticFiles(app);
    setupViewEngine(app);
    currentPage(app);
    app.use(auth.addAuthDataToLocals);
}

module.exports = setupMiddleware;