const session = require('express-session');
const MongoStore = require('connect-mongo');

function setupSession(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, 
            ttl: 30 * 60, // 30 minutes
            touchAfter: 24 * 3600 // lazy session update
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Only secure in production (HTTPS)
            httpOnly: true,
            maxAge: 30 * 60 * 1000, // 30 minutes
            sameSite: 'lax' // Add this for better security and compatibility
        },
        rolling: true, // Reset expiration on activity
        name: 'sessionId' // Custom session name for security
    }));
}

module.exports = setupSession;