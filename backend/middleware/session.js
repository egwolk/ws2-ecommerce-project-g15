const session = require('express-session');
const MongoStore = require('connect-mongo');

function setupSession(app) {
    const isProduction = process.env.NODE_ENV === 'production';
    
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
            secure: isProduction, // Only secure in production (HTTPS)
            httpOnly: true,
            maxAge: 30 * 60 * 1000, // 30 minutes
            sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
            domain: isProduction ? '.onrender.com' : undefined // Set domain for production
        },
        rolling: true, // Reset expiration on activity
        name: 'sessionId', // Custom session name for security
        proxy: isProduction // Trust proxy in production
    }));
}

module.exports = setupSession;