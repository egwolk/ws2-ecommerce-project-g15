const session = require('express-session');
const MongoStore = require('connect-mongo');

function setupSession(app) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const sessionConfig = {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, 
            ttl: 30 * 60,
            touchAfter: 24 * 3600
        }),
        cookie: {
            httpOnly: true,
            maxAge: 30 * 60 * 1000,
            rolling: true
        },
        name: 'sessionId',
    };
    
    // Production-specific settings
    if (isProduction) {
        app.set('trust proxy', 1); // Trust first proxy
        sessionConfig.cookie.secure = true; // Require HTTPS
        sessionConfig.cookie.sameSite = 'lax';
        sessionConfig.proxy = true;
    }
    
    app.use(session(sessionConfig));
    app.use((req, res, next) => {
        res.locals.user = req.session?.user || null;
        next();
    });
}

module.exports = setupSession;