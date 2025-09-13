const session = require('express-session');
const MongoStore = require('connect-mongo');

function setupSession(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, 
            ttl: 30 * 60 
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 30 * 60 * 1000 
        }
    }));
}

module.exports = setupSession;