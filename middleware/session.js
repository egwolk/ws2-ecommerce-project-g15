const session = require('express-session');

function setupSession(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // set to true only if using HTTPS
            maxAge: 30 * 60 * 1000 // 30 minutes (in milliseconds)
        }
    }));
    
    // Session expiration check
    app.use((req, res, next) => {
        if (req.session.user) {
            const now = new Date();
            const expires = new Date(req.session.cookie._expires);
            if (now >= expires) {
                req.session.destroy();
                return res.redirect('/users/login?message=expired');
            }
        }
        next();
    });
}

module.exports = setupSession;